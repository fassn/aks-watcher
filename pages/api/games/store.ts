import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game, Platform } from "@prisma/client"
import * as cheerio from "cheerio"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { uploadImage } from "lib/cloudinary"

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
    const { id: userId, email: userEmail } = session?.user
    if (!session) {
        return res.status(403).send({ error: 'You need to be signed in to use this API route.'})
    }

    if (session) {
        if (req.method !== 'POST') {
            return res.status(405).send({ error: 'Request needs to be POST.' })
        }

        const urls: string[] = req.body.urls
        if (urls.length === 0) {
            return res.status(400).send({ error: 'There is no provided link.' })
        }

        if (urls) {
            const existingGames = await prisma.game.findMany({
                where: {
                    userId: userId,
                    url: { in: urls }
                }
            })
            if (existingGames.length > 0) {
                for (const game of existingGames) {
                    console.warn(`Game ${game.name} already exists in the database. Skipping.`)
                    urls.splice(urls.indexOf(game.url), 1)
                }
            }
            const newGames: Game[] = []
            for (const url of urls) {
                try {
                    await Promise.all([
                        fetch(url).then(res => res.text())
                            .then(async data => {
                                let content: ScrapedContent
                                let cloudinaryUrl: string
                                try {
                                    content = await getContent(url, data)
                                    const cloudinaryImage = await uploadImage(content.cover,
                                        {
                                            public_id: `${userEmail}/${content.name}`,
                                            resource_type: 'image',
                                            overwrite: true,
                                        })

                                    cloudinaryUrl = cloudinaryImage?.secure_url
                                    if (!cloudinaryUrl) {
                                        throw new Error('Couldn\'t upload image to cloudinary')
                                    }

                                    const game = await prisma.game.create({
                                        data: {
                                            userId: userId,
                                            url: url,
                                            name: content.name,
                                            cover: cloudinaryUrl,
                                            platform: content.platform,
                                            bestPrice: content.bestPrice,
                                            dateCreated: new Date().toISOString(),
                                            dateUpdated: new Date().toISOString(),
                                        }
                                    })
                                    if (game) newGames.push(game)
                                } catch (e: any) {
                                    const error = 'Are you sure the AllKeyShop URL is correct? ' + e.message
                                    return res.status(400).send({ error: error })
                                }
                            })
                            .catch(e => {
                                return res.status(500).send({ error: `There was an issue while creating the game from ${url}. ${e.message}` })
                            }),
                        timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
                    ])
                } catch (err) {
                    return res.status(500).send({ error: `Failed to fetch data from ${url}.` })
                }
            }
            return res.status(200).json(newGames)
        }
    }
}

const getContent = async (url: string, data: string) => {
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

const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}