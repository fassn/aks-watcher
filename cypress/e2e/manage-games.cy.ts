describe('Manage Games', () => {
    beforeEach(() => {
        cy.seedDatabase()
        cy.login()
    })

    it('adds a game then deletes it', () => {
        cy.visit('http://localhost:3000')
        cy.fixture('games.json').then((json) => {
            const games: any[] = json.games

            // click to open modal
            cy.get('#add_game_header').click()
            cy.get('#add_game_form')
            .should('exist')
            cy.get('#add_game_form_desc')
            .should('have.text', 'Add Games to be tracked:')

            // type url game in form
            cy.intercept('/api/games/store').as('storeGame')
            cy.get('#aks_links').focus().type(games[0].url)
            cy.get('#add_game_submit').click()
            cy.get('#add_game_flash')
            .should('have.text', 'Games are being added. Please wait.')
            cy.wait('@storeGame')

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
            cy.intercept('/api/games/delete/*').as('deleteGame')
            cy.get('#delete_submit').click()
            cy.wait('@deleteGame')

            cy.get('#delete_game_modal')
            .should('not.exist')
            cy.get('[data-cy="gamecard"]')
            .should('not.exist')
        })
    })

    it('doesnt add a game if it exists', () => {
        cy.visit('http://localhost:3000')
        cy.fixture('games.json').then((json) => {
            const games: any[] = json.games

            // add the game once
            cy.intercept('/api/games/store').as('storeGame')
            cy.get('#add_game_header').click()
            cy.get('#aks_links').focus().type(games[0].url)
            cy.get('#add_game_submit').click()
            cy.wait('@storeGame')

            // try to add the game again
            cy.get('#add_game_header').click()
            cy.get('#aks_links').focus().type(games[0].url)
            cy.get('#add_game_submit').click()
            cy.get('#add_game_flash').should('have.text', 'The games provided are already tracked.')
            cy.get('.ReactModal__Overlay').click(0, 0, { force: true })

            cy.get('#games_container')
            .find('[data-cy="gamecard"]')
            .should('have.length', 1)
        })
    })

    it('adds two games then deletes one', () => {
        cy.visit('http://localhost:3000')
        cy.fixture('games.json').then((json) => {
            const games: any[] = json.games

            // add two games
            cy.intercept('/api/games/store').as('storeGame')
            cy.get('#add_game_header').click()
            cy.get('#aks_links').focus().type(games[0].url + '\n' + games[1].url)
            cy.get('#add_game_submit').click()
            cy.wait('@storeGame')

            cy.get('#games_container')
            .find('[data-cy="gamecard"]')
            .should('have.length', 2)

            // click to delete game
            cy.intercept(`/api/games/delete/*`).as('deleteGame')
            cy.get('[data-cy="game_delete_button"]').first().find('svg').click()
            cy.get('#delete_submit').click()
            cy.wait('@deleteGame')

            cy.get('#delete_game_modal')
            .should('not.exist')
            cy.get('[data-cy="gamecard"]')
            .should('have.length', 1)
        })
    })

    it('updates a game', () => {
        cy.task('createGames', 2)
        cy.visit('http://localhost:3000')

        // alias the 2 created games
        cy.get('[data-cy="gamecard"]').first().as('firstGame')
        cy.get('[data-cy="gamecard"]').first().next().as('secondGame')

        // check the current dates on the 2 games
        cy.get('@firstGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')
        cy.get('@secondGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')

        // update the first game
        cy.intercept('/api/games/update/*').as('gameUpdate')
        cy.get('@firstGame').find('[data-cy="game_update_button"]').click()
        cy.wait('@gameUpdate')

        // check the dates again
        const today = new Date().toLocaleDateString('fr-FR')
        cy.get('@firstGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', today)
        cy.get('@secondGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')
    })
})

export { }