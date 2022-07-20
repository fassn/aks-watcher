import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import * as cheerio from "cheerio"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "pages/api/auth/[...nextauth]"
import moment from "moment"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        res.status(405).send({ error: 'Request must be POST.' })
    }

    const { userId, url, lastUpdated } = req.body
    if (!url) {
        res.status(500).send({ error: 'There is no provided link.' })
    }
    if (!isUpdatable(lastUpdated)) {
        res.status(500).send({ error: 'This game has already been updated in the last 60 minutes.' })
    }

    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
        res.status(403).send({ error: 'You need to be signed in to use this API route.' })
    }

    if (session) {
        const { id } = session?.user
        if (id !== userId) {
            res.status(403).send({ error: 'You are not allowed to update this game.' })
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
                return res.status(500).send({ error: e.message });
            })
            res.status(200).json(updatedGame)
        } catch (err) {
            res.status(500).send({ error: 'There was an issue while updating the game.' })
        }
    }
}

const isUpdatable = (lastUpdated: string) => {
    const minutesBeforeStale = process.env.NEXT_PUBLIC_MINUTES_BEFORE_STALE
    const today = moment()
    const dateDiff = Math.round(today.diff(moment(lastUpdated)) / (1000 * 60)) // diff in minutes
    return dateDiff >= (minutesBeforeStale ?? 60)
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}