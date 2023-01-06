import { CronJob } from "quirrel/next";
import prisma from "lib/prisma";
import { Game } from "@prisma/client";
import * as cheerio from "cheerio"


export default CronJob(
    "api/queues/update-games",
    ["0 10 * * *", "Europe/Paris"], // (see https://crontab.guru/)
    async () => {
        const games: Game[] = await prisma.game.findMany()
        for (const game of games) {
            await Promise.all([
                fetch(game.url)
                    .then(res => res.text())
                    .then(async contents => {
                        const newPrice = getPrice(contents)
                        const updatedGame = await prisma.game.update({
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

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}