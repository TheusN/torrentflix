# TorrentFlix

Plataforma de streaming pessoal estilo Netflix para gerenciamento e visualizacao de midia, integrando qBittorrent, Jackett, Sonarr e Radarr.

## Sobre o Projeto

TorrentFlix e uma aplicacao web que oferece:

- **Interface estilo Netflix** para navegar e assistir conteudo
- **Painel administrativo** para gerenciar downloads, usuarios e configuracoes
- **Area do usuario** para acompanhar progresso, historico e preferencias
- **Streaming de video** com suporte a seek e qualidade adaptativa
- **Busca integrada** de torrents via Jackett
- **Automacao** de downloads com Sonarr e Radarr

## Stack Tecnologica

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, React Query, React Router v7 |
| **Backend** | Node.js 20+, Express, TypeScript, Sequelize ORM |
| **Banco de Dados** | PostgreSQL 16+ |
| **Autenticacao** | JWT (access + refresh tokens) |
| **Containerizacao** | Docker, Docker Compose |

## Servicos Externos Necessarios

Para funcionar completamente, o TorrentFlix precisa dos seguintes servicos:

| Servico | Descricao | Porta Padrao | Obrigatorio |
|---------|-----------|--------------|-------------|
| **qBittorrent** | Cliente de torrent com WebUI | 8080 | Sim |
| **Jackett** | Agregador de indexadores de torrent | 9117 | Sim |
| **Sonarr** | Gerenciador automatico de series | 8989 | Opcional |
| **Radarr** | Gerenciador automatico de filmes | 7878 | Opcional |
| **TMDB API** | Metadados de filmes/series (gratuito) | - | Recomendado |

### Obtendo API Keys

- **TMDB:** Crie conta gratuita em [themoviedb.org](https://www.themoviedb.org/settings/api)
- **Jackett:** Acesse `http://seu-jackett:9117` e copie a API Key na interface
- **Sonarr/Radarr:** Em `Settings > General > Security > API Key`

---

## Instalacao no Easypanel

O Easypanel facilita o deploy de aplicacoes Docker. Siga os passos abaixo:

### 1. Criar Projeto no Easypanel

1. Acesse seu painel Easypanel
2. Clique em **"Create Project"**
3. Nomeie como `torrentflix`

### 2. Criar Servico de Banco de Dados

1. Dentro do projeto, clique em **"+ Service"**
2. Selecione **"Postgres"**
3. Configure:
   - **Name:** `torrentflix-db`
   - **Database:** `torrentflix`
   - **Username:** `torrentflix`
   - **Password:** (gere uma senha segura)
4. Clique em **"Create"**
5. Anote a **connection string interna** (ex: `postgres://torrentflix:senha@torrentflix-db:5432/torrentflix`)

### 3. Criar Servico da Aplicacao

1. Clique em **"+ Service"**
2. Selecione **"App"**
3. Configure:
   - **Name:** `torrentflix-app`
   - **Source:** GitHub (conecte seu repositorio)
   - **Branch:** `main`
   - **Build:** Dockerfile
   - **Port:** `3000`

### 4. Configurar Variaveis de Ambiente

Na aba **"Environment"** do servico `torrentflix-app`, adicione:

```env
# Aplicacao
NODE_ENV=production
PORT=3000

# Banco de Dados (use a connection string interna do Easypanel)
DATABASE_URL=postgres://torrentflix:SENHA@projeto_torrentflix-db:5432/torrentflix

# JWT (gere secrets seguros)
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui
JWT_REFRESH_SECRET=seu-refresh-secret-muito-seguro-aqui
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# qBittorrent (configure via painel admin apos deploy)
QBITTORRENT_HOST=http://seu-qbittorrent
QBITTORRENT_PORT=8080
QBITTORRENT_USER=admin
QBITTORRENT_PASS=adminadmin

# Jackett (configure via painel admin apos deploy)
JACKETT_HOST=http://seu-jackett
JACKETT_PORT=9117
JACKETT_API_KEY=sua-api-key

# Sonarr (opcional - configure via painel admin)
SONARR_HOST=http://seu-sonarr
SONARR_PORT=8989
SONARR_API_KEY=sua-api-key

# Radarr (opcional - configure via painel admin)
RADARR_HOST=http://seu-radarr
RADARR_PORT=7878
RADARR_API_KEY=sua-api-key

# TMDB (configure via painel admin)
TMDB_API_KEY=sua-tmdb-api-key
```

### 5. Configurar Dominio

1. Na aba **"Domains"**, adicione seu dominio
2. Ative **HTTPS** (Let's Encrypt automatico)
3. Configure o proxy para porta `3000`

### 6. Deploy

1. Clique em **"Deploy"**
2. Aguarde o build (primeira vez pode demorar ~5 minutos)
3. Acesse seu dominio

### 7. Primeiro Acesso

1. Acesse `https://seu-dominio.com/entrar`
2. Use as credenciais padrao:
   - **Email:** `admin@admin.com`
   - **Senha:** `123456`
3. **IMPORTANTE:** Altere a senha imediatamente em `/usuario/perfil`
4. Configure os servicos em `/admin/configuracoes`

---

## Instalacao Local (Desenvolvimento)

### Requisitos

- Node.js 20+
- PostgreSQL 16+ (ou Docker)
- npm ou yarn

### Passos

1. **Clone o repositorio:**
```bash
git clone https://github.com/seu-usuario/torrentflix.git
cd torrentflix
```

2. **Configure as variaveis de ambiente:**
```bash
cp .env.example .env
# Edite .env com suas configuracoes
```

3. **Inicie o banco de dados (Docker):**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

4. **Instale e inicie o backend:**
```bash
cd server
npm install
npm run dev
```

5. **Instale e inicie o frontend (outro terminal):**
```bash
cd client
npm install
npm run dev
```

6. **Acesse:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

### Scripts Rapidos (Windows)

```bash
# Iniciar tudo
start.bat

# Parar tudo
stop.bat

# Deploy para Easypanel (push + deploy automatico)
deploy.bat
```

### Deploy Automatico

O script `deploy.bat` faz push para o repositorio e dispara automaticamente o deploy no Easypanel:

```bash
# Faz commit, push e deploy em um comando
deploy.bat
```

A URL de deploy esta configurada em `.env`:
```
EASYPANEL_DEPLOY_URL=http://177.190.147.114:3000/api/compose/deploy/...
```

---

## Estrutura de Ambientes

A aplicacao possui 3 ambientes separados:

| Ambiente | URL Base | Descricao |
|----------|----------|-----------|
| **Principal** | `/app/*` | Interface Netflix - assistir conteudo |
| **Admin** | `/admin/*` | Painel administrativo |
| **Usuario** | `/usuario/*` | Perfil e preferencias |

### Rotas Principais

```
/entrar                    # Login
/app/inicio                # Dashboard principal (estilo Netflix)
/app/filmes                # Catalogo de filmes
/app/series                # Catalogo de series
/app/assistir/:id          # Player de video

/admin/painel              # Dashboard admin
/admin/usuarios            # Gerenciar usuarios
/admin/downloads           # Gerenciar torrents
/admin/buscar              # Buscar torrents
/admin/configuracoes       # Configurar servicos
/admin/logs                # Logs de atividade

/usuario/perfil            # Meu perfil
/usuario/continuar         # Continuar assistindo
/usuario/lista             # Minha lista
/usuario/historico         # Historico
/usuario/preferencias      # Preferencias
```

---

## API Endpoints

### Autenticacao (`/api/auth`)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| POST | `/register` | Registrar usuario |
| POST | `/login` | Login |
| POST | `/refresh` | Renovar token |
| POST | `/logout` | Logout |
| GET | `/me` | Usuario atual |

### Downloads (`/api/downloads`)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/` | Listar torrents |
| POST | `/` | Adicionar torrent |
| GET | `/:hash` | Detalhes do torrent |
| POST | `/:hash/pause` | Pausar |
| POST | `/:hash/resume` | Retomar |
| DELETE | `/:hash` | Remover |

### Streaming (`/api/stream`)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/:hash/:fileIndex` | Stream de video |

### Busca (`/api/search`)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/?query=` | Buscar torrents |
| GET | `/indexers` | Listar indexadores |

### Admin (`/api/admin`)
| Metodo | Endpoint | Descricao |
|--------|----------|-----------|
| GET | `/painel/stats` | Estatisticas |
| GET/POST/PUT/DELETE | `/usuarios` | CRUD usuarios |
| GET/PUT | `/configuracoes` | Configuracoes |
| GET | `/configuracoes/testar/:servico` | Testar conexao |
| GET | `/logs` | Logs de atividade |

---

## Estrutura do Projeto

```
torrentflix/
├── client/                     # Frontend React
│   ├── src/
│   │   ├── api/               # Clientes API
│   │   ├── components/        # Componentes React
│   │   ├── context/           # Contextos (Auth)
│   │   ├── layouts/           # Layouts (Principal, Admin, Usuario)
│   │   └── pages/             # Paginas organizadas por ambiente
│   │       ├── principal/     # Inicio, Filmes, Series, Player
│   │       ├── admin/         # Painel, Usuarios, Downloads, Config
│   │       └── usuario/       # Perfil, Lista, Historico
│   └── package.json
│
├── server/                     # Backend Express
│   ├── src/
│   │   ├── config/            # Configuracoes e database
│   │   ├── controllers/       # Controllers REST
│   │   ├── middleware/        # Auth, Error, Logger
│   │   ├── models/            # Modelos Sequelize
│   │   ├── routes/            # Rotas da API
│   │   ├── services/          # Logica de negocio
│   │   └── types/             # Tipos TypeScript
│   └── package.json
│
├── docker-compose.yml          # Producao
├── docker-compose.dev.yml      # Desenvolvimento
├── Dockerfile                  # Build multi-stage
├── .env.example               # Template de variaveis
└── README.md
```

---

## Configuracao Dinamica

As configuracoes dos servicos (qBittorrent, Jackett, Sonarr, Radarr, TMDB) podem ser alteradas de duas formas:

1. **Via arquivo `.env`** - Configuracao inicial
2. **Via painel admin** (`/admin/configuracoes`) - Configuracao dinamica

**Prioridade:** Configuracoes salvas no banco de dados tem prioridade sobre o `.env`.

### Testando Conexoes

No painel de configuracoes, use o botao **"Testar Conexao"** para validar:
- URL e porta do servico
- Credenciais de acesso
- API keys

---

## Seguranca

- Senhas sao hasheadas com bcrypt
- Tokens JWT com expiracao curta (15min access, 7d refresh)
- Rate limiting para prevenir brute force
- Helmet.js para headers de seguranca
- CORS configurado para origens especificas
- Senhas/API keys mascaradas no painel

---

## Troubleshooting

### Erro de conexao com banco
- Verifique se o PostgreSQL esta rodando
- Confirme a connection string no `.env`
- No Easypanel, use o nome interno do servico (ex: `projeto_torrentflix-db`)

### Erro de conexao com qBittorrent
- Verifique se o WebUI esta habilitado
- Confirme URL, porta e credenciais
- Para HTTPS, use porta 443

### Rate limiting (429 Too Many Requests)
- Em desenvolvimento, o limite e 500 req/min
- Em producao, 100 req/min
- Endpoints de stream e health sao excluidos

### Primeiro login nao funciona
- Verifique os logs do servidor para erros de banco
- O usuario admin e criado na primeira conexao com o banco
- Credenciais: `admin@admin.com` / `123456`

---

## Contribuindo

1. Fork o repositorio
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudancas (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

---

## Licenca

MIT License - veja [LICENSE](LICENSE) para detalhes.

