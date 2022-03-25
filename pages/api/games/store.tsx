import type { NextApiRequest, NextApiResponse } from "next"
import { gamesRepo } from '../helpers/games-repo'
import * as cheerio from "cheerio"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
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
                .then(data => {
                    const content = getContent(url, data)
                    gamesRepo.create(content)
                    res.status(200).send({ msg: 'Game has been created successfully.' })
                })
                .catch(() => {
                    res.status(500).send({ error: 'There was an issue while creating the game.' })
                })
        } catch (err) {
            res.status(500).send({ error: 'Failed to fetch data.' })
        }
    }
}

const getContent = (url: string, data: string) => {
    const $ = cheerio.load(data)

    const cover = $('#gamepageSlider').find('.showing').find('img').attr('src') || ''
    const name = $('h1').find('span').first().text().trim()
    const platform = getPlatform(url)
    const bestPrice = Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)

    return { url, cover, name, platform, bestPrice }
}

const getPlatform = (url: string) => {
    // URLs on AllKeyShop seem to follow a pattern when it comes to the game's platform
    // We'll use that to determine on what platform the game is on.
    let platform = ''
    if (url.includes('-cd-key-')) platform = 'PC'
    if (url.includes('-ps5-')) platform = 'PS5'
    if (url.includes('-ps4-')) platform = 'PS5'
    if (url.includes('-xbox-one-')) platform = 'Xbox One'
    if (url.includes('-xbox-series-')) platform = 'Xbox Series'
    return platform
}