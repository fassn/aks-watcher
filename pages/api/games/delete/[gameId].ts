import type { NextApiRequest, NextApiResponse } from "next"
import gamesRepo from "../../../../utils/games-repo"

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
    if (req.method !== 'DELETE') {
        res.status(405).send('Request must be DELETE.')
    }

    const gameId = parseInt((req.query['gameId']) as string)
    const game = await gamesRepo.delete(gameId)

    res.status(200).json(game)
}