describe('some tests', () => {
    it('test login', () => {
        cy.login()
        cy.visit('http://localhost:3000')
    })
})