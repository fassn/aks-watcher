describe('tests /api/games/store endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
        cy.login()
    })

    // https://www.allkeyshop.com/blog/buy-horizon-zero-dawn-cd-key-compare-prices/
    it('doesnt add a game twice', () => {
        cy.request('POST', 'api/games/store', {
            urls: [
                'https://www.allkeyshop.com/blog/buy-desperados-3-cd-key-compare-prices/',
                'https://www.allkeyshop.com/blog/buy-desperados-3-cd-key-compare-prices/'
            ]
        }).then(res => {
            const games = res.body
            expect(games).to.have.length(1)
        })
    })
})

export { }