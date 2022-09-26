describe('Layout', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('contains a header', () => {
    cy.get('header').should('exist')
  })

  it('contains a homepage link', () => {
    cy.get('[data-cy="homepage_link"]')
    .should('have.attr', 'href', '/')
    .should('have.text', 'AKS Price Tracker')
  })

  it('contains a signin form', () => {
    cy.get('[data-cy="signin_form"]').should('exist')
  })

  it('contains an email input', () => {
    cy.get('[data-cy="email"]')
    .should('have.id', 'email')
    .should('have.attr', 'placeholder', 'email@example.com')
  })

  it('contains a signin button', () => {
    cy.get('[data-cy="submit"]')
    .should('have.attr', 'type', 'submit')
    .should('have.text', 'Sign In')
  })

  it('contains a footer', () => {
    cy.get('footer').should('exist')
  })
})