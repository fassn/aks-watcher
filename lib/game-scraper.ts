import prisma from "lib/prisma"
import { Game, Platform } from "@prisma/client"
import * as cheerio from "cheerio"
import { ScrapedContent } from "types/interfaces"
import { uploadImage } from "lib/cloudinary";

const DUMMY_COVER = 'https://dummyimage.com/256/ffffff/000.png'
const FETCH_TIMEOUT_MS = process.env.NODE_ENV === 'production' ? 12_000 : 1_000

export async function fetchContent(url: string): Promise<ScrapedContent> {
    const fallbackContent = buildFallbackContent(url)

    try {
        const data = await fetchPageHtml(url)
        return getContent(url, data, fallbackContent)
    } catch (e: any) {
        console.warn(`Couldn't fetch game content from ${url}: ${e.message}. Using URL fallback.`)
        return fallbackContent
    }
}

async function fetchPageHtml(url: string): Promise<string> {
    const res = await fetch(url, {
        headers: {
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'accept-language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
    })
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
    }

    return await res.text()
}

function getContent(url: string, data: string, fallbackContent: ScrapedContent): ScrapedContent {
    const $ = cheerio.load(data)

    const aksId = getAksId($, data) ?? fallbackContent.aksId
    const cover = getCover($) ?? fallbackContent.cover
    const name = getName($) ?? fallbackContent.name
    const platform = getPlatform(url)

    return { url, aksId, cover, coverUrl: '', name, platform, bestPrice: 0 }
}

function getAksId($: cheerio.CheerioAPI, html: string): string | undefined {
    const selectorCandidates = [
        $('div[data-follow-container="1"] .meta-progress').attr('data-product-id'),
        $('div[data-product-id]').first().attr('data-product-id'),
        $('[data-aks-product-id]').first().attr('data-aks-product-id'),
        $('[data-product]').first().attr('data-product'),
        $('meta[property="product:retailer_item_id"]').attr('content'),
    ]
    const selectorId = selectorCandidates.find((value) => typeof value === 'string' && value.trim().length > 0)
    if (selectorId) return selectorId

    for (const jsonLdEntry of getJsonLdEntries($)) {
        const jsonLdId = readNonEmptyString(jsonLdEntry['productID'])
            ?? readNonEmptyString(jsonLdEntry['productId'])
            ?? readNonEmptyString(jsonLdEntry['sku'])
            ?? readNonEmptyString(jsonLdEntry['mpn'])
        if (jsonLdId) return jsonLdId
    }

    const htmlMatch = html.match(/"product(?:_|)id"\s*:\s*"?(\d{3,})"?/i)
    return htmlMatch?.[1]
}

function getCover($: cheerio.CheerioAPI): string | undefined {
    const candidates = [
        $('#gamepageSlider .showing img').attr('src'),
        $('#gamepageSlider img').first().attr('src'),
        $('meta[property="og:image"]').attr('content'),
        $('meta[name="twitter:image"]').attr('content'),
    ]

    return candidates.find((value) => typeof value === 'string' && value.trim().length > 0)
}

function getName($: cheerio.CheerioAPI): string | undefined {
    const rawNameCandidates = [
        $('h1 span').first().text(),
        $('h1').first().text(),
        $('meta[property="og:title"]').attr('content') ?? '',
        $('title').first().text(),
    ]

    for (const rawName of rawNameCandidates) {
        const normalizedName = normalizeName(rawName)
        if (normalizedName) {
            return normalizedName
        }
    }

    for (const jsonLdEntry of getJsonLdEntries($)) {
        const jsonLdName = normalizeName(readNonEmptyString(jsonLdEntry['name']) ?? '')
        if (jsonLdName) return jsonLdName
    }

    return undefined
}

function normalizeName(name: string): string {
    if (!name) return ''

    return name
        .replace(/^buy\s+/i, '')
        .replace(/\s*-\s*allkeyshop.*$/i, '')
        .replace(/\s*(cd key|ps5|ps4|xbox one|xbox series(?: x| s)?)\s*compare prices?.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim()
}

function getJsonLdEntries($: cheerio.CheerioAPI): Record<string, unknown>[] {
    const entries: Record<string, unknown>[] = []

    $('script[type="application/ld+json"]').each((_index, element) => {
        const rawJson = $(element).text().trim()
        if (!rawJson) return

        try {
            collectJsonLdEntries(JSON.parse(rawJson), entries)
        } catch {
            // Some JSON-LD blocks contain non-JSON values; ignore invalid blocks.
        }
    })

    return entries
}

function collectJsonLdEntries(candidate: unknown, entries: Record<string, unknown>[]) {
    if (Array.isArray(candidate)) {
        for (const item of candidate) collectJsonLdEntries(item, entries)
        return
    }

    if (!candidate || typeof candidate !== 'object') {
        return
    }

    const entry = candidate as Record<string, unknown>
    entries.push(entry)

    const graph = entry['@graph']
    if (Array.isArray(graph)) {
        for (const graphEntry of graph) {
            collectJsonLdEntries(graphEntry, entries)
        }
    }
}

function readNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
}

function buildFallbackContent(url: string): ScrapedContent {
    const slug = getSlugFromUrl(url)
    const name = slugToTitle(slug) || 'Unknown game'

    return {
        url,
        aksId: slug ? `slug-${slug}` : `slug-${encodeURIComponent(url)}`,
        name,
        cover: DUMMY_COVER,
        coverUrl: '',
        platform: getPlatform(url),
        bestPrice: 0,
    }
}

function getSlugFromUrl(url: string): string {
    try {
        const path = new URL(url).pathname.toLowerCase()
        const match = path.match(/\/buy-(.+?)-(?:cd-key|ps5|ps4|xbox-one|xbox-series)-compare-prices\/?$/)
        return match?.[1] ?? ''
    } catch {
        return ''
    }
}

function slugToTitle(slug: string): string {
    if (!slug) return ''
    return slug
        .split('-')
        .filter(Boolean)
        .map((part) => /^\d+$/.test(part) ? part : part[0].toUpperCase() + part.slice(1))
        .join(' ')
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
    return DUMMY_COVER
}

export const updatePrice = async (game: Game): Promise<Game> => {

    if (!game.aksId) {
        game = await updateAksId(game)
    }

    const newBestPrice = await fetchBestPrice(game.aksId as string, game.url)
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

export async function fetchBestPrice(aksId: string, gameUrl?: string): Promise<number> {
    const ajaxPrice = await fetchBestPriceFromAjax(aksId)
    if (ajaxPrice !== null) {
        return ajaxPrice
    }

    if (gameUrl) {
        const pagePrice = await fetchBestPriceFromPage(gameUrl)
        if (pagePrice !== null) {
            return pagePrice
        }
    }

    console.warn(`Couldn't fetch best price for game ${aksId}. Falling back to 0 EUR.`)
    return 0
}

async function fetchBestPriceFromAjax(aksId: string): Promise<number | null> {
    if (!/^\d+$/.test(aksId)) {
        return null
    }

    const searchParams = new URLSearchParams({
        action: 'get_offers',
        product: aksId,
        currency: 'eur',
        locale: 'en',
        use_beta_offers_display: '1',
    })

    try {
        const res = await fetch(
            `https://www.allkeyshop.com/blog/wp-admin/admin-ajax.php?${searchParams.toString()}`,
            { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }
        )
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`)
        }

        const data = await res.json()
        const rawPrice = data?.offers?.[0]?.price?.eur?.priceCard
            ?? data?.offers?.[0]?.price?.eur?.price
            ?? data?.offers?.[0]?.price?.priceCard

        const parsedPrice = parseNumericPrice(rawPrice)
        return parsedPrice
    } catch (e: any) {
        console.warn(`Couldn't get AJAX best price for game ${aksId}: ${e.message}`)
        return null
    }
}

function parseNumericPrice(rawValue: unknown): number | null {
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
        return rawValue
    }
    if (typeof rawValue !== 'string') {
        return null
    }

    const normalized = rawValue.replace(',', '.').replace(/[^\d.]/g, '')
    if (!normalized) {
        return null
    }

    const value = Number(normalized)
    return Number.isFinite(value) ? value : null
}

async function fetchBestPriceFromPage(gameUrl: string): Promise<number | null> {
    try {
        const html = await fetchPageHtml(gameUrl)
        const pagePrice = getPrice(html)
        return pagePrice > 0 ? pagePrice : null
    } catch (e: any) {
        console.warn(`Couldn't read fallback page price from ${gameUrl}: ${e.message}`)
        return null
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
    const $ = cheerio.load(contents)
    const rawPriceCandidates = [
        $('.content').find('meta[data-itemprop=lowPrice]').attr('content'),
        $('meta[itemprop="lowPrice"]').attr('content'),
        $('meta[property="product:price:amount"]').attr('content'),
    ]

    for (const rawPrice of rawPriceCandidates) {
        const price = parseNumericPrice(rawPrice)
        if (price !== null) {
            return price
        }
    }

    return 0
}

export const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}
