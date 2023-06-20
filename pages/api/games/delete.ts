import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game } from "@prisma/client";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { destroyImages } from "lib/cloudinary";

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

    if (session) {
        const { userId, games }: { userId: string, games: Game[] } = req.body
        const { id, email } = session?.user

        if (id !== userId) {
            return res.status(403).send({ error: 'You are not allowed to delete the games.' })
        }

        if(!games) {
            console.warn('Games were not provided in the request. Cover images won\'t be deleted from cloudinary.');
        }

        // delete cover picture from cloudinary
        if (games) {
            let public_ids = []
            for (const game of games) {
                public_ids.push(`${email}/${game.name}`)
            }
            await destroyImages(public_ids)
        }

        const deletedGames = await prisma.game.deleteMany({
            where: { userId: id }
        })

        return res.status(200).json(deletedGames)
    }
}