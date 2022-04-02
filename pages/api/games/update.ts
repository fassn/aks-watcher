import type { NextApiRequest, NextApiResponse } from "next"
import gamesRepo from '../../../utils/games-repo'
import { Game } from "../../../utils/game";
import * as cheerio from "cheerio"
import moment from "moment";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
    if (req.method !== 'POST') {
        res.status(405).send('Request must be POST.')
    }

    const games = req.body

    const gamesToUpdate: Game[] = getGamesToUpdate(games)

    let updatedGames: Game[] = []
    if (gamesToUpdate.length > 0) {
        for (const game of gamesToUpdate) {
            await Promise.all([
                fetch(game.url)
                    .then(res => res.text())
                    .then(async contents => {
                        const newPrice = getPrice(contents)
                        const updatedGame = await gamesRepo.update(game.id, { bestPrice: newPrice })
                        if (updatedGame) updatedGames.push(updatedGame)
                    })
                    .catch(() => {
                        res.status(500).send({ error: `There was an issue while updating ${game.name}.` })
                    })
                // timeout(10000)
            ])
        }
    }
    const filteredGames = gamesToUpdate.filter((game: Game) => {
        return !updatedGames.some((ug: Game) => ug.id === game.id)
    })
    res.status(200).json(JSON.stringify([...filteredGames, ...updatedGames]))
}

const getGamesToUpdate = (games: Game[]) => {
    const daysBeforeStale = process.env.NEXT_PUBLIC_DAYS_BEFORE_STALE
    const today = moment()
    let gamesToUpdate: Game[] = []

    for (const game of games) {
        const lastUpdated = moment(game.dateUpdated)
        const dateDiff = Math.round(today.diff(lastUpdated) / (1000 * 60 * 60 * 24))
        if (dateDiff >= (daysBeforeStale ?? 3)) {
            gamesToUpdate.push(game)
        }
    }
    return gamesToUpdate
}

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms} ms between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}

const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}