import { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions);

    /** Unlogged User */
    if (!session) {
        const exampleGames = await prisma.game.findMany({
            where: { userId: null },
            include: {
                prices: true
            }
        })
        return res.status(200).json(exampleGames)
    }

    /** Logged User */
    if (session) {
        const { id: userId } = session?.user

        const games = await prisma.game.findMany({
            where: { userId: userId },
            include: {
                prices: true
            },
            orderBy: { name: 'asc' }
        })

        return res.status(200).json(games)
    }
}