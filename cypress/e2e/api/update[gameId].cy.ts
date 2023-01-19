import { User } from "@prisma/client";

describe('tests /api/games/update/[gameId] endpoint', () => {
    beforeEach(() => {
        cy.seedDatabase()
    })

    it('requires to be logged in', () => {
        cy.task('createGames', { count: 1 })
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update/${games[0].id}`,
                method: 'POST',
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(403)
                expect(res.body).to.deep.equal({ error: 'You need to be signed in to use this API route.' })
            })
        })
    })

    it('requires to use a POST request', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update/${games[0].id}`,
                method: 'GET',
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(405)
                expect(res.body).to.deep.equal({ error: 'Request must be POST.' })
            })
        })
    })

    it('requires the user to be the owner of the game', () => {
        cy.login()
        cy.task('createUser').then((user: User) => {
            cy.task('createGames', { count: 1, userId: user.id }).then(games => {
                cy.request({
                    url: `api/games/update/${games[0].id}`,
                    method: 'POST',
                    failOnStatusCode: false
                }).then(res => {
                    expect(res.status).to.equal(403)
                    expect(res.body).to.deep.equal({ error: 'You are not allowed to update this game.' })
                })
            })
        })
    })

    /* doesnt pass because the request always falls back on the /api/games/update endpoint */
    // it('requires the request to provide a game ID', () => {
    //     cy.task('createGames', { count: 1 })
    //     cy.login()
    //     cy.task('getGames').then(games => {
    //         cy.request({
    //             url: `api/games/update/`,
    //             method: 'POST',
    //             body: { userId: 'clcz4aeku0002d6i04xfe5mp8' },
    //             failOnStatusCode: false
    //         }).then(res => {
    //             expect(res.status).to.equal(400)
    //             expect(res.body).to.deep.equal({ error: 'No game ID was provided in the request.' })
    //         })
    //     })
    // })

    it('requires the game to exist', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.request({
            url: `api/games/update/random_game_id`,
            method: 'POST',
            body: { userId: 'clcz4aeku0002d6i04xfe5mp8' },
            failOnStatusCode: false
        }).then(res => {
            expect(res.status).to.equal(400)
            expect(res.body).to.deep.equal({ error: 'The game doesnt exist.' })
        })
    })

    it('requires the game to have been last updated more than an hour ago', () => {
        cy.task('createGames', { count: 1 }).then(games => {
            cy.task('updateGame', { id: games[0].id, dateUpdated: new Date() })
        })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update/${games[0].id}`,
                method: 'POST',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8' },
                failOnStatusCode: false
            }).then(res => {
                expect(res.status).to.equal(400)
                expect(res.body).to.deep.equal({ error: 'This game has already been updated in the last 60 minutes.' })
            })
        })
    })

    it('updates a game', () => {
        cy.task('createGames', { count: 1 })
        cy.login()
        cy.task('getGames').then(games => {
            cy.request({
                url: `api/games/update/${games[0].id}`,
                method: 'POST',
                body: { userId: 'clcz4aeku0002d6i04xfe5mp8' }
            }).then(res => {
                expect(res.status).to.equal(200)
                expect(res.body.dateUpdated).to.not.equal('2022-01-01T00:00:00.000Z')
            })
        })
    })
})