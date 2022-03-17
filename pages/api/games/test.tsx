import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../helpers/games-repo'
import { Game } from '../helpers/game'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const date = new Date().toISOString()
    const game: Game = {
        id: 1,
        name: 'Starcraft 2 Legacy of the Void',
        url: 'https://www.allkeyshop.com/blog/buy-starcraft-2-legacy-of-the-void-cd-key-compare-prices/',
        dateCreated: date,
        dateUpdated: date
    }

    const newName = gamesRepo.getNameFromUrl(game.url)
    res.status(200).json({newName})
}
