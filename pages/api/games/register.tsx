import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../helpers/games-repo'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method === "POST") {
        const game = req.body
        gamesRepo.create(game)

        const games = gamesRepo.getAll()
        res.statusMessage = 'Game has been created successfully.'
        res.status(200).json({ games })
    } else {
        res.status(405).send('Request needs to be POST.')
    }
}
