FLAPPY LEVEL — NEXT.JS + SUPABASE — VERSÃO PARA VERCEL
=======================================================

O projeto inclui:
- Login e cadastro com Supabase Auth.
- Flappy Bird em Next.js, React e TypeScript.
- Nível, XP e recorde individual salvos no Supabase.
- Controles por toque, mouse e tecla ESPAÇO.
- Layout responsivo.

IMPORTANTE: COMO DESATIVAR A CONFIRMAÇÃO DE E-MAIL
-------------------------------------------------
Não é possível desligar a confirmação de e-mail apenas pelo código do navegador.
Essa opção é controlada pelo próprio Supabase.

No painel do Supabase:
1. Abra Authentication.
2. Entre em Sign In / Providers (ou Providers).
3. Abra o provedor Email.
4. Desative "Confirm email" / "Confirm email address".
5. Salve a alteração.

Com essa opção desligada, o Supabase poderá criar a conta e iniciar a sessão sem exigir clique em link enviado por e-mail. O código já redireciona o jogador para /game quando o Supabase retorna uma sessão.

Se uma conta foi criada antes com confirmação pendente, talvez seja necessário confirmá-la manualmente no painel Authentication > Users, ou apagá-la e cadastrá-la novamente depois de desligar a confirmação.

CONFIGURAÇÃO LOCAL
------------------
1. Extraia o ZIP.
2. Execute: npm install
3. Crie/edite .env.local com:
   NEXT_PUBLIC_SUPABASE_URL=URL_DO_SEU_PROJETO
   NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
4. No Supabase > SQL Editor, execute todo o arquivo supabase.sql.
5. Execute: npm run dev
6. Abra: http://localhost:3000/login

PUBLICAÇÃO NA VERCEL
-------------------
No projeto da Vercel, em Environment Variables, configure:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Use os valores reais do Supabase. Depois faça Deploy ou Redeploy.
Não use a chave service_role no navegador nem em variável NEXT_PUBLIC.

BANCO DE DADOS
--------------
Execute supabase.sql uma única vez no SQL Editor do projeto Supabase.
As políticas RLS limitam o acesso ao perfil do próprio jogador.

NÍVEIS
------
O nível usa o recorde: a cada 5 pontos de recorde, sobe 1 nível.
Nível 1: recorde de 0 a 4; nível 2: 5 a 9; e assim por diante.
