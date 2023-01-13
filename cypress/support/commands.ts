/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
    namespace Cypress {
        interface Chainable {
            //   login(email: string, password: string): Chainable<void>
            //   drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
            //   dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
            //   visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
            sendTestEmail(): Chainable<JQuery<HTMLElement>>,
            getLastEmail(): Chainable<JQuery<HTMLElement>>
        }
    }
}
const mailtrap = Cypress.env('mailtrap')
Cypress.Commands.add('sendTestEmail', () => {
    return cy.fixture('testEmail').then((json) => {
        return cy.request<HTMLElement>({
            method: 'POST',
            url: `https://sandbox.api.mailtrap.io/api/send/${mailtrap.inboxId}`,
            headers: {
                'Content-Type': 'application/json',
                'Api-Token': mailtrap.apiToken,
                'Authorization': `Bearer ${mailtrap.apiToken}`,
                'Access-Control-Allow-Origin': 'no-cors'
            },
            body: json.body
        }).then((res) => res.body)
    })

})

Cypress.Commands.add('getLastEmail', () => {

    function requestEmail() {
        cy.request({ // fetch last message id
            method: 'GET',
            url: `https://mailtrap.io/api/accounts/${mailtrap.accountId}/inboxes/${mailtrap.inboxId}/messages`,
            headers: {
                'Api-Token': mailtrap.apiToken,
                'Authorization': `Bearer ${mailtrap.apiToken}`
            }
        }).its('body[0].id').as('msgId')

        return cy.get('@msgId').then((msgId) => {
            cy.request<JQuery<HTMLElement>>({
                method: 'GET',
                url: `https://mailtrap.io/api/accounts/${mailtrap.accountId}/inboxes/${mailtrap.inboxId}/messages/${msgId}/body.html`,
                headers: {
                    'Api-Token': mailtrap.apiToken,
                    'Authorization': `Bearer ${mailtrap.apiToken}`
                }
            }).then((res) => {
                if (res.body) {
                    return Cypress.$(res.body) // parse as JQuery object
                }

                cy.wait(1000)
                return requestEmail()
            })
        })
    }

    return requestEmail();
});

export { }