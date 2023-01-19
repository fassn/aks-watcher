import { User } from "@prisma/client";

describe('tests /api/games/delete/[gameId] endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('requires to be logged in', () => {
        cy.task('createGames', { count: 1 })
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/delete/${games[0].id}`,
                method: 'DELETE',
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(403)
                expect(res.body).to.deep.equal({ error: 'You need to be signed in to use this API route.'})
            })
        })
    })

    it('requires to use a DELETE request', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/delete/${games[0].id}`,
                method: 'GET',
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(405)
                expect(res.body).to.deep.equal({ error: 'Request must be DELETE.' })
            })
        })
    })

    it('requires the user to be the owner of the game', () => {
        cy.login()
        cy.task('createUser').then((user: User) => {
            cy.task('createGames', { count: 1, userId: user.id }).then(games => {
                cy.request({
                    url: `api/games/delete/${games[0].id}`,
                    method: 'DELETE',
                    failOnStatusCode: false
                }).then(res => {
                    expect(res.status).to.equal(403)
                    expect(res.body).to.deep.equal({ error: 'You are not allowed to delete this game.' })
                })
            })
        })
    })

    it('deletes a game', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/delete/${games[0].id}`,
                method: 'DELETE',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8' }
            }).then(res => {
                expect(res.status).to.equal(200)
                expect(res.body).to.deep.equal(games[0])
            })
        })
    })
})