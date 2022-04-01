import { NextApiRequest, NextApiResponse } from "next"
import { Game } from "../../../utils/game"
import gamesRepo from "../../../utils/games-repo"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const games: Game[] = await gamesRepo.getAll()
    res.status(200).json(games)
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error reading data' })
  }
}