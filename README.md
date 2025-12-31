# TorrentFlix

Dashboard unificado para gerenciamento de media, integrando qBittorrent, Jackett, Sonarr e Radarr.

## Stack

- **Backend:** Node.js + Express + TypeScript
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Database:** PostgreSQL + Sequelize
- **Auth:** JWT (access + refresh tokens)

## Funcionalidades

- Autenticacao JWT com refresh tokens
- Dashboard com status dos servicos
- Busca de torrents via Jackett
- Gerenciamento de downloads via qBittorrent
- Streaming de video com suporte a range requests
- Integracao com Sonarr (series) e Radarr (filmes)
- Informacoes de midia via TMDB API

## Requisitos

- Node.js 20+
- PostgreSQL 16+
- Docker (opcional)
- Servicos *arr configurados:
  - qBittorrent
  - Jackett
  - Sonarr
  - Radarr

## Instalacao

### Desenvolvimento Local

1. Clone o repositorio:
```bash
git clone https://github.com/seu-usuario/torrentflix.git
cd torrentflix
```

2. Configure as variaveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configuracoes
```

3. Inicie o banco de dados:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. Instale as dependencias e inicie o servidor:
```bash
# Backend
cd server
npm install
npm run dev

# Frontend (outro terminal)
cd client
npm install
npm run dev
```

5. Acesse:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api

### Docker (Producao)

1. Configure as variaveis de ambiente:
```bash
cp .env.example .env
# Edite .env com suas configuracoes
```

2. Build e inicie:
```bash
docker-compose up -d --build
```

3. Acesse: http://localhost:3000

## API Endpoints

### Autenticacao
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario atual

### Downloads (qBittorrent)
- `GET /api/downloads` - Listar torrents
- `POST /api/downloads` - Adicionar torrent
- `POST /api/downloads/:hash/pause` - Pausar
- `POST /api/downloads/:hash/resume` - Retomar
- `DELETE /api/downloads/:hash` - Remover

### Streaming
- `GET /api/stream/:hash/:fileIndex` - Stream de video

### Busca (Jackett)
- `GET /api/search?query=` - Buscar torrents
- `GET /api/search/indexers` - Listar indexadores

### Series (Sonarr)
- `GET /api/series` - Listar series
- `POST /api/series` - Adicionar serie
- `GET /api/series/lookup?term=` - Buscar serie
- `DELETE /api/series/:id` - Remover

### Filmes (Radarr)
- `GET /api/movies` - Listar filmes
- `POST /api/movies` - Adicionar filme
- `GET /api/movies/lookup?term=` - Buscar filme
- `DELETE /api/movies/:id` - Remover

## Estrutura do Projeto

```
torrentflix/
├── server/                 # Backend TypeScript
│   ├── src/
│   │   ├── config/        # Configuracoes
│   │   ├── controllers/   # Controllers
│   │   ├── middleware/    # Middlewares
│   │   ├── models/        # Modelos Sequelize
│   │   ├── routes/        # Rotas
│   │   ├── services/      # Servicos
│   │   └── types/         # Tipos TypeScript
│   └── package.json
│
├── client/                 # Frontend React
│   ├── src/
│   │   ├── api/           # Clientes API
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Contextos React
│   │   ├── pages/         # Paginas
│   │   └── App.tsx
│   └── package.json
│
├── docker-compose.yml      # Docker producao
├── docker-compose.dev.yml  # Docker desenvolvimento
├── Dockerfile              # Multi-stage build
└── .env.example           # Template de variaveis
```

## Usuario Padrao

Na primeira execucao, um usuario admin e criado automaticamente:
- Email: `admin@torrentflix.local`
- Senha: `admin123`

**Importante:** Altere a senha apos o primeiro login!

## Licenca

MIT
