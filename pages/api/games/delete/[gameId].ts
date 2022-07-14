import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "pages/api/auth/[...nextauth]";

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    if (req.method !== 'DELETE') {
        res.status(405).send('Request must be DELETE.')
    }

    const { userId } = req.body
    const session = await unstable_getServerSession(req, res, authOptions);
    if (!session) {
        res.status(403).send({ error: 'You need to be signed in to use this API route.'})
    }

    if (session) {
        const { id } = session?.user
        if (id !== userId) {
            res.status(403).send({ error: 'You are not allowed to update this game.' })
        }

        const gameId = (req.query['gameId'] as string)
        const deletedGame = await prisma.game.delete({
            where: { id: gameId }
        })

        res.status(200).json(deletedGame)
    }
}