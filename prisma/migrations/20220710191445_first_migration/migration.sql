-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('PC', 'PS4', 'PS5', 'XBOX_ONE', 'XBOX_SERIES');

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "bestPrice" DOUBLE PRECISION NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL,
    "dateUpdated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_url_key" ON "Game"("url");
