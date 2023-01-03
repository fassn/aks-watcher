import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { destroyImage, destroyImages } from "lib/cloudinary";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
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
        const { id, email } = session?.user

        if (id !== userId) {
            return res.status(403).send({ error: 'You are not allowed to delete the games.' })
        }

        const games: Game[] = req.body.games

        // delete cover picture from cloudinary
        let public_ids = []
        for (const game of games) {
            public_ids.push(`${email}/${game.name}`)
        }
        await destroyImages(public_ids)

        const gamesIds = games.map((game: Game) => game.id)
        const deletedGames = await prisma.game.deleteMany({
            where: { id: { in: gamesIds} }
        })

        return res.status(200).json(deletedGames)
    }
}