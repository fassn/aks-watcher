import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { destroyImage } from "lib/cloudinary";

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

        // TODO SEE if I can mass delete cover picture on cloudinary instead of looping
        for (const game of games) {
            const name = game.name
            // delete cover picture from cloudinary
            try {
                await destroyImage(`${email}/${name}`)
            } catch {
                console.warn('There was an issue deleting the cover image of the deleted game ' + name)
            }
        }

        const gamesIds = games.map((game: Game) => game.id)

        const deletedGames = await prisma.game.deleteMany({
            where: { id: { in: gamesIds} }
        })

        console.log({deletedGames})

        return res.status(200).json(deletedGames)
    }
}