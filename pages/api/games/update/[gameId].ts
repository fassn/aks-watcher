import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../../utils/prisma"
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        res.status(405).send('Request must be POST.')
    }

    const url: string = req.body.url
    if (!url) {
        res.status(500).send({ error: 'There is no provided link.' })
    }

    try {
        const response = await fetch(url)
        const contents = await response.text()
        const newPrice = getPrice(contents)

        const gameId = (req.query['gameId']) as string
        const updatedGame = await prisma.game.update({
            where: { id: gameId },
            data: {
                bestPrice: newPrice,
                dateUpdated: new Date().toISOString()
            }
        }).catch(e => {
            return res.status(500).send(e);
        })
        res.status(200).json(updatedGame)
    } catch (err) {
        res.status(500).send({ error: 'There was an issue while updating the game.' })
    }
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}