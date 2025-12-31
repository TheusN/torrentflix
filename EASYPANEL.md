# Deploy no Easypanel

## Opcao 1: Deploy com Docker Compose (Recomendado)

O docker-compose.yml ja inclui o PostgreSQL integrado. Basta:

1. No Easypanel, crie um novo projeto
2. Adicione um servico **"Docker Compose"**
3. Aponte para o repositorio GitHub
4. Deploy!

O sistema vai:
- Criar o PostgreSQL automaticamente
- Conectar ao banco
- Criar usuario admin: **admin@admin.com** / **123456**

### Configurar Dominio

Apos o deploy, configure o dominio na porta **3000**.

---

## Opcao 2: Deploy Manual (Servicos Separados)

### Passo 1: Criar PostgreSQL

1. **+ Service** > **Database** > **PostgreSQL**
2. Configure:
   - Name: `db`
   - Database: `torrentflix`
   - User: `torrentflix`
   - Password: (anote!)

### Passo 2: Criar App

1. **+ Service** > **App** > **GitHub**
2. Configure:
   - Repository: seu repo
   - Branch: `main`
   - Dockerfile: `Dockerfile`

### Passo 3: Variaveis de Ambiente

Na aba **Environment** do app:

```
DATABASE_URL=postgres://torrentflix:SENHA@PROJETO_db:5432/torrentflix
```

> Substitua `PROJETO` pelo nome do seu projeto e `SENHA` pela senha do PostgreSQL.

### Passo 4: Dominio

Configure o dominio na porta **3000**.

---

## Primeiro Acesso

Login padrao:
- **Email:** admin@admin.com
- **Senha:** 123456

**IMPORTANTE:** Altere a senha apos o login!

---

## Configurar Servicos

Apos logar, va em **Admin > Configuracoes** e configure:

- **qBittorrent:** URL, usuario, senha
- **Jackett:** URL, API Key
- **Sonarr:** URL, API Key (opcional)
- **Radarr:** URL, API Key (opcional)
- **TMDB:** API Key

---

## Troubleshooting

### App nao conecta ao banco

1. Verifique se o PostgreSQL esta rodando
2. Verifique a `DATABASE_URL`:
   - Formato: `postgres://USER:PASS@HOST:5432/DATABASE`
   - Host interno: `PROJETO_SERVICO` (ex: `torrentflix_db`)

### Logs

Veja os logs em **Deployments > View Logs**

O app tenta conectar 10 vezes com 3 segundos entre cada tentativa.
