import type { NextApiRequest, NextApiResponse } from "next"
import gamesRepo from '../../../../utils/games-repo'
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'PATCH') {
        res.status(405).send('Request must be PATCH.')
    }

    const gameId = parseInt((req.query['gameId']) as string)
    const game = await gamesRepo.getById(gameId)
    if (!game) {
        return res.status(500).send(`Server couldn't find a game with the id ${gameId}.`)
    }

    const url = game.url
    if (url) {
        try {
            const response = await fetch(url)
            const contents = await response.text()
            const newPrice = getPrice(contents)
            const updatedGame = await gamesRepo.update(game.id, { bestPrice: newPrice })
            res.status(200).json(JSON.stringify(updatedGame))
        } catch (err) {
            res.status(500).send({ error: 'There was an issue while updating the game.' })
        }
    }
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}