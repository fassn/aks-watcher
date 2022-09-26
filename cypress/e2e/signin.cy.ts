import { faker } from '@faker-js/faker'

describe('sign-in', () => {
  const randomEmail = faker.internet.email().toLowerCase()

  it('is not a valid form when the email field is empty', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy="submit"]').click()
    cy.get('input:invalid').should('have.length', 1)
    cy.get<HTMLInputElement>('[data-cy="email"]').then(($input) => {
      expect($input[0].validationMessage).to.eq('Please fill out this field.')
    })
  })

  it('is not a valid form when the email field is not filled with an email', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy="email"]').type('not an email', { force: true })
    cy.get('[data-cy="submit"]').click()
    cy.get('input:invalid').should('have.length', 1)
    cy.get<HTMLInputElement>('[data-cy="email"]').then(($input) => {
      expect($input[0].validationMessage).to.eq('Please include an \'@\' in the email address. \'notanemail\' is missing an \'@\'.')
    })
  })

  it('should validate', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy="email"]').type('email@example.com', { force: true })
    cy.get('input:invalid').should('have.length', 0)
  })

  let userEmail: any
  before(() => {
    // get and check the test email only once before the tests
    cy.task('getUserEmail').then((email) => {
      expect(email).to.be.a('string')
      userEmail = email
    })
  })

  it('should send an email containing a verification link', () => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy="email"]').type(randomEmail).should('have.value', randomEmail)
    cy.get('[data-cy="submit"]').click()
    cy.contains('Check your email')
  })

  // it('sends confirmation code', () => {
  //   const userName = 'Joe Bravo'

  //   cy.visit('/')
  //   cy.get('#name').type(userName)
  //   cy.get('#email').type(userEmail)
  //   cy.get('#company_size').select('3')
  //   cy.get('button[type=submit]').click()

  //   cy.log('**shows message to check emails**')
  //   cy.get('[data-cy=sent-email-to]')
  //     .should('be.visible')
  //     .and('have.text', userEmail)
  // })
})