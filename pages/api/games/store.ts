import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game, Platform } from "@prisma/client"
import * as cheerio from "cheerio"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { uploadImage } from "lib/cloudinary"
import { timeout } from "../utils"

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

        let urls: string[] = req.body.urls
        if (urls.length === 0) {
            return res.status(400).send({ error: 'There is no provided link.' })
        }

        if (urls) {
            try {
                urls = await filterGamesToCreate(urls)
            } catch (e) {
                return res.status(500).send({ error: e })
            }

            if (urls.length === 0) {
                return res.status(400).send({ error: 'The games provided are already tracked.' })
            }

            const newGames: Game[] = []
            for (const url of urls) {
                await Promise.all([
                    fetch(url).then(res => res.text())
                        .then(async data => {
                            try {
                                const content: ScrapedContent = await getContent(url, data)
                                const coverUrl = await uploadCoverImage(content)
                                const game = await storeToDatabase(url, content, coverUrl)
                                if (game) newGames.push(game)
                            } catch (e) {
                                return res.status(500).send({ error: e })
                            }
                        })
                        .catch(e => {
                            return res.status(500).send({ error: `There was an issue while fetching the game from ${url}. ${e.message}` })
                        }),
                    timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
                ])
            }
            return res.status(200).json(newGames)
        }
    }

    async function filterGamesToCreate(gamesUrls: string[]) {
        const urls = [... new Set(gamesUrls)] // deduplicate urls
        const storedGames = await prisma.game.findMany({
            where: {
                userId: userId,
                url: { in: urls }
            }
        })
        if (storedGames.length > 0) {
            for (const game of storedGames) {
                console.warn(`Game ${game.name} already exists in the database. Skipping.`)
                urls.splice(urls.indexOf(game.url), 1)
            }
        }
        return urls
    }

    function getContent(url: string, data: string): ScrapedContent {
        const $ = cheerio.load(data)

        const cover = $('#gamepageSlider').find('.showing').find('img').attr('src') ?? ''
        if (!cover) {
            throw new Error(`Couldn\'t get the cover image from ${url}`)
        }

        const name = $('h1').find('span').first().text().trim()
        if (!name) {
            throw new Error(`Couldn\'t get the name from ${url}`)
        }
        const platform = getPlatform(url)
        const bestPrice = Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content'))
        if (!bestPrice) {
            throw new Error(`Couldn\'t get the price from ${url}`)
        }
        return { url, cover, name, platform, bestPrice }
    }

    function getPlatform(url: string) {
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

    async function uploadCoverImage(content: ScrapedContent): Promise<CoverUrl> {
        const dummyCover = 'https://dummyimage.com/256/ffffff/000.png'
        try {
            const res = await uploadImage(content.cover,
                {
                    public_id: `${userEmail}/${content.name}`,
                    resource_type: 'image',
                    overwrite: true,
                })
            if (res) return res.secure_url
        } catch (e) {
            console.warn(`Cover picture could not be uploaded for ${content.name}.`)
        }
        return dummyCover
    }

    type CoverUrl = string
    async function storeToDatabase(url: string, content: { url: string; cover: string; name: string; platform: Platform; bestPrice: number }, coverUrl: string) {
        return await prisma.game.create({
            data: {
                userId: userId,
                url: url,
                name: content.name,
                cover: coverUrl,
                platform: content.platform,
                bestPrice: content.bestPrice,
                dateCreated: new Date().toISOString(),
                dateUpdated: new Date().toISOString(),
            }
        })
    }
}