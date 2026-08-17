# Santa Come — site + painel de gestão

Site do restaurante Santa Come (self-service & take away, Santa Cruz), com uma
área reservada onde os donos podem publicar os **pratos do dia** e atualizar
**preços** do menu, sem precisar de mexer em código.

- Referências usadas: [Facebook](https://www.facebook.com/restaurantesantacome/?locale=pt_PT),
  [Instagram](https://www.instagram.com/restaurante.santacome/),
  [TripAdvisor](https://www.tripadvisor.pt/Restaurant_Review-g5602892-d5981355-Reviews-Santa_Come-Silveira_Lisbon_District_Central_Portugal.html),
  [Google Maps](https://maps.app.goo.gl/cxFpjsntb6DwRrXYA).
- Logótipo em [`public/images/logo.jpg`](public/images/logo.jpg).

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS)
- **Prisma 7** como ORM, com o adaptador `@prisma/adapter-pg` (funciona com qualquer
  Postgres: Neon, Supabase, Vercel Postgres, etc.)
- **Postgres** — usar um plano gratuito (recomendado: [Neon](https://neon.tech))
- Autenticação simples: uma password partilhada, sessão em cookie assinado (JWT)

## Configuração inicial (obrigatória antes de correr o projeto)

1. Cria uma conta grátis em [neon.tech](https://neon.tech) e uma base de dados nova.
2. Copia a **connection string** (algo como
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`).
3. Cola-a em `.env`, na variável `DATABASE_URL`.
4. Cria as tabelas na base de dados:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Muda `ADMIN_PASSWORD` em `.env` para uma password à tua escolha.

## Como correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para o site público e
[http://localhost:3000/admin](http://localhost:3000/admin) para o painel de gestão
(password definida em `.env`).

**Nunca** commits o ficheiro `.env` para o git — já está no `.gitignore`.

## Estrutura de dados

- **`DailySpecial`** — pratos do dia (data, título, descrição, preço, visível/oculto).
  Gerido através do painel `/admin` (criar, editar preço, esconder, remover).
- **Menu completo** — duas fontes possíveis:
  1. **`MenuItem`** na base de dados, gerido no painel `/admin` (aba "Menu completo"); ou
  2. **Google Sheets**, se a variável `MENU_SHEET_CSV_URL` estiver definida — nesse caso
     o site lê o menu diretamente da folha a cada visita e ignora a tabela `MenuItem`.

### Menu via Google Sheets

1. Preenche o template em [`docs/menu-template.xlsx`](docs/menu-template.xlsx) (colunas:
   `categoria`, `nome`, `descricao`, `preco`, `disponivel`, `ordem`).
2. Carrega-o para o Google Drive e abre-o com o Google Sheets.
3. Garante que a folha está partilhada como "Qualquer pessoa com o link pode ver".
4. Usa este formato de link para a variável `MENU_SHEET_CSV_URL`:

   ```
   https://docs.google.com/spreadsheets/d/<ID_DA_FOLHA>/export?format=csv
   ```

   O `<ID_DA_FOLHA>` é a parte do link entre `/d/` e `/edit`.
5. Define essa variável no `.env` (local) e no Netlify (produção) e volta a fazer deploy.

Sem essa variável definida, o site usa a tabela `MenuItem` da base de dados normalmente.

## Deploy no Netlify

1. Sobe o projeto para um repositório no GitHub (`git push`).
2. No [Netlify](https://app.netlify.com) → **Add new site → Import an existing project**
   → escolhe o repositório. O Netlify deteta automaticamente que é Next.js.
3. Em **Site configuration → Environment variables**, adiciona:
   - `DATABASE_URL` — a connection string do Neon (usa a mesma da tua `.env`, ou cria
     uma base de dados Neon separada só para produção)
   - `ADMIN_PASSWORD` — password forte para o painel
   - `AUTH_SECRET` — string aleatória longa (a que já está em `.env` serve, ou gera outra
     com `openssl rand -base64 32`)
   - `MENU_SHEET_CSV_URL` — opcional, ver secção "Menu via Google Sheets" acima
4. Deploy. Se ainda não correste as migrações contra essa base de dados, corre uma vez
   (localmente, apontando `DATABASE_URL` para a base de produção):

   ```bash
   npx prisma migrate deploy
   ```

## Por fazer / a confirmar com os donos

- Popular o menu completo e os primeiros pratos do dia através do painel `/admin`.
- Trocar a `ADMIN_PASSWORD` antes de publicar.
