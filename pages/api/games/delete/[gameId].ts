import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    if (req.method !== 'DELETE') {
        res.status(405).send('Request must be DELETE.')
    }

    const gameId = (req.query['gameId'] as string)
    const deletedGame = await prisma.game.delete({
        where: { id: gameId }
    })

    res.status(200).json(deletedGame)
}