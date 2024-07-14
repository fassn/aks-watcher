import prisma from "lib/prisma"
import { Game, Platform } from "@prisma/client"
import * as cheerio from "cheerio"
import { AjaxQuery, ScrapedContent } from "types/interfaces"
import { uploadImage } from "lib/cloudinary";

export async function fetchContent(url: string): Promise<ScrapedContent> {
    try {
        const res = await fetch(url);
        const data = await res.text();
        const content = await getContent(url, data);

        return content
    } catch (e: any) {
        throw new Error(`There was an issue while fetching the game from ${url}. ${e.message}`);
    }
}

function getContent(url: string, data: string): ScrapedContent {
    const $ = cheerio.load(data)

    const aksId = $('div[data-follow-container=1]').find('.meta-progress').attr('data-product-id')
    if (!aksId) {
        throw new Error(`Couldn\'t get the AKS game ID from ${url}`)
    }

    const cover = $('#gamepageSlider').find('.showing').find('img').attr('src') ?? ''
    if (!cover) {
        throw new Error(`Couldn\'t get the cover image from ${url}`)
    }

    const name = $('h1').find('span').first().text().trim()
    if (!name) {
        throw new Error(`Couldn\'t get the name from ${url}`)
    }
    const platform = getPlatform(url)

    return { url, aksId, cover, coverUrl: '', name, platform, bestPrice: 0 }
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

export async function uploadCoverImage(content: ScrapedContent, userEmail: string): Promise<string> {
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

export const updatePrice = async (game: Game): Promise<Game> => {

    if (!game.aksId) {
        game = await updateAksId(game)
    }

    const newBestPrice = await fetchBestPrice(game.aksId as string)
    const updatedGame: Game = await updateGame(game, newBestPrice)

    return updatedGame
}

const updateAksId = async (game: Game): Promise<Game> => {
    const aksId = await fetchContent(game.url).then(content => content.aksId)

    const updatedGame = await prisma.game.update({
        where: { id: game.id },
        data: { aksId: aksId }
    }).catch(e => {
        throw new Error(e.message)
    })

    return updatedGame
}

export async function fetchBestPrice(aksId: string): Promise<number> {
    const ajax: AjaxQuery = {
        url: 'https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?action=get_offers&',
        product: aksId,
        currency: 'eur',
        locale: 'en',
        use_beta_offers_display: 1,
    }

    try {

        const res = await fetch(ajax.url
            + `product=${ajax.product}`
            + `&currency=${ajax.currency}`
            + `&locale=${ajax.locale}`
            + `&use_beta_offers_display=${ajax.use_beta_offers_display}`
        )
        const data = await res.json()

        return data['offers'][0]['price']['eur']['priceCard'] as number

    } catch (e) {
        throw new Error(`Couldn't get the best price for game ${ajax.product}.`)
    }
}

const updateGame = async (game: Game, newBestPrice: number): Promise<Game> => {
    const updatedDate = new Date().toISOString()

    const updatedGame = await prisma.game.update({
        where: { id: game.id },
        data: {
            prices: {
                create: {
                    bestPrice: newBestPrice,
                    date: updatedDate
                }
            },
            dateUpdated: updatedDate
        }
    }).catch(e => {
        throw new Error(e.message)
    })

    return updatedGame
}

export const getPrice = (contents: string) => {
    let $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || null)
}

export const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}