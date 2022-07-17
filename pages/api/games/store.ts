import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Platform } from "@prisma/client"
import * as cheerio from "cheerio"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"

interface ScrapedContent {
    url: string,
    name: string,
    cover: string,
    platform: Platform,
    bestPrice: number
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions)
    const { id: userId } = session?.user
    if (!session) {
        res.status(403).send({ error: 'You need to be signed in to use this API route.'})
    }

    if (session) {
        if (req.method !== 'POST') {
            res.status(405).send({ error: 'Request needs to be POST.' })
        }

        const url: string = req.body.url
        if (!url) {
            res.status(500).send({ error: 'There is no provided link.' })
        }

        if (url) {
            try {
                await fetch(url).then(res => res.text())
                    .then(async data => {
                        let content: ScrapedContent
                        try {
                            content = getContent(url, data)
                        } catch (e: any) {
                            const error = 'Are you sure the AllKeyShop URL is correct? ' + e.message
                            return res.status(500).send({ error: error })
                        }
                        const game = await prisma.game.upsert({
                            where: { url: url },
                            update: {},
                            create: {
                                userId: userId,
                                url: url,
                                name: content.name,
                                cover: content.cover,
                                platform: content.platform,
                                bestPrice: content.bestPrice,
                                dateCreated: new Date().toISOString(),
                                dateUpdated: new Date().toISOString(),
                            }
                        })
                        res.status(200).send(game)
                    })
                    .catch(() => {
                        res.status(500).send({ error: 'There was an issue while creating the game.' })
                    })
            } catch (err) {
                res.status(500).send({ error: 'Failed to fetch data.' })
            }
        }
    }
}

const getContent = (url: string, data: string) => {
    const $ = cheerio.load(data)

    const cover = $('#gamepageSlider').find('.showing').find('img').attr('src')
    if (!cover) {
        throw new Error('Couldn\'t get the image from ' + url)
    }
    const name = $('h1').find('span').first().text().trim()
    if (!name) {
        throw new Error('Couldn\'t get the name from ' + url)
    }
    const platform = getPlatform(url)
    const bestPrice = Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content'))
    if (!bestPrice) {
        throw new Error('Couldn\'t get the price from ' + url)
    }
    return { url, cover, name, platform, bestPrice }
}

const getPlatform = (url: string) => {
    // URLs on AllKeyShop seem to follow a pattern when it comes to the game's platform
    // We'll use that to determine on what platform the game is on.
    let platform: Platform = Platform.PC
    if (url.includes('-cd-key-')) platform = Platform.PC
    if (url.includes('-ps5-')) platform = Platform.PS5
    if (url.includes('-ps4-')) platform = Platform.PS4
    if (url.includes('-xbox-one-')) platform = Platform.XBOX_ONE
    if (url.includes('-xbox-series-')) platform = Platform.XBOX_SERIES
    return platform
}