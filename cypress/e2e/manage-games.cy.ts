describe('Manage Games', () => {
    beforeEach(() => {
        cy.seedDatabase()
        cy.login()
    })

    it('adds a game then deletes it', () => {
        cy.visit('http://localhost:3000')
        cy.fixture('gamesUrl.json').then((json) => {
            const games: any[] = json.gamesUrl
            // click to open modal
            cy.get('#add_game_header').click()
            cy.get('#add_game_form')
            .should('exist')
            cy.get('#add_game_form_desc')
            .should('have.text', 'Add Games to be tracked:')
            // type url game in form
            cy.get('#aks_links').focus().type(games[0])
            cy.get('#add_game_submit').click()
        })
        cy.get('#add_game_flash')
        .should('have.text', 'Games are being added. Please wait.')
        // add game modal close
        cy.get('#add_game_form')
        .should('not.exist')
        cy.get('[data-cy="gamecard"]')
        .should('exist')
        // click to delete game
        cy.get('[data-cy="game_delete_button"]').find('svg').click()
        cy.get('#delete_game_modal')
        .should('exist')
        cy.get('#delete_game_modal').find('p')
        .should('have.text', 'Are you sure you want to remove this game from the list?')
        cy.get('#delete_submit').click()
        // delete modal close
        cy.get('#delete_game_modal')
        .should('not.exist')
        cy.get('[data-cy="gamecard"]')
        .should('not.exist')
    })

    it.only('doesnt add a game if it exists', () => {
        cy.visit('http://localhost:3000')
        cy.fixture('gamesUrl.json').then((json) => {
            const games: any[] = json.gamesUrl

            // add the game once
            cy.intercept('/api/games/store').as('storeGame')
            cy.get('#add_game_header').click()
            cy.get('#aks_links').focus().type(games[0])
            cy.get('#add_game_submit').click()
            cy.wait('@storeGame')

            // try to add the game again
            cy.get('#add_game_header').click()
            cy.get('#aks_links').focus().type(games[0])
            cy.get('#add_game_submit').click()
            cy.get('#add_game_flash').should('have.text', 'The games provided are already tracked.')
            cy.get('.ReactModal__Overlay').click(0, 0, { force: true })

            cy.get('#games_container')
            .find('[data-cy="gamecard"]')
            .should('have.length', 1)
        })
    })

    // it('adds two games', () => {
    //     cy.visit('http://localhost:3000')
    //     cy.fixture('gamesUrl.json').then((json) => {
    //         const games: any[] = json.gamesUrl
    //         cy.get('#add_game_header').click()
    //         cy.get('#add_game_form_desc')
    //         .should('have.text', 'Add Games to be tracked:')
    //         cy.get('#aks_links').focus().type(games[0])
    //         cy.get('#add_game_submit').click()
    //         cy.get('#add_game_flash')
    //         .should('have.text', 'Games are being added. Please wait.')
    //     })
    // })
})