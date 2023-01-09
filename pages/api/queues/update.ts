import { Game } from "@prisma/client";
import { Queue } from "quirrel/next";
import prisma from "lib/prisma"
import { getPrice, timeout } from "lib/utils";

export default Queue('api/queues/update', async (games: Game[]) => {
    let updatedGames: Game[] = []
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
                    if (updatedGame) updatedGames.push(updatedGame)
                })
                .catch(() => {
                    throw new Error(`There was an issue while updating ${game.name}.`)
                }),
            timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
        ])
    }
})