# Criar Líderes Manualmente no Banco de Dados

Como líderes não podem se registrar via interface, você precisa criá-los manualmente no banco de dados.

## Opção 1: Via Prisma Studio (Recomendado - Interface Gráfica)

```bash
npm run prisma:studio
```

Isso abrirá uma interface web (http://localhost:5555) onde você pode:

1. Navegar para a tabela `User`
2. Clicar em "Add record"
3. Preencher os seguintes campos:
   - **email**: Email único do líder (ex: `carlos@example.com`)
   - **name**: Nome do líder (ex: `Carlos Silva`)
   - **password**: A senha **já deve estar hasheada em bcrypt** (veja como fazer abaixo)
   - **role**: Selecionar `LEADER`
   - **avatar**: Deixar vazio ou fornecer uma URL
   - **patrolId**: Deixar vazio (null) - líderes não pertencem a patrulhas
   - **refreshToken**: Deixar vazio (null)
   - **refreshTokenExpiresAt**: Deixar vazio (null)

## Opção 2: Via SQL Direto (Postgres)

```sql
-- Primeiro, você precisa gerar o hash bcrypt de uma senha
-- Use o comando abaixo em Node.js ou um script separado:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('senha123', 10).then(h => console.log(h))"

-- Exemplo de INSERT (substitua os valores):
INSERT INTO "User" (id, email, name, password, role, avatar, "patrolId", "refreshToken", "refreshTokenExpiresAt", "createdAt", "updatedAt")
VALUES (
  'uuid-aqui',                                  -- id único (CUID, ex: clk123abcd)
  'carlos@example.com',                         -- email
  'Carlos Silva',                               -- name
  '$2b$10$...',                                 -- password hasheado em bcrypt
  'LEADER',                                     -- role
  NULL,                                         -- avatar
  NULL,                                         -- patrolId (líderes não pertencem a patrulhas)
  NULL,                                         -- refreshToken
  NULL,                                         -- refreshTokenExpiresAt
  NOW(),                                        -- createdAt
  NOW()                                         -- updatedAt
);
```

## Passo a Passo para Gerar Hash Bcrypt

1. Abra um terminal Node.js:
```bash
node
```

2. Digite os comandos:
```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('sua_senha_aqui', 10).then(hash => console.log(hash));
```

3. Copie o hash gerado (vai começar com `$2b$10$`)

## Exemplo Prático

### Criar Líder via Node.js (Script)

Crie um arquivo `create-leader.js` na raiz do backend:

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createLeader(email, name, password) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'LEADER',
      avatar: null,
    },
  });

  console.log('✅ Líder criado com sucesso!');
  console.log('Email:', user.email);
  console.log('ID:', user.id);
  console.log('Role:', user.role);

  await prisma.$disconnect();
}

// Usar assim:
createLeader('carlos@example.com', 'Carlos Silva', 'senha123').catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
```

Execute:
```bash
node create-leader.js
```

## Dados Criados com Sucesso

Após criar um líder, ele poderá fazer login com:
- **Email**: O email que você forneceu
- **Senha**: A senha que você forneceu
- **Role**: Será solicitado selecionar `LEADER` na tela de login

## Fluxo de Autenticação

```
┌─────────────────────────────────────────┐
│ Landing Page (/)                         │
├─────────────────────────────────────────┤
│ Opção 1: Login Líder                    │
│   - Email                               │
│   - Senha                               │
│   → Leva a /leader                      │
│                                         │
│ Opção 2: Aluno                          │
│   a) Login (credenciais + senha)        │
│      → Leva a /student                  │
│   b) Criar Conta (email + senha)        │
│      → Registra como STUDENT            │
│      → Auto-login → /student            │
└─────────────────────────────────────────┘
```

## Segurança

✅ **Apenas você (administrador) pode criar líderes** → Evita criação maliciosa de contas administrativas

✅ **Alunos só podem se registrar como STUDENT** → Regra forçada no backend

✅ **Login funciona para ambos** → LEADER e STUDENT fazem login normalmente

## Verificar Líderes Criados

```sql
SELECT id, email, name, role, "createdAt" FROM "User" WHERE role = 'LEADER';
```

## Dúvidas?

Se encontrar erro de email duplicado:
```sql
DELETE FROM "User" WHERE email = 'carlos@example.com';
```
