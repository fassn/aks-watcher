import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "lib/prisma"
import { Game } from "@prisma/client"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]"
import { fetchBestPrice, fetchContent, timeout, uploadCoverImage } from "../shared"
import { ScrapedContent } from "types/interfaces"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
        return res.status(403).send({ error: 'You need to be signed in to use this API route.'})
    }

    const { id: userId, email: userEmail } = session?.user
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

                    // Fetch the game's content: name, cover image, platform, AKS game ID, etc.
                    await fetchContent(url)
                    .then(async content => {

                        // Upload the cover image to Cloudinary
                        const coverUrl = await uploadCoverImage(content, userEmail);
                        content.coverUrl = coverUrl;

                        // Fetch the game's best price from AllKeyShop with the AKS game ID
                        content.bestPrice = await fetchBestPrice(content.aksId)

                        // Store the game in the database
                        await storeToDatabase(url, content)
                        .then(game => {
                            if (game) newGames.push(game)
                        })

                    }),

                    // Wait between queries
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

    async function storeToDatabase(url: string, content: ScrapedContent): Promise<Game> {
        const date = new Date().toISOString()

        return await prisma.game.create({
            data: {
                userId: userId,
                url: url,
                aksId: content.aksId,
                name: content.name,
                cover: content.coverUrl,
                platform: content.platform,
                prices: {
                    create: {
                        bestPrice: content.bestPrice,
                        date: date,
                    }
                },
                dateCreated: date,
                dateUpdated: date,
            }
        })
    }
}