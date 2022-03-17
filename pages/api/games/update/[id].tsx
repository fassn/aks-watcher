import type { NextApiRequest, NextApiResponse } from "next"
import { Game } from "../../helpers/game";
import { gamesRepo } from '../../helpers/games-repo'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method === 'PATCH') {
        const gameId = req.body?.id
        if (!gameId) {
            return res.status(400).send('Request doesn\'t provide a game ID.')
        }

        const game = gamesRepo.getById(gameId)
        if (!game) {
            return res.status(500).send(`Server couldn't find a game with the id ${gameId}.`)
        }

        const gameUrl = req.body?.url
        game.url = gameUrl
        game.dateUpdated = new Date().toISOString()


    } else {
        res.status(405).send('Request needs to be PATCH.')
    }
}
