import prisma from "lib/prisma"
import { Game } from "@prisma/client"
import * as cheerio from "cheerio"

export const updateGame = async (gameId: string, gameUrl: string): Promise<Game> => {
    return await fetch(gameUrl)
        .then(res => res.text())
        .then(async contents => {
            const newPrice = getPrice(contents)
            if (newPrice === null) {
                throw new Error(`Could not get the new price for the game with id ${gameId}`)
            }
            const updatedDate = new Date().toISOString()
            const updatedGame: Game = await prisma.game.update({
                where: { id: gameId },
                data: {
                    prices: {
                        create: {
                            bestPrice: newPrice,
                            date: updatedDate
                        }
                    },
                    dateUpdated: updatedDate
                }
            }).catch(e => {
                throw new Error(e.message)
            })
            return updatedGame
        })
        .catch((e) => {
            throw new Error(`There was an issue while fetching the game ${gameUrl}.\n${e.message}`)
        })
}

export const getPrice = (contents: string) => {
    let $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || null)
}

export const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}