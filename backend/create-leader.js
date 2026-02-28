/**
 * Script para criar líderes manualmente
 * 
 * Uso:
 *  node create-leader.js <email> <name> <password>
 * 
 * Exemplo:
 *  node create-leader.js carlos@example.com "Carlos Silva" senha123
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

async function createLeader(email, name, password) {
  try {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('❌ Erro: Email já existe no banco de dados');
      console.error(`Email: ${email}`);
      console.error(`Role: ${existingUser.role}`);
      await prisma.$disconnect();
      process.exit(1);
    }

    // Hash da senha
    console.log('🔐 Hasheando senha...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar líder
    console.log('📝 Criando líder no banco de dados...');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'LEADER',
        avatar: null,
      },
    });

    console.log('\n✅ Líder criado com sucesso!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:      ${user.email}`);
    console.log(`Nome:       ${user.name}`);
    console.log(`Role:       ${user.role}`);
    console.log(`ID:         ${user.id}`);
    console.log(`Criado em:  ${user.createdAt.toLocaleString('pt-BR')}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Pode fazer login em: Login do Líder');

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Erro ao criar líder:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

async function promptForInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Email do líder: ', (email) => {
      rl.question('Nome do líder: ', (name) => {
        rl.question('Senha do líder: ', (password) => {
          rl.close();
          resolve({ email, name, password });
        });
      });
    });
  });
}

async function main() {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║     Criador de Líderes - Quest Masters    ║');
  console.log('╚═══════════════════════════════════════════╝\n');

  let email, name, password;

  // Via argumentos de linha de comando
  if (process.argv.length >= 5) {
    email = process.argv[2];
    name = process.argv[3];
    password = process.argv[4];
  } else {
    // Via prompt interativo
    console.log('Preencha os dados do novo líder:\n');
    const input = await promptForInput();
    email = input.email;
    name = input.name;
    password = input.password;
  }

  // Validações
  if (!email || !email.includes('@')) {
    console.error('❌ Email inválido');
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!name || name.trim().length < 2) {
    console.error('❌ Nome deve ter no mínimo 2 caracteres');
    await prisma.$disconnect();
    process.exit(1);
  }

  if (!password || password.length < 6) {
    console.error('❌ Senha deve ter no mínimo 6 caracteres');
    await prisma.$disconnect();
    process.exit(1);
  }

  await createLeader(email, name, password);
}

main().catch(async (err) => {
  console.error('Erro:', err);
  await prisma.$disconnect();
  process.exit(1);
});
