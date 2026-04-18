/// <reference types="cypress" />

declare global {
    namespace Cypress {
        interface Chainable {
            sendTestEmail(): Chainable<JQuery<HTMLElement>>,
            getLastEmail(): Chainable<JQuery<HTMLElement>>,
            login(): Chainable<void>,
            seedDatabase(): Chainable<void>,
            createGame(url: string): Chainable<Cypress.Response<any>>,
        }
    }
}

type MailCatcherConfig = {
    apiUrl?: string
}

const DEFAULT_MAILCATCHER_API_URL = 'http://localhost:8025'

const getMailCatcherApiUrl = (mailcatcher?: MailCatcherConfig) => {
    const apiUrl = mailcatcher?.apiUrl?.trim()
    return apiUrl || DEFAULT_MAILCATCHER_API_URL
}

const decodeQuotedPrintable = (content: string) => {
    return content
        .replace(/=\r?\n/g, '')
        .replace(/=([A-F0-9]{2})/gi, (_match, hex) => String.fromCharCode(parseInt(hex, 16)))
}

const extractVerificationLink = (content: string) => {
    const match = content.match(/https?:\/\/[^\s"<>]*\/api\/auth\/callback\/email[^\s"<>]*/i)
    if (!match) {
        return ''
    }
    return match[0].replace(/&amp;/g, '&')
}

Cypress.Commands.add('createGame', (url: string) => {
    return cy.request('POST', '/api/games/store', { urls: [url]})
})

Cypress.Commands.add('seedDatabase', () => {
    cy.exec('npx prisma db seed')
})

Cypress.Commands.add('login', () => {
    cy.session('testUser', () => {
        cy.intercept('/api/auth/session', { fixture: 'session.json' }).as('session')
        cy.setCookie('next-auth.session-token', '6aae236f-057d-4707-a1df-aef75791c135')
    })
})

Cypress.Commands.add('getLastEmail', () => {
    return cy.env(['mailcatcher']).its('mailcatcher').then((mailcatcher: MailCatcherConfig | undefined) => {
        const apiUrl = getMailCatcherApiUrl(mailcatcher)

        function requestEmail(): Cypress.Chainable<JQuery<HTMLElement>> {
            return cy.request<{ items?: Array<{ ID: string }> }>({
                method: 'GET',
                url: `${apiUrl}/api/v2/messages?limit=1`,
                failOnStatusCode: false,
            }).then((messagesRes) => {
                const messageId = messagesRes.body?.items?.[0]?.ID
                if (!messageId) {
                    cy.wait(1000)
                    return requestEmail()
                }

                return cy.request({
                    method: 'GET',
                    url: `${apiUrl}/api/v1/messages/${encodeURIComponent(messageId)}`,
                }).then((messageRes) => {
                    const encodedBody: string = messageRes.body?.Content?.Body ?? ''
                    const decodedBody = decodeQuotedPrintable(encodedBody)
                    const verificationLink = extractVerificationLink(decodedBody)

                    if (verificationLink) {
                        return Cypress.$(`<div><a href="${verificationLink}">${verificationLink}</a></div>`)
                    }
                    if (decodedBody) {
                        const wrappedBody = Cypress.$('<div />')
                        wrappedBody.text(decodedBody)
                        return wrappedBody
                    }

                    cy.wait(1000)
                    return requestEmail()
                })
            })
        }

        return requestEmail()
    })
});

Cypress.Commands.add('sendTestEmail', () => {
    return cy.fixture('testEmail').then((json) => {
        return cy.task('sendTestEmail', json.body).then(() => {
            return cy.getLastEmail()
        })
    })
})

export { }
