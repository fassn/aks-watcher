import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game } from "@prisma/client";
import * as cheerio from "cheerio"
import moment from "moment";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        return res.status(405).send('Request must be POST.')
    }

    const { userId } = req.body
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(403).send({ error: 'You need to be signed in to use this API route.' })
    }

    if (session) {
        const { id } = session?.user

        if (id !== userId) {
            return res.status(403).send({ error: 'You are not allowed to update the games.' })
        }

        const { games } = req.body
        const gamesToUpdate: Game[] = getGamesToUpdate(games)
        if (gamesToUpdate.length === 0) {
            return res.status(500).send({ error: 'There were no games to update. \
            Have you already updated the games in the last hour?'})
        }

        let updatedGames: Game[] = []
        if (gamesToUpdate.length > 0) {
            for (const game of gamesToUpdate) {
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
                                return res.status(500).send({ error: e.message });
                            })
                            if (updatedGame) updatedGames.push(updatedGame)
                        })
                        .catch(() => {
                            return res.status(500).send({ error: `There was an issue while updating ${game.name}.` })
                        }),
                    timeout(1000)
                ])
            }
        }
        const filteredGames = gamesToUpdate.filter((game: Game) => {
            return !updatedGames.some((ug: Game) => ug.id === game.id)
        })
        return res.status(200).json([...filteredGames, ...updatedGames])

    }
}

const getGamesToUpdate = (games: Game[]) => {
    const minutesBeforeStale = process.env.NEXT_PUBLIC_MINUTES_BEFORE_STALE
    const today = moment()
    let gamesToUpdate: Game[] = []

    for (const game of games) {
        const lastUpdated = moment(game.dateUpdated)
        const dateDiff = Math.round(today.diff(lastUpdated) / (1000 * 60)) // diff in minutes
        if (dateDiff >= (minutesBeforeStale ?? 60)) {
            gamesToUpdate.push(game)
        }
    }
    return gamesToUpdate
}

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}