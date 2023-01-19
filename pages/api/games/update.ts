import type { NextApiRequest, NextApiResponse } from "next"
import { Game } from "@prisma/client";
import moment from "moment";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import update from "../queues/update";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
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
            return res.status(400).send({ error: 'There were no games to update. \
            Have you already updated the games in the last hour?'})
        }

        if (gamesToUpdate.length > 0) {
            await update.enqueue(gamesToUpdate, { id: userId })
            .then((jobPayload) => res.status(200).json(jobPayload))
            .catch((e) => {
                return res.status(500).send({ error: `There was an issue with the update queue: ${e.message}`})
            })
        }
    }
}

const getGamesToUpdate = (games: Game[]) => {
    const minutesBeforeStale = 60
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