import { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions);
    const { id: userId } = session?.user

    const games = await prisma.game.findMany({
        where: { userId: userId },
        orderBy: { name: 'asc' }
    })
    res.status(200).json(games)
}