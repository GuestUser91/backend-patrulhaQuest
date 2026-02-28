# Sistema de Autenticação - Guia Completo

## Visão Geral

Sistema Quest Masters Guild com autenticação multi-usuário segura para 40 alunos e vários líderes.

### Características Principais
- **Registro**: Apenas alunos (STUDENT)
- **Login**: Ambos (STUDENT e LEADER)
- **Líderes**: Criados manualmente via administrador
- **Multi-aba**: Cada aba tem seu próprio usuário autenticado
- **Sincronização**: Logouts sincronizados entre abas via BroadcastChannel

---

## Setup Inicial

### 1. Clonar e Instalar

```bash
# Backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate

# Frontend
cd ../quest-masters-guild
npm install
```

### 2. Criar Líderes Iniciais

```bash
cd backend
npm run create:leader
# Preencha: email, nome, senha
# Ou use argumentos:
node create-leader.js admin@example.com "Admin" senha123
```

### 3. Iniciar Servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# Servidor rodando em http://localhost:3000

# Terminal 2 - Frontend
cd quest-masters-guild
npm run dev
# Disponível em http://localhost:5173
```

---

## Fluxo de Autenticação

### Para Alunos

```
1. Abra http://localhost:5173
2. Clique em "Aluno"
3. Opção A: Fazer Login
   - Email que já está registrado
   - Senha
4. Opção B: Criar Conta (Cadastro)
   - Email novo
   - Senha (mín 6 caracteres)
   - Confirmar senha
5. Dashboard de aluno em /student
```

### Para Líderes

```
1. Abra http://localhost:5173
2. Clique em "Líder"
3. APENAS Login (sem cadastro)
   - Email (criado por você no banco)
   - Senha
4. Dashboard de líder em /leader
```

---

## Gerenciamento de Líderes

### Opção 1: Via Script (Recomendado)

```bash
cd backend
npm run create:leader
```

Interativo - pede email, nome e senha.

### Opção 2: Via Argumentos

```bash
node create-leader.js carlos@example.com "Carlos Silva" senha123
```

### Opção 3: Via Prisma Studio

```bash
npm run prisma:studio
# Abre interface em http://localhost:5555
# Adicionar registros manualmente na tabela User
```

### Opção 4: Via SQL Direto

```sql
-- Gere hash bcrypt primeiro:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('senha123', 10).then(h => console.log(h))"

INSERT INTO "User" (id, email, name, password, role, avatar, "patrolId", "refreshToken", "refreshTokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  'clk' || substr(replace(cast(uuid_generate_v4() as text), '-', ''), 1, 21),
  'lider@example.com',
  'José Silva',
  '$2b$10$...',  -- Hash bcrypt da senha
  'LEADER',
  NULL,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
);
```

---

## Segurança

### ✅ Implementado

**Registro**:
- Apenas `STUDENT` pode se registrar
- Validação no backend (força STUDENT)
- Validação no frontend (UI não oferece opção LEADER)
- Senhas hasheadas com bcrypt

**Login**:
- Funciona para STUDENT e LEADER
- Tokens JWT com expiração curta (15min)
- Refresh token em cookie httpOnly (30 dias)

**Multi-aba**:
- Tokens isolados em `sessionStorage` (por aba)
- BroadcastChannel sincroniza logouts
- Cada aba pode ter usuário diferente

**Administração**:
- Líderes criados manualmente por você
- Scripts helper para facilitar criação
- Impossível para alunos criarem líderes maliciosamente

---

## Endpoints da API

### Autenticação

**POST /api/auth/register** - Registrar novo aluno
```json
{
  "email": "aluno@example.com",
  "name": "João da Silva",
  "password": "senha123",
  "role": "STUDENT"  // Ignorado - sempre STUDENT
}
```

**POST /api/auth/login** - Login (aluno ou líder)
```json
{
  "email": "lider@example.com",
  "password": "senha123",
  "role": "LEADER"  // Ou "STUDENT"
}
```

**GET /api/auth/me** - Dados do usuário logado
```json
{
  "id": "clk...",
  "email": "lider@example.com",
  "name": "José Silva",
  "role": "LEADER",
  "avatar": null,
  "patrolId": null
}
```

**POST /api/auth/me/avatar** - Upload de avatar (multipart/form-data)
```
Content-Type: multipart/form-data
- Arquivo: avatar (JPG, PNG, WEBP, máximo 2MB)
```

**PATCH /api/auth/me** - Atualizar perfil
```json
{
  "name": "Novo Nome",
  "avatar": "http://localhost:3000/uploads/avatars/..."
}
```

**POST /api/auth/refresh** - Renovar token de acesso
```json
// Cookie: refreshToken (automático)
```

**POST /api/auth/logout** - Fazer logout
```json
// Cookie: refreshToken ser
á limpo
```

---

## Variáveis de Ambiente

### Backend (.env)

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/quest_masters"
JWT_SECRET="sua-chave-secreta-aqui"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="30d"
PORT=3000
NODE_ENV=development
```

### Frontend (.env.local)

```bash
VITE_API_BASE_URL="http://localhost:3000/api"
```

---

## Estrutura de Dados

### User (Usuário)

```prisma
model User {
  id                    String   @id @default(cuid())
  email                 String   @unique
  name                  String
  password              String   // Hasheado (bcrypt)
  role                  UserRole // LEADER | STUDENT
  avatar                String?
  patrolId              String?
  patrol                Patrol?  @relation(fields: [patrolId], references: [id])
  
  // JWT
  refreshToken          String?
  refreshTokenExpiresAt DateTime?
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

enum UserRole {
  LEADER
  STUDENT
}
```

---

## Troubleshooting

### Problema: "Email já cadastrado"
**Solução**: Use um email novo ou delete o usuário do banco

```sql
DELETE FROM "User" WHERE email = 'teste@example.com';
```

### Problema: Senha não funciona no login
**Possibilitades**:
1. Senha errada - verifique capitúlação
2. Tabela corrompida - rode migrations novamente
3. Verificar hash: deve começar com `$2b$10$`

### Problema: Sessão perdida ao recarregar página
**Esperado**: Não deve acontecer se `sessionStorage` está funcionando

**Debug**:
```javascript
// Console do navegador
sessionStorage.getItem('quest_masters_access_token')
// Deve retornar o token
```

### Problema: Múltiplas abas desconectam
**Esperado**: Isso é SEGURANÇA. Cada aba pode ter um usuário diferente

Se quer que sempre fique conectado na outra aba também:
- Modifique `tokenStore.ts` para usar `localStorage` (menos seguro)

### Problema: Avatar não salva
**Verificar**:
1. Pasta `/uploads/avatars` existe e é writable
2. Arquivo enviado tem extensão válida (jpg, png, webp)
3. Arquivo menor que 2MB
4. Backend reiniciado após instalar multer

```bash
# Verificar pasta
ls -la backend/uploads/avatars/
```

---

## Performance e Escalabilidade

Para 40 alunos simultâneos:

- ✅ **Prisma Connection Pool**: Configurado para vários acessos
- ✅ **Batch Inserts**: Attendance usa `createMany` (rápido)
- ✅ **Índices de Banco**: Email e patrolId indexados
- ✅ **BroadcastChannel**: Sincronização local (sem servidor)
- ✅ **SessionStorage**: Reduz chamadas de API

**Recomendações para crescimento**:
1. Implementar caching (Redis) para dados frequentes
2. Adicionar CDN para avatares
3. Usar S3 ou similar para uploads
4. Rate limiting na API
5. Monitoramento de performance

---

## Deployment

### Produção - Checklist

- [ ] `DATABASE_URL` apontando para DB de produção
- [ ] `JWT_SECRET` alterado (chave forte)
- [ ] `NODE_ENV=production`
- [ ] SSL/HTTPS habilitado
- [ ] CORS configurado para domínio correto
- [ ] Cookies com `Secure` e `SameSite`
- [ ] Backups de banco diários
- [ ] Logs centralizados

### Docker (Opcional)

```dockerfile
# backend/Dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
RUN npm run prisma:generate
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t quest-masters-backend .
docker run -p 3000:3000 --env-file .env quest-masters-backend
```

---

## Suporte e Documentação

- **LEADER_SETUP.md**: Guia detalhado para criar líderes
- **TESTING_GUIDE.md**: Guia de testes e validação
- **Prisma Docs**: https://www.prisma.io/docs
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev

---

## Licença

MIT - Use livremente

---

## Histórico de Mudanças

### v1.0.0 (Atual)
- ✅ Sistema de registro apenas para STUDENT
- ✅ Login para LEADER e STUDENT
- ✅ Multi-aba com isolamento de token
- ✅ BroadcastChannel para sincronização
- ✅ Script para criar líderes manualmente
- ✅ Avatar upload com multer
- ✅ Perfil editável (nome e avatar)

