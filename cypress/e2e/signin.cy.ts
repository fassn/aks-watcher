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
        cy.env(['mailcatcher']).its('mailcatcher').then((mailcatcher) => {
            const mailcatcherApiUrl = mailcatcher?.apiUrl || 'http://localhost:8025'
            cy.visit('http://localhost:3000')
            cy.get('[data-cy="email"]').type(randomEmail).as('typedEmail')
            cy.get('@typedEmail').should('have.value', randomEmail)
            cy.get('[data-cy="submit"]').click()
            cy.get('h1').should('have.text', 'Check your email')

            cy.getLastEmail().then($body => {
                const linkHref = $body.find('a').attr('href')
                expect(linkHref).to.contain('/api/auth/callback/email')
                cy.visit(linkHref!)
                cy.get('[data-cy="signedin_email"]').should('have.text', randomEmail)
                cy.reload()
                cy.get('[data-cy="signedin_email"]').should('have.text', randomEmail)

                // clean local mail catcher inbox
                cy.request({
                    method: 'DELETE',
                    url: `${mailcatcherApiUrl}/api/v1/messages`,
                })
            })
        })
    })

    it('sends test email', () => {
        cy.env(['mailcatcher']).its('mailcatcher').then((mailcatcher) => {
            const mailcatcherApiUrl = mailcatcher?.apiUrl || 'http://localhost:8025'
            cy.request({
                method: 'DELETE',
                url: `${mailcatcherApiUrl}/api/v1/messages`,
            })
        })

        cy.sendTestEmail().then(($body) => {
            expect($body.text()).to.contain('Congratulations on your order no. 1234')
        })
    })
})

export { }
