import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../helpers/games-repo'
import { Game } from '../helpers/game'

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const date = new Date().toISOString()
    const game: Game = {
        "id": 1,
        "name": "Commandos Behind Enemy Lines",
        "url": "https://www.example.com",
        "cover": "https://www.allkeyshop.com/blog/wp-content/uploads/buy-commandos-behind-enemy-lines-cd-key-pc-download-img1.jpg",
        "platform": "PC",
        "bestPrice": 5.03,
        "dateCreated": "2022-03-14T16:55:10.267Z",
        "dateUpdated": "2022-03-14T16:55:10.267Z"
    }

    res.status(200).json({game})
}
