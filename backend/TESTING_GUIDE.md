# Validação de Sistema Multi-Aba e Autenticação

## Resumo das Mudanças

### Backend
- ✅ Rota de registro aceita APENAS `STUDENT`
- ✅ Rota de login aceita `LEADER` e `STUDENT`
- ✅ Validação reforçada: registro sempre cria como STUDENT
- ✅ Script para criar líderes manualmente: `npm run create:leader`

### Frontend
- ✅ Tokens armazenados em `sessionStorage` (isolado por aba)
- ✅ BroadcastChannel sincroniza logout entre abas
- ✅ UI de registro disponível apenas para alunos
- ✅ UI de login disponível para ambos (aluno e líder)
- ✅ Cada aba mantém seu próprio contexto de autenticação

---

## Guia de Teste

### Teste 1: Criar um Líder Manualmente

```bash
cd backend
npm run create:leader
# Ou com argumentos:
node create-leader.js lider@example.com "João Silva" senha123
```

**Esperado**: Mensagem de sucesso com dados do líder criado.

---

### Teste 2: Login com Dois Usuários em Abas Diferentes

#### Aba 1: Aluno
1. Abra http://localhost:5173
2. Clique em "Aluno"
3. Clique em "Cadastre-se"
4. Preencha:
   - Email: `aluno@example.com`
   - Senha: `senha123`
   - Confirmar: `senha123`
5. Clique "Cadastrar"
6. **Esperado**: Redireciona para `/student` após auto-login

#### Aba 2: Líder
1. Abra nova aba: http://localhost:5173
2. Clique em "Líder"
3. **IMPORTANTE**: Não deve haver opção "Cadastre-se"
4. Faça login:
   - Email: `lider@example.com` (aquele que você criou)
   - Senha: `senha123`
5. Clique "Entrar"
6. **Esperado**: Redireciona para `/leader` após login

---

### Teste 3: Sincronização Multi-Aba

#### Pré-requisito: Teste 2 concluído com duas abas abertas

1. **Aba 1 (Aluno)**: Verificar que está em `/student` com dados do aluno
   - Abrir DevTools → Console
   - Procurar por mensagens de autenticação

2. **Aba 2 (Líder)**: Dentro do SettingsPanel, clicar "Sair da conta"
   - **Esperado**: Token do líder é limpo
   - **Esperado**: `BroadcastChannel` envia mensagem de logout

3. **Aba 1 (Aluno)**: Verificar que foi desconectado automaticamente
   - Página deve redirecionar para `/` (login)
   - Console deve mostrar: `🔴 Auth conflict detected`

---

### Teste 4: Testar Validações

#### 4.1: Tentar registrar como Líder (via frontend)
- Não deve haver opção visível
- Se conseguir enviar dados com role='LEADER', backend força STUDENT

#### 4.2: Verificar que senhas hasheadas no banco
```sql
SELECT id, email, role, password FROM "User" LIMIT 1;
-- Password deve começar com $2b$10$ (bcrypt hash)
```

#### 4.3: Email duplicado
1. Se tentar registrar com email já existente
   - **Esperado**: Erro "Email já registrado"

---

### Teste 5: Verificar sessionStorage

#### Em qualquer aba logada:
1. Abra DevTools → Application/Storage
2. Procure por `sessionStorage`
3. Procure a chave: `quest_masters_access_token`
4. **Esperado**: Token presente (JWT)

#### Abra outra aba diferente:
1. DevTools → Application
2. **Esperado**: `sessionStorage` está vazio (página nova)
3. Após fazer login nessa aba:
   - **Esperado**: Novo token diferente no `sessionStorage`

---

### Teste 6: Persistência de Aba ao Recarregar

1. **Aba 1**: Faça login como aluno
2. Recarregue a página (F5)
3. **Esperado**: 
   - Mantém autenticação
   - Token restaurado do `sessionStorage`
   - Sem redirecionar para login

---

## Verificação de Segurança

- ✅ Tokens não são compartilhados entre abas
- ✅ Session Storage é por aba (não localStorage global)
- ✅ BroadcastChannel sincroniza logouts
- ✅ Você pode criar líderes manualmente (seguro)
- ✅ Alunos não podem criar contas de líder
- ✅ Senhas são hasheadas (bcrypt)
- ✅ Não há console.log de senhas nem tokens

---

## Casos de Erro Esperados

### Erro 1: "Email já registrado"
```
Causa: Tentativa de registrar com email que já existe
Solução: Use um email novo
```

### Erro 2: "Email ou senha incorretos"
```
Causa: Credenciais inválidas no login
Solução: Verifique email/senha ou crie novo usuário
```

### Erro 3: Múltiplas abas desconectam quando faz login em outra
```
Causa: PREVISTO - BroadcastChannel detectou novo login
Solução: Isso é segurança - cada aba deve ter seu usuário
```

### Erro 4: Token expirado (401)
```
Causa: Access token expirou
Solução: Automático - frontend tenta renovar com refresh token
```

---

## Checklist Final

- [ ] Backend aceita registro apenas como STUDENT
- [ ] Backend aceita login como LEADER e STUDENT  
- [ ] Frontend UI não permite registrar como LEADER
- [ ] Frontend UI permite login como ambos
- [ ] BroadcastChannel funciona entre abas
- [ ] SessionStorage isola tokens por aba
- [ ] Criar líder via `npm run create:leader` funciona
- [ ] Dois alunos/líderes podem estar logados em abas diferentes
- [ ] Deslogar em uma aba afeta apenas aquela aba
- [ ] Recarregar aba mantém autenticação
- [ ] Senhas são hasheadas no banco

---

## Próximos Passos (Caso Necessário)

1. **Adicionar UI de gerenciamento de líderes** na dashboard do líder
2. **Backup/restore** de dados importante
3. **2FA/MFA** para líderes (autenticação de dois fatores)
4. **Logs de auditoria** para ações de líderes
5. **Rate limiting** em login para prevenir brute force

