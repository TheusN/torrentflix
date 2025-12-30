import express from 'express';
import WebTorrent from 'webtorrent';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const client = new WebTorrent();

// Trackers públicos para melhorar descoberta de peers
const PUBLIC_TRACKERS = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.stealth.si:80/announce',
    'udp://tracker.torrent.eu.org:451/announce',
    'udp://tracker.bittor.pw:1337/announce',
    'udp://public.popcorn-tracker.org:6969/announce',
    'udp://tracker.dler.org:6969/announce',
    'udp://exodus.desync.com:6969/announce',
    'udp://open.demonii.com:1337/announce',
    'wss://tracker.openwebtorrent.com',
    'wss://tracker.btorrent.xyz',
    'wss://tracker.webtorrent.dev'
];

function addTrackersToMagnet(magnetUri) {
    let result = magnetUri;
    for (const tracker of PUBLIC_TRACKERS) {
        if (!magnetUri.includes(encodeURIComponent(tracker))) {
            result += '&tr=' + encodeURIComponent(tracker);
        }
    }
    return result;
}

// Armazena torrents ativos
const activeTorrents = new Map();

// ========== LOGGING ==========
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '\x1b[36m',    // cyan
        success: '\x1b[32m', // green
        error: '\x1b[31m',   // red
        warn: '\x1b[33m'     // yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}[${timestamp}] ${message}${reset}`);
}

// Middleware de logging
app.use((req, res, next) => {
    log(`${req.method} ${req.url}`, 'info');
    next();
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Rota de teste
app.get('/api/health', (req, res) => {
    log('Health check OK', 'success');
    res.json({ status: 'ok', torrents: client.torrents.length });
});

// Adiciona um torrent
app.post('/api/torrent', async (req, res) => {
    const { magnetUri } = req.body;
    log('Recebido pedido para adicionar torrent', 'info');

    if (!magnetUri) {
        log('ERRO: magnetUri nao fornecido', 'error');
        return res.status(400).json({ error: 'magnetUri is required' });
    }

    log(`Magnet: ${magnetUri.substring(0, 60)}...`, 'info');

    // Extrai o infoHash do magnet link
    const infoHashMatch = magnetUri.match(/btih:([a-fA-F0-9]{40})/i);
    const infoHash = infoHashMatch ? infoHashMatch[1].toLowerCase() : null;
    log(`InfoHash extraido: ${infoHash}`, 'info');

    // Verifica se ja existe no Map de torrents prontos
    if (infoHash && activeTorrents.has(infoHash)) {
        const existingTorrent = activeTorrents.get(infoHash);
        if (existingTorrent.files && existingTorrent.files.length > 0) {
            log(`Torrent ja existe e pronto no cache: ${existingTorrent.name}`, 'success');
            return res.json({
                infoHash: existingTorrent.infoHash,
                name: existingTorrent.name,
                files: existingTorrent.files.map((f, i) => ({
                    index: i,
                    name: f.name,
                    size: f.length,
                    path: f.path
                }))
            });
        }
    }

    // Verifica se ja existe no client com files prontos
    if (infoHash) {
        const existingTorrent = client.get(infoHash);

        // Se existe e tem files, salva no Map e retorna
        if (existingTorrent && existingTorrent.files && existingTorrent.files.length > 0) {
            activeTorrents.set(infoHash, existingTorrent);
            log(`Torrent ja existe no client: ${existingTorrent.name}`, 'success');
            return res.json({
                infoHash: existingTorrent.infoHash,
                name: existingTorrent.name,
                files: existingTorrent.files.map((f, i) => ({
                    index: i,
                    name: f.name,
                    size: f.length,
                    path: f.path
                }))
            });
        }

        // Se existe mas sem files, aguarda metadata
        if (existingTorrent) {
            log('Torrent existe, aguardando metadata...', 'warn');
            // Continua para aguardar os eventos
        }
    }

    log('Adicionando novo torrent...', 'info');

    // Adiciona trackers públicos ao magnet
    const magnetWithTrackers = addTrackersToMagnet(magnetUri);
    log(`Magnet com trackers: ${magnetWithTrackers.substring(0, 100)}...`, 'info');

    const torrent = client.add(magnetWithTrackers, { path: './downloads' });

    // Eventos de debug para acompanhar conexão
    torrent.on('infoHash', () => {
        log(`InfoHash obtido: ${torrent.infoHash}`, 'info');
    });

    torrent.on('warning', (err) => {
        log(`Aviso: ${err.message || err}`, 'warn');
    });

    torrent.on('error', (err) => {
        log(`Erro no torrent: ${err.message}`, 'error');
    });

    torrent.on('wire', (wire) => {
        log(`Wire conectado: ${wire.remoteAddress}`, 'success');
    });

    // Log de peers a cada 5 segundos
    const peerLogInterval = setInterval(() => {
        log(`Peers conectados: ${torrent.numPeers}, Progress: ${(torrent.progress * 100).toFixed(2)}%`, 'info');
    }, 5000);

    torrent.on('metadata', () => {
        clearInterval(peerLogInterval);
        log(`Metadata recebido! Nome: ${torrent.name}`, 'success');
    });

    torrent.on('ready', () => {
        clearInterval(peerLogInterval);
        activeTorrents.set(torrent.infoHash, torrent);

        log(`SUCESSO! Torrent pronto: ${torrent.name}`, 'success');
        log(`InfoHash: ${torrent.infoHash}`, 'info');
        log(`Arquivos: ${torrent.files.length}`, 'info');

        torrent.files.forEach((f, i) => {
            log(`  [${i}] ${f.name} (${(f.length / 1024 / 1024).toFixed(2)} MB)`, 'info');
        });

        if (!res.headersSent) {
            res.json({
                infoHash: torrent.infoHash,
                name: torrent.name,
                files: torrent.files.map((f, i) => ({
                    index: i,
                    name: f.name,
                    size: f.length,
                    path: f.path
                }))
            });
        }
    });

    // Timeout se nao conseguir metadata (120 segundos)
    setTimeout(() => {
        if (!res.headersSent) {
            log('TIMEOUT: Nao conseguiu obter metadata em 120s', 'error');
            res.status(408).json({ error: 'Timeout ao obter metadata do torrent. Verifique se o magnet link e valido e se ha seeds disponiveis.' });
        }
    }, 120000);
});

// Eventos globais de debug do WebTorrent
client.on('error', (err) => {
    log(`ERRO WebTorrent: ${err.message}`, 'error');
});

// Stream de um arquivo
app.get('/api/stream/:infoHash/:fileIndex', (req, res) => {
    const { infoHash, fileIndex } = req.params;
    log(`Stream solicitado: ${infoHash} / arquivo ${fileIndex}`, 'info');

    // Primeiro tenta pegar do Map de torrents prontos
    let torrent = activeTorrents.get(infoHash);

    // Se nao estiver no Map, tenta pegar do client
    if (!torrent) {
        torrent = client.get(infoHash);
    }

    if (!torrent) {
        log('ERRO: Torrent nao encontrado', 'error');
        return res.status(404).json({ error: 'Torrent not found' });
    }

    // Verifica se files existe
    if (!torrent.files || torrent.files.length === 0) {
        log('ERRO: Torrent ainda carregando metadata, aguarde...', 'warn');
        return res.status(503).json({ error: 'Torrent still loading metadata, please wait and try again' });
    }

    const file = torrent.files[parseInt(fileIndex)];
    if (!file) {
        log(`ERRO: Arquivo ${fileIndex} nao encontrado. Total de arquivos: ${torrent.files.length}`, 'error');
        return res.status(404).json({ error: 'File not found' });
    }

    log(`Streaming: ${file.name} (${(file.length / 1024 / 1024).toFixed(2)} MB)`, 'success');

    const range = req.headers.range;
    const fileSize = file.length;

    // Determina o content-type
    const ext = path.extname(file.name).toLowerCase();
    const mimeTypes = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.mp3': 'audio/mpeg',
        '.ogg': 'audio/ogg',
        '.wav': 'audio/wav',
        '.flac': 'audio/flac'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (range) {
        // Streaming com range requests (necessario para seeking)
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        log(`Range request: bytes ${start}-${end}/${fileSize}`, 'info');

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': contentType
        });

        const stream = file.createReadStream({ start, end });

        // Tratamento de erros no stream
        stream.on('error', (err) => {
            log(`Erro no stream: ${err.message}`, 'error');
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error' });
            }
        });

        // Limpa o stream quando a conexão é fechada
        res.on('close', () => {
            stream.destroy();
        });

        stream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType
        });

        const stream = file.createReadStream();

        // Tratamento de erros no stream
        stream.on('error', (err) => {
            log(`Erro no stream: ${err.message}`, 'error');
            if (!res.headersSent) {
                res.status(500).json({ error: 'Stream error' });
            }
        });

        // Limpa o stream quando a conexão é fechada
        res.on('close', () => {
            stream.destroy();
        });

        stream.pipe(res);
    }
});

// Status do torrent
app.get('/api/torrent/:infoHash/status', (req, res) => {
    const { infoHash } = req.params;
    const torrent = client.get(infoHash);

    if (!torrent) {
        return res.status(404).json({ error: 'Torrent not found' });
    }

    res.json({
        name: torrent.name,
        progress: torrent.progress,
        downloadSpeed: torrent.downloadSpeed,
        uploadSpeed: torrent.uploadSpeed,
        numPeers: torrent.numPeers,
        downloaded: torrent.downloaded,
        uploaded: torrent.uploaded,
        timeRemaining: torrent.timeRemaining,
        done: torrent.done
    });
});

// Lista todos os torrents
app.get('/api/torrents', (req, res) => {
    const torrents = client.torrents.map(t => ({
        infoHash: t.infoHash,
        name: t.name,
        progress: t.progress,
        numPeers: t.numPeers
    }));
    res.json(torrents);
});

// Remove um torrent
app.delete('/api/torrent/:infoHash', (req, res) => {
    const { infoHash } = req.params;
    const torrent = client.get(infoHash);

    if (!torrent) {
        return res.status(404).json({ error: 'Torrent not found' });
    }

    torrent.destroy(() => {
        activeTorrents.delete(infoHash);
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║           TorrentFlix Server Iniciado!                ║
╠═══════════════════════════════════════════════════════╣
║  Acesse: http://localhost:${PORT}                       ║
║  Abra: index.html no navegador                        ║
╚═══════════════════════════════════════════════════════╝
    `);
});
