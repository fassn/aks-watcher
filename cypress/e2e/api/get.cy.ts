describe('tests /api/games/get endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('gets the example games when unlogged', () => {
        cy.request({
            url: 'api/games/get',
        }).then(res => {
            expect(res.status).to.equal(200)
            const exampleGames = res.body
            expect(exampleGames).to.have.length(3)
            exampleGames.forEach(game => {
                expect(game).to.have.keys(['id', 'userId', 'url', 'name', 'platform', 'cover', 'bestPrice', 'dateCreated', 'dateUpdated'])
            })
        })
    })

    it('gets user games when logged', () => {
        cy.login()
        cy.task('createGames', { count: 2 })
        cy.request({
            url: 'api/games/get',
        }).then(res => {
            expect(res.status).to.equal(200)
            const games = res.body
            expect(games).to.have.length(2)
            games.forEach(game => {
                expect(game).to.have.keys(['id', 'userId', 'url', 'name', 'platform', 'cover', 'bestPrice', 'dateCreated', 'dateUpdated'])
            })
        })
    })
})