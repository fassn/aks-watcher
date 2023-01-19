import { User } from "@prisma/client";

describe('tests /api/games/delete endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('requires to be logged in', () => {
        cy.request({
            url: `api/games/delete`,
            method: 'POST',
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(403)
            expect(res.body).to.deep.equal({ error: 'You need to be signed in to use this API route.' })
        })
    })

    it('requires to use a POST request', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.request({
            url: `api/games/delete`,
            method: 'GET',
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(405)
            expect(res.body).to.deep.equal({ error: 'Request must be POST.' })
        })
    })

    it('requires the user to be the owner of the games', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.task('createUser').then((user: User) => {
            cy.request({
                url: `api/games/delete`,
                method: 'POST',
                body: { userId: user.id },
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(403)
                expect(res.body).to.deep.equal({ error: 'You are not allowed to delete the games.' })
            })
        })
    })

    it('deletes the games', () => {
        cy.task('createGames', { count: 3 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/delete`,
                method: 'POST',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8' }
            }).then(res => {
                expect(res.status).to.equal(200)
                expect(res.body).to.deep.equal({ count: 3 })
            })
        })
    })
})