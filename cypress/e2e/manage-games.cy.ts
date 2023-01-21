describe('Manage Games', () => {
    beforeEach(() => {
        cy.seedDatabase()
        cy.login()
    })

    it('adds a game', () => {
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
        })
    })

    it('updates a game', () => {
        cy.task('createGames', { count: 1 })
        cy.visit('http://localhost:3000')
        const today = new Date().toLocaleDateString(Cypress.env('NEXT_PUBLIC_LOCALE'))

        cy.get('[data-cy="gamecard"]').first().as('game')

        // check the current dates on the 2 games
        cy.get('@game')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')

        // update the game
        cy.intercept('/api/games/update/*').as('gameUpdate')
        cy.get('@game').find('[data-cy="game_update_button"]').click()
        cy.wait('@gameUpdate')

        // check the dates again
        cy.get('@game')
        .find('[data-cy="game_update_date"]')
        .should('have.text', today)
    })

    it('deletes a game', () => {
        cy.task('createGames', { count: 1 })
        cy.visit('http://localhost:3000')

        // click to delete game
        cy.get('[data-cy="gamecard"]').first().as('game')
        cy.get('@game').find('[data-cy="game_delete_button"]').find('svg').click()

        // check the delete modal
        cy.get('#delete_game_modal')
        .should('exist')
        cy.get('#delete_game_modal').find('p')
        .should('have.text', 'Are you sure you want to remove this game from the list?')

        // delete the game
        cy.intercept('/api/games/delete/*').as('deleteGame')
        cy.get('#delete_submit').click()
        cy.wait('@deleteGame')

        cy.get('#delete_game_modal')
        .should('not.exist')
        cy.get('[data-cy="gamecard"]')
        .should('not.exist')
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

    it('doesnt validate the add form if the input is wrong', () => {
        cy.visit('http://localhost:3000')

        // empty input
        cy.get('#add_game_header').click()
        cy.get('#add_game_submit').click()
        cy.get('#add_game_flash')
        .should('have.text', 'No links were found.')

        cy.reload()

        // 2 spaces as input
        cy.get('#add_game_header').click()
        cy.get('#aks_links').focus()
        .type('  ')
        cy.get('#add_game_submit').click()
        cy.get('#add_game_flash')
        .should('have.text', 'No links were found.')

        cy.reload() // reload the page to prevent issues with flash message timeouts

        // not a link input
        cy.get('#add_game_header').click()
        cy.get('#aks_links').focus()
        .type('this is a wrong input')
        cy.get('#add_game_submit').click()
        cy.get('#add_game_flash')
        .should('have.text', 'the link this is incorrect or not well formatted.')

        cy.reload()

        // a link then wrong input
        cy.get('#add_game_header').click()
        cy.get('#aks_links').focus()
        .type('https://www.allkeyshop.com/blog/buy-horizon-zero-dawn-cd-key-compare-prices/ but then is wrong')
        cy.get('#add_game_submit').click()
        cy.get('#add_game_flash')
        .should('have.text', 'the link but is incorrect or not well formatted.')
    })

    it('doesnt add a game if it exists already', () => {
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
            cy.get('#add_game_flash')
            .should('have.text', 'The games provided are already tracked.')
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

    it('adds two games then updates one', () => {
        cy.task('createGames', { count: 2 })
        cy.visit('http://localhost:3000')
        const today = new Date().toLocaleDateString(Cypress.env('NEXT_PUBLIC_LOCALE'))

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
        cy.get('@firstGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', today)
        cy.get('@secondGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')
    })

    it('refreshes all games', () => {
        cy.task('createGames', { count: 2 })
        cy.visit('http://localhost:3000')
        const today = new Date().toLocaleDateString(Cypress.env('NEXT_PUBLIC_LOCALE'))

        cy.get('[data-cy="gamecard"]').first().as('firstGame')
        cy.get('[data-cy="gamecard"]').first().next().as('secondGame')

        // check the current dates on the 2 games
        cy.get('@firstGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')
        cy.get('@secondGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', '01/01/2022')

        // update the games
        cy.intercept('/api/games/update').as('updateGames')
        cy.get('#refresh_all').click()
        cy.get('#main_flash')
        .should('have.text', 'Update has started. This may take some time.')
        cy.wait('@updateGames')
        cy.wait(2 * 3000) // hard-coded wait due to update queue not notifying on completion

        // check the dates again
        cy.get('@firstGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', today)
        cy.get('@secondGame')
        .find('[data-cy="game_update_date"]')
        .should('have.text', today)
    })

    it('deletes all games', () => {
        cy.task('createGames', { count: 10 })
        cy.visit('http://localhost:3000')

        cy.get('[data-cy="gamecard"]')
        .should('have.length', 10)

        // opens confirmation modal
        cy.get('#delete_all_button').click()
        cy.get('#delete_all_modal')
        .should('exist')
        cy.get('#delete_all_modal').find('p')
        .should('have.text', 'Are you sure you want to remove all your games?')

        cy.intercept('api/games/delete').as('deleteGames')
        cy.get('#delete_all_submit').click()
        cy.wait('@deleteGames')

        cy.get('[data-cy="gamecard"]')
        .should('not.exist')
        cy.get('[data-cy="gamecard"]')
        .should('have.length', 0)
    })
})

export { }