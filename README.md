This is a small app allowing the user to add and track the best price on its game's wishlist through [Allkeyshop](https://www.allkeyshop.com/)'s comparison website.

## Getting Started

Copy the .env.example file as .env.local:

```BASE_URL=http://localhost:3000 // default dev address
NEXT_PUBLIC_MINUTES_BEFORE_STALE=60 // minimum time in minutes before being able to update the games again
NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES=3000 // time in ms between 2 queries to Allkeyshop.com

NEXTAUTH_SECRET= // run openssl rand -base64 32 to generate a random hash
NEXTAUTH_URL=http://localhost:3000
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```
