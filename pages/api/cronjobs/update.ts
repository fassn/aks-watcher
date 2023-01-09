import { CronJob } from "quirrel/next";
import prisma from "lib/prisma";
import { ExampleGame, Game } from "@prisma/client";
import { getPrice, timeout } from "lib/utils";


export default CronJob(
    "api/cronjobs/update",
    ["0 10 * * *", "Europe/Paris"], // (see https://crontab.guru/)
    async () => {
        const games: Game[] = await prisma.game.findMany()
        for (const game of games) {
            await Promise.all([
                fetch(game.url)
                    .then(res => res.text())
                    .then(async contents => {
                        const newPrice = getPrice(contents)
                        await prisma.game.update({
                            where: { id: game.id },
                            data: {
                                bestPrice: newPrice,
                                dateUpdated: new Date().toISOString()
                            }
                        }).catch(e => {
                            throw new Error(e.message)
                        })
                    })
                    .catch(() => {
                        throw new Error(`There was an issue while updating ${game.name}.`)
                    }),
                timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
            ])
        }

        // update example games from the homepage
        const exampleGames: ExampleGame[] = await prisma.exampleGame.findMany()
        for (const game of exampleGames) {
            await Promise.all([
                fetch(game.url)
                    .then(res => res.text())
                    .then(async contents => {
                        const newPrice = getPrice(contents)
                        await prisma.exampleGame.update({
                            where: { id: game.id },
                            data: {
                                bestPrice: newPrice,
                                dateUpdated: new Date().toISOString()
                            }
                        }).catch(e => {
                            throw new Error(e.message)
                        })
                    })
                    .catch(() => {
                        throw new Error(`There was an issue while updating ${game.name}.`)
                    }),
                timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
            ])
        }
    }
);