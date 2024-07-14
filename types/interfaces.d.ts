export interface ScrapedContent {
    url: string,
    aksId: string,
    name: string,
    cover: string,
    coverUrl: string,
    platform: Platform,
    bestPrice: number,
}

export interface AjaxQuery {
    url: string,
    product: string,
    currency: string,
    region?: string,
    edition?: string,
    moreq?: string,
    locale: string,
    use_beta_offers_display: number,
}