import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "pages/api/auth/[...nextauth]"
import moment from "moment"
import { updateGame } from "pages/api/utils"
import prisma from "lib/prisma"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
        return res.status(403).send({ error: 'You need to be signed in to use this API route.' })
    }

    if (req.method !== 'POST') {
        return res.status(405).send({ error: 'Request must be POST.' })
    }

    const { id } = session?.user
    const { userId } = req.body
    const gameId = (req.query['gameId']) as string
    if (id !== userId) {
        return res.status(403).send({ error: 'You are not allowed to update this game.' })
    }
    if (!gameId) {
        return res.status(400).send({ error: 'No game ID was provided in the request.' })
    }
    const game = await prisma.game.findFirst({
        where: { id: gameId }
    })
    if (!game) {
        return res.status(400).send({ error: 'The game doesnt exist.' })
    }
    const lastUpdated = game.dateUpdated.toISOString()
    if (!isUpdatable(lastUpdated)) {
        return res.status(400).send({ error: 'This game has already been updated in the last 60 minutes.' })
    }

    try {
        const updatedGame = await updateGame(gameId, game.url)
        return res.status(200).json(updatedGame)
    } catch (err) {
        return res.status(500).send({ error: 'There was an issue while updating the game.' })
    }
}

const isUpdatable = (lastUpdated: string) => {
    const minutesBeforeStale = 60
    const today = moment()
    const dateDiff = Math.round(today.diff(moment(lastUpdated)) / (1000 * 60)) // diff in minutes
    return dateDiff >= (minutesBeforeStale ?? 60)
}