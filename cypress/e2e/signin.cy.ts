import { faker } from '@faker-js/faker'

describe('Sign-in', () => {
    const randomEmail = faker.internet.email().toLowerCase()

    it('is not a valid form when the email field is empty', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="submit"]').click()
        cy.get('input:invalid').should('have.length', 1)
        cy.get<HTMLInputElement>('[data-cy="email"]').should(($input) => {
            expect($input[0].validationMessage).to.eq('Please fill out this field.')
        })
    })

    it('is not a valid form when the email field is not filled with an email', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="email"]').type('not an email', { force: true })
        cy.get('[data-cy="submit"]').click()
        cy.get('input:invalid').should('have.length', 1)
        cy.get<HTMLInputElement>('[data-cy="email"]').should(($input) => {
            expect($input[0].validationMessage).to.eq('Please include an \'@\' in the email address. \'notanemail\' is missing an \'@\'.')
        })
    })

    it('should validate', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="email"]').type('email@example.com', { force: true })
        cy.get('input:invalid').should('have.length', 0)
    })

    it('should send an email containing a verification link', () => {
        cy.visit('http://localhost:3000')
        cy.get('[data-cy="email"]').type(randomEmail).as('typedEmail')
        cy.get('@typedEmail').should('have.value', randomEmail)
        cy.get('[data-cy="submit"]').click()
        cy.get('h1').should('have.text', 'Check your email')

        cy.getLastEmail().then($body => {
            const linkHref = $body.find('a').attr('href')
            expect(linkHref).to.contain('/api/auth/callback/email')
            cy.visit(linkHref);
            cy.get('[data-cy="signedin_email"]').should('have.text', randomEmail)
            cy.reload()
            cy.get('[data-cy="signedin_email"]').should('have.text', randomEmail)

            // clean the Mailtrap inbox
            const mailtrap = Cypress.env('mailtrap')
            cy.request({
                method: 'PATCH',
                url: `https://mailtrap.io/api/accounts/${mailtrap.accountId}/inboxes/${mailtrap.inboxId}/clean`,
                headers: {
                    'Api-Token': mailtrap.apiToken,
                    'Authorization': `Bearer ${mailtrap.apiToken}`,
                }
            })
        })
    })

    it.skip('sends test email', () => {
        cy.sendTestEmail()
    })
})