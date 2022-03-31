import type { NextApiRequest, NextApiResponse } from "next"
import gamesRepo from './helpers/games-repo'
import { Game } from "./helpers/game";
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        res.status(405).send('Request must be POST.')
    }

    let updatedGames: Game[] = []
    const gameIds: number[] = req.body
    for (const id of gameIds) {
        const game = await gamesRepo.getById(id)
        if (!game) {
            console.warn(`There is no game with the id ${id}. Skipping to the next one.`)
            continue
        }

        await Promise.all([
            fetch(game.url)
                .then(res => res.text())
                .then(async contents => {
                    const newPrice = getPrice(contents)
                    const updatedGame = await gamesRepo.update(game.id, { bestPrice: newPrice })
                    if (updatedGame) updatedGames.push(updatedGame)
                })
                .catch(() => {
                    res.status(500).send({ error: `There was an issue while updating ${game.name}.` })
                }),
            timeout(10000)
        ])
    }
    res.status(200).json(JSON.stringify(updatedGames))
}

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms} ms between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}