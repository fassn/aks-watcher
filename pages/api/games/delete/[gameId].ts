import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { auth } from "auth";
import { destroyImage } from "lib/cloudinary";

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await auth(req, res);
    if (!session) {
        return res.status(403).send({ error: 'You need to be signed in to use this API route.' })
    }

    if (req.method !== 'DELETE') {
        return res.status(405).send({ error: 'Request must be DELETE.' })
    }

    const { userId, name } = req.query
    const id = session.user?.id
    const email = session.user?.email
    if (!id || !email) {
        return res.status(403).send({ error: 'You are not allowed to delete this game.' })
    }
    if (id !== userId) {
        return res.status(403).send({ error: 'You are not allowed to delete this game.' })
    }

    const gameId = (req.query['gameId'] as string)

    const deletedGame = await prisma.game.delete({
        where: { id: gameId }
    })

    // delete cover picture from cloudinary
    try {
        await destroyImage(`${email}/${name}`)
    } catch {
        console.warn('There was an issue deleting the cover image of the deleted game ' + name)
    }

    return res.status(200).json(deletedGame)
}
