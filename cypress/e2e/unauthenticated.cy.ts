describe('Unauthenticated', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000')
    })

    it('contains a header', () => {
        cy.get('header')
        .should('exist')

        // homepage link
        cy.get('[data-cy="homepage_link"]')
        .should('have.attr', 'href', '/')
        .should('have.text', 'AKS Price Tracker')

        // signin form
        cy.get('[data-cy="signin_form"]')
        .should('exist')

        // email input
        cy.get('[data-cy="email"]')
        .should('have.id', 'email')
        .should('have.attr', 'placeholder', 'email@example.com')

        // signin button
        cy.get('[data-cy="submit"]')
        .should('have.attr', 'type', 'submit')
        .should('have.text', 'Sign In')
    })

    it('contains a description and instructions to use the website', () => {
        // short description of AKS
        cy.get('[data-cy="short_description"]')
        .should('exist')

        // How to use heading
        cy.get('h1')
        .should('have.text', 'How to use')

        // instructions to use the website
        cy.get('[data-cy="how_to_use_instructions"]')
        .should('exist')

        // example games heading
        cy.get('h2')
        .should('have.text', 'Example of tracked games:')
    })

    it('contains a container for example games', () => {
        cy.get('[data-cy="example_games"]')
        .should('exist')
    })

    it('contains an example game', () => {
        // gamecard has an image with a source and alt tag
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('img')
        .should(img => {
            expect(img).to.have.attr('src')
            expect(img).to.have.attr('alt').match(/game cover$/)
        })

        // gamecard has a platform
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_platform"]')
        .should('exist')

        // gamecard has a price in €
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_price"]')
        .invoke('text').as('gamePrice')
        cy.get('@gamePrice').should('match', /.€$/)

        // gamecard has an update date
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_update_date"]')
        .should((updateDate) => {
            const parsedDate = Date.parse(updateDate.text())
            expect(Number.isNaN(parsedDate), 'should be a number').to.eq(false)
        })

        // gamecard has a game name link with an href
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_name"]')
        .should('have.attr', 'href')

        // gamecard does not have an update button
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_update_button"]')
        .should('not.exist')

        // gamecard does not have a delete button
        cy.get('[data-cy="gamecard"]')
        .first()
        .find('[data-cy="game_delete_button"]')
        .should('not.exist')
    })

    it('contains a footer', () => {
        cy.get('footer')
        .should('exist')
    })
})

export { }