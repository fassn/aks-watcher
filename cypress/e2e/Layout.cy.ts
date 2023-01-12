describe('Layout', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('contains a header', () => {
    cy.get('header').should('exist')

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
      const today = new Date().toLocaleDateString('fr-FR');

      cy.get('[data-cy="gamecard"]').first()
      .find('img')
      .then(img => {
        expect(img).to.have.attr('src')
        expect(img).to.have.attr('alt').match(/game cover$/)
      })

      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_platform"]')
      .should('exist')

      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_price"]')
      .invoke('text')
      .should('match', /.€$/)

      // cronjob needs to have run when the test runs
      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_update_date"]')
      .should('have.text', today)

      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_name"]')
      .should('have.attr', 'href')

      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_update_button"]')
      .should('not.exist')

      cy.get('[data-cy="gamecard"]').first()
      .find('[data-cy="game_delete_button"]')
      .should('not.exist')
  })

  it('contains a footer', () => {
    cy.get('footer').should('exist')
  })
})

export {}