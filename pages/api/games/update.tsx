import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../helpers/games-repo'
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        res.status(405).send('Request must be POST.')
    }

    const gameIds: number[] = req.body
    for (const id of gameIds) {
        const game = gamesRepo.getById(id)
        if (!game) {
            console.warn(`There is no game with the id ${id}. Skipping to the next one.`)
            continue
        }

        await Promise.all([
            fetch(game.url)
                .then(res => res.text())
                .then(contents => {
                    const newPrice = getPrice(contents)
                    gamesRepo.update(game.id, { bestPrice: newPrice })
                })
                .catch(() => {
                    res.status(500).send({ error: `There was an issue while updating ${game.name}.` })
                }),
            timeout(10000)
        ])
    }
    res.status(200).json(JSON.stringify(gamesRepo.getAll()))
}

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms} ms between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}