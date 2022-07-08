import { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../utils/prisma"

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const games = await prisma.game.findMany()
    res.status(200).json(games)
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Error reading data' })
  }
}