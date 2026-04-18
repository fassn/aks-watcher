import { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { auth } from "auth"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await auth(req, res);

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
        const userId = session.user?.id
        if (!userId) {
            return res.status(400).json({ error: 'Your account is missing required profile fields.' })
        }

        const games = await prisma.game.findMany({
            where: { userId: userId },
            include: {
                prices: true
            },
            orderBy: { name: 'asc' }
        })

        // sort the game prices by date (mutates the original array)
        games.map(game => {
            return game.prices.sort((a, b) => {
                return new Date(a.date).getTime() - new Date(b.date).getTime()
            })
        })

        return res.status(200).json(games)
    }
}
