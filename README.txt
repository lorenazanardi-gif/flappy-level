FLAPPY LEVEL — NEXT.JS + SUPABASE
=================================

O projeto agora tem:
- Login/cadastro usando Supabase Auth.
- Jogo Flappy Bird feito em React/Next.js/TypeScript.
- O jogador logado fica ligado ao próprio perfil.
- Recorde, nível e XP são salvos no Supabase.
- A cada 5 pontos de recorde, o jogador sobe 1 nível.
- Botão de sair.
- Funciona com mouse, toque e tecla ESPAÇO.
- Tela responsiva para celular e computador.

CONFIGURAÇÃO
1. Extraia o ZIP.
2. Abra o terminal na pasta do projeto.
3. Execute:
   npm install

4. No arquivo .env.local, coloque a URL e a chave anon do seu projeto Supabase:
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

5. No Supabase, abra SQL Editor e execute TODO o conteúdo de:
   supabase.sql

6. Confira no Supabase > Authentication > Providers se Email está habilitado.

7. Inicie:
   npm run dev

8. Abra:
   http://localhost:3000/login

COMO FUNCIONA O NÍVEL
- Recorde 0–4 = nível 1
- Recorde 5–9 = nível 2
- Recorde 10–14 = nível 3
- e assim por diante.
O nível usa o recorde salvo, então morrer em uma partida não diminui o nível.

OBSERVAÇÃO
O arquivo .env.local incluído é apenas um modelo. Substitua pelos dados reais do seu projeto.
