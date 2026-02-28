# Quest Masters Guild - Backend

API Backend para o sistema de gamificação Quest Masters Guild.

## Tecnologias

- Node.js + Express
- Prisma ORM
- PostgreSQL (Supabase)
- JWT para autenticação
- Bcrypt para criptografia de senhas

## Configuração

### 1. Instalar dependências

```bash
npm install
# ou
bun install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do Supabase:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
JWT_SECRET="sua_chave_jwt_complexa_aqui"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV=development
```

### 3. Configurar Prisma

Gerar cliente Prisma:

```bash
npm run prisma:generate
```

Executar migrations:

```bash
npm run prisma:migrate
```

Abrir Prisma Studio para gerenciar dados:

```bash
npm run prisma:studio
```

## Desenvolvimento

Iniciar servidor em modo watch:

```bash
npm run dev
```

## Endpoints da API

### Autenticação

#### POST `/api/auth/register`

Registrar novo usuário.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "João Silva",
  "password": "senha_segura",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "João Silva",
      "role": "STUDENT",
      "avatar": null,
      "patrolId": null
    },
    "token": "eyJhbGc..."
  }
}
```

#### POST `/api/auth/login`

Fazer login.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha_segura",
  "role": "STUDENT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "João Silva",
      "role": "STUDENT",
      "avatar": null,
      "patrolId": null
    },
    "token": "eyJhbGc..."
  }
}
```

#### GET `/api/auth/me`

Obter dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "name": "João Silva",
    "role": "STUDENT",
    "avatar": null,
    "patrolId": null,
    "patrol": null
  }
}
```

## Estrutura de Pastas

```
backend/
├── src/
│   ├── config.ts          # Configuração de variáveis de ambiente
│   ├── types.ts           # Tipos TypeScript
│   ├── index.ts           # Servidor Express
│   ├── services/
│   │   ├── auth.ts        # Lógica de autenticação
│   │   ├── jwt.ts         # Serviço JWT
│   │   └── password.ts    # Serviço de criptografia
│   ├── middleware/
│   │   └── auth.ts        # Middleware de autenticação
│   └── routes/
│       └── auth.ts        # Rotas de autenticação
├── prisma/
│   └── schema.prisma     # Schema do banco de dados
├── .env.example          # Template de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```
