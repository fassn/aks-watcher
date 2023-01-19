import { Game } from "@prisma/client"

describe('tests /api/games/store endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('requires to be logged in', () => {
        cy.request({
            url: 'api/games/store',
            method: 'POST',
            body: ['https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/'],
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(403)
            expect(res.body).to.deep.equal({ error: 'You need to be signed in to use this API route.'})
        })
    })

    it('requires to use a POST request', () => {
        cy.login()
        cy.request({
            url: 'api/games/store',
            method: 'GET',
            body: ['https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/'],
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(405)
            expect(res.body).to.deep.equal({ error: 'Request needs to be POST.' })
        })
    })

    it('requires the payload to have at least one link', () => {
        cy.login()
        cy.request({
            url: 'api/games/store',
            method: 'POST',
            body: { urls: [] },
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(400)
            expect(res.body).to.deep.equal({ error: 'There is no provided link.' })
        })
    })

    it('skips a game if it exists already', () => {
        cy.login()
        cy.task('createGames', { count: 1 })
        cy.request({
            url: 'api/games/store',
            method: 'POST',
            body: { urls: ['https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/'] },
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(400)
            expect(res.body).to.deep.equal({ error: 'The games provided are already tracked.' })
        })
    })

    it('doesnt add a game twice', () => {
        cy.login()
        cy.request({
            url: 'api/games/store',
            method: 'POST',
            body: { urls: [
                'https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/',
                'https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/'
            ] },
        }).then(res => {
            const games = res.body
            expect(games).to.have.length(1)
        })
    })

    it('uploads a game', () => {
        cy.login()
        cy.request({
            url: 'api/games/store',
            method: 'POST',
            body: { urls: ['https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/'] },
        }).then(res => {
            expect(res.status).to.equal(200)
            const games: Game[] = res.body
            games.forEach(game => {
                expect(game).to.have.keys(['id', 'userId', 'url', 'name', 'platform', 'cover', 'bestPrice', 'dateCreated', 'dateUpdated'])
                expect(game).to.have.property('url', 'https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/')
                expect(game).to.have.property('name', 'Cyberpunk 2077')
                expect(game).to.have.property('platform', 'PC')
            })
        })
    })
})