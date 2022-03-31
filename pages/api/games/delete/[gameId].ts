import type { NextApiRequest, NextApiResponse } from "next"
import gamesRepo from "../helpers/games-repo"

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    if (req.method !== 'DELETE') {
        res.status(405).send('Request must be DELETE.')
    }

    const gameId = parseInt((req.query['gameId']) as string)
    const game = await gamesRepo.getById(gameId)
    if (!game) {
        return res.status(500).send(`Server couldn't find a game with the id ${gameId}.`)
    }
    await gamesRepo.delete(gameId)

    res.status(200).json({})
}