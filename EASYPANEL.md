# Guia de Deploy no Easypanel

## Passo 1: Criar o Projeto

1. No Easypanel, clique em **"Create Project"**
2. De um nome ao projeto (ex: `torrentflix`)

## Passo 2: Criar o Banco de Dados PostgreSQL

1. Dentro do projeto, clique em **"+ Service"**
2. Selecione **"Database"** > **"PostgreSQL"**
3. Configure:
   - **Name**: `db`
   - **Database Name**: `torrentflix`
   - **Username**: `torrentflix`
   - **Password**: (anote a senha gerada ou defina uma)
4. Clique em **"Create"**

## Passo 3: Criar a Aplicacao

1. Clique em **"+ Service"** > **"App"**
2. Selecione **"GitHub"** e conecte seu repositorio
3. Configure:
   - **Name**: `app`
   - **Branch**: `main`
   - **Dockerfile Path**: `Dockerfile`

## Passo 4: Configurar Variaveis de Ambiente

Na aba **"Environment"** da aplicacao, adicione:

```env
# OBRIGATORIO - Conexao com o banco de dados
# Use o hostname interno do Easypanel: projeto_servico
DATABASE_URL=postgres://torrentflix:SUA_SENHA@torrentflix_db:5432/torrentflix

# JWT - Gere secrets seguros (use: openssl rand -base64 32)
JWT_SECRET=seu-jwt-secret-muito-seguro-aqui
JWT_REFRESH_SECRET=seu-refresh-secret-muito-seguro-aqui
```

> **Nota**: Substitua `torrentflix` pelo nome do seu projeto e `SUA_SENHA` pela senha do PostgreSQL.

## Passo 5: Configurar Dominio

1. Na aba **"Domains"**, adicione seu dominio ou use o dominio do Easypanel
2. A porta ja esta configurada como **3000**

## Passo 6: Deploy

1. Clique em **"Deploy"**
2. Aguarde o build e deploy
3. Acesse sua aplicacao!

## Primeiro Acesso

Apos o deploy, acesse sua aplicacao e faca login com:

- **Email**: `admin@admin.com`
- **Senha**: `123456`

> **IMPORTANTE**: Altere a senha imediatamente apos o primeiro login!

## Configurar Servicos (Painel Admin)

Apos logar como admin, va para **Admin > Configuracoes** e configure:

1. **qBittorrent**: Host, porta, usuario e senha
2. **Jackett**: Host, porta e API Key
3. **Sonarr** (opcional): Host, porta e API Key
4. **Radarr** (opcional): Host, porta e API Key
5. **TMDB**: API Key (obtenha em https://www.themoviedb.org/settings/api)

## Variaveis de Ambiente Completas (Referencia)

```env
# Aplicacao
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL=postgres://usuario:senha@host:5432/database

# JWT
JWT_SECRET=seu-jwt-secret
JWT_REFRESH_SECRET=seu-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# qBittorrent
QBITTORRENT_HOST=http://seu-qbittorrent
QBITTORRENT_PORT=8080
QBITTORRENT_USER=admin
QBITTORRENT_PASS=adminadmin

# Jackett
JACKETT_HOST=http://seu-jackett
JACKETT_PORT=9117
JACKETT_API_KEY=sua-api-key

# Sonarr (opcional)
SONARR_HOST=http://seu-sonarr
SONARR_PORT=8989
SONARR_API_KEY=sua-api-key

# Radarr (opcional)
RADARR_HOST=http://seu-radarr
RADARR_PORT=7878
RADARR_API_KEY=sua-api-key

# TMDB
TMDB_API_KEY=sua-tmdb-api-key

# Paths (opcional)
DOWNLOAD_PATH=/app/downloads
MEDIA_PATH=/app/media
```

## Troubleshooting

### Erro de conexao com banco de dados

Verifique:
1. O nome do servico PostgreSQL (ex: `db`, `postgres`)
2. O hostname segue o padrao: `nomeprojeto_nomeservico`
3. A senha esta correta
4. O banco de dados foi criado

### Aplicacao nao inicia

1. Verifique os logs em **"Deployments"** > **"View Logs"**
2. Certifique-se que `DATABASE_URL` esta configurado
3. Aguarde o PostgreSQL iniciar antes da aplicacao

### Volumes (Persistencia de Dados)

Para persistir downloads, configure um volume:
- **Path no Container**: `/app/downloads`
- **Path no Host**: `/var/lib/easypanel/projects/SEU_PROJETO/volumes/downloads`
