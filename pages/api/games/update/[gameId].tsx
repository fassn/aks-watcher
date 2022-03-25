import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../../helpers/games-repo'
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'PATCH') {
        res.status(405).send('Request needs to be PATCH.')
    }

    const gameId = parseInt((req.query['gameId']) as string)
    const game = gamesRepo.getById(gameId)
    if (!game) {
        return res.status(500).send(`Server couldn't find a game with the id ${gameId}.`)
    }

    const url = game.url
    if (url) {
        try {
            await fetch(url).then(res => res.text())
            .then(contents => {
                const newPrice = getPrice(contents)
                gamesRepo.update(game.id, { bestPrice: newPrice })
                const updatedGame = gamesRepo.getById(game.id)
                res.status(200).json(JSON.stringify(updatedGame))
            })
            .catch(() => {
                res.status(500).send({ error: 'There was an issue while updating the game.' })
            })
        } catch (err) {
            res.status(500).send({ error: 'Failed to fetch data.' })
        }
    }
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}