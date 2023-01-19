import { User } from "@prisma/client";

describe('tests /api/games/update endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('requires to be logged in', () => {
        cy.request({
            url: `api/games/update`,
            method: 'POST',
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(403)
            expect(res.body).to.deep.equal({ error: 'You need to be signed in to use this API route.' })
        })
    })

    it('requires to use a POST request', () => {
        cy.login()
        cy.request({
            url: `api/games/update`,
            method: 'GET',
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(405)
            expect(res.body).to.deep.equal({ error: 'Request must be POST.' })
        })
    })

    it('requires the user to be the owner of the games', () => {
        cy.login()
        cy.task('createUser').then((user: User) => {
            cy.request({
                url: `api/games/update`,
                method: 'POST',
                body: { userId: user.id },
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(403)
                expect(res.body).to.deep.equal({ error: 'You are not allowed to update the games.' })
            })
        })
    })

    it('requires the games to update to be provided in the request', () => {
        cy.login()
        cy.request({
            url: `api/games/update`,
            method: 'POST',
            body: { userId: 'clcz4aeku0002d6i04xfe5mp8'},
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(400)
            expect(res.body).to.deep.equal({ error: 'No games to update were provided.' })
        })
    })

    it('requires the games to have been last updated more than an hour ago', () => {
        cy.task('createGames', { count: 3 }).then(games => {
            cy.task('updateGame', { id: games[0].id, dateUpdated: new Date() })
            cy.task('updateGame', { id: games[1].id, dateUpdated: new Date() })
            cy.task('updateGame', { id: games[2].id, dateUpdated: new Date() })
        })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update`,
                method: 'POST',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8', games: games },
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(400)
                expect(res.body).to.deep.equal({ error: 'There were no games to update. \
            Have you already updated the games in the last hour?' })
            })
        })
    })

    it('updates the games', () => {
        cy.task('createGames', { count: 3 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update`,
                method: 'POST',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8', games: games }
            }).then(res => {
                expect(res.status).to.equal(200)
            })
        })
    })
})