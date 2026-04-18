This is a small app allowing the user to add and track the best price on its game's wishlist through [Allkeyshop](https://www.allkeyshop.com/)'s comparison website.

## Getting Started

1. Install dependencies
```
npm i
```

2. Start the local PostgreSQL database:
```bash
docker compose up -d
```

3. Copy `.env.example` as `.env.local` and fill in the blanks:

```
BASE_URL=http://localhost:3000
NEXT_PUBLIC_LOCALE=fr-FR
NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES=3000 // time in ms between 2 queries to Allkeyshop.com

DATABASE_URL=postgresql://aks:aks@localhost:5432/aks_watcher

NEXTAUTH_SECRET= // run openssl rand -base64 32 to generate a random hash
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com

# Cloudinary credentials used for hosting cover images
CLOUD_NAME=
API_KEY=
API_SECRET=
```

4. Copy `prisma/.env.example` as `prisma/.env`:
```
DATABASE_URL=postgresql://aks:aks@localhost:5432/aks_watcher
SHADOW_DATABASE_URL=postgresql://aks:aks@localhost:5432/aks_watcher_shadow
```

5. Run Prisma migrations and seed:
```bash
npx prisma migrate dev
npx prisma db seed
```

6. Run the development server:

```bash
npm run dev
```
