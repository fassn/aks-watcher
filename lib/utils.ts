export const fetcher = async (
    input: RequestInfo,
    init?: RequestInit
): Promise<any> => await fetch(input, init).then(res => res.json())


export const timeout = (ms: number) => {
    console.warn(`Waiting ${ms / 1000} s between requests.`)
    return new Promise(resolve => setTimeout(resolve, ms))
}


import * as cheerio from "cheerio"
export const getPrice = (contents: string) => {
    const $ = cheerio.load(contents)

    return Number($('.content').find('meta[data-itemprop=lowPrice]').attr('content') || -1)
}