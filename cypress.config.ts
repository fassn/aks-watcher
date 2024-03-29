import { Game, PrismaClient } from "@prisma/client";
import { defineConfig } from "cypress";
import fs from 'fs'

// Some TS errors when using execa in this function...
// const findBrowser = () => {
//     // the path is hard-coded for simplicity
//     const browserPath = '/snap/bin/chromium'

//     return execa(browserPath, ['--version']).then((result) => {
//         // STDOUT will be like "Chromium 109.0.5414.74 snap"
//         const [, version] = /Chromium (\d+\.\d+\.\d+\.\d+)/.exec(result.stdout)!
//         const majorVersion = parseInt(version.split('.')[0])

//         return <Cypress.Browser>{
//             name: 'Chromium',
//             channel: 'stable',
//             family: 'chromium',
//             displayName: 'Chromium',
//             version,
//             path: browserPath,
//             majorVersion,
//         }
//     })
// }

async function getGames(userId: string = 'clcz4aeku0002d6i04xfe5mp8') {
    const prisma = getPrismaInstance()
    const games = await prisma.game.findMany({
        where: { userId: userId }
    })

    return games
}

async function createUser(email: string = 'anotheruser@test.com') {
    const prisma = getPrismaInstance()
    const user = await prisma.user.upsert({
        where: { email: email },
        update: {},
        create: {
            email: email,
            emailVerified: new Date()
        }
    })
    return user
}

type createGamesArgs = {
    count: number
    userId?: string
}
async function createGames(args: createGamesArgs) {
    const { count, userId = 'clcz4aeku0002d6i04xfe5mp8' } = args

    if (count < 1 || count > 10) {
        throw new Error('Please input a number between 1 and 10')
    }

    const games: Game[] = getGamesFixture()

    const prisma = getPrismaInstance()
    let createdGames: Game[] = []
    for (let i = 0; i < count; i++) {
        const gamesData = { ...games[i], userId: userId }
        const game = await prisma.game.create({
            data: gamesData
        })
        createdGames.push(game)
    }
    return createdGames
}

async function updateGame(args: Partial<Game>) {
    if (!args.id) {
        throw new Error('Please provide at least the game ID to update.')
    }
    const prisma = getPrismaInstance()
    return await prisma.game.update({
        where: { id: args.id },
        data: args
    })
}

async function antedateGame(gameId: string) {
    const prisma = getPrismaInstance()
    return await prisma.game.update({
        where: { id: gameId },
        data: { dateUpdated: '2022-01-01T00:00:00.000Z' }
    })
}

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on, config) {
            require('@cypress/code-coverage/task')(on, config)
            // implement node event listeners here
            on('task', {
                getGames,
                createGames,
                antedateGame,
                updateGame,
                createUser
            })

            // Can be used to replace electron, once managing to add another browser...
            // return <Cypress.PluginConfigOptions>{
            //   browsers: config.browsers.filter((b) => {
            //     b.family === 'chromium' && b.name !== 'electron'
            //   }),
            // }

            // Currently not working because of the TS bug in findBrowser...
            // return findBrowser().then((browser) => {
            //     return <Cypress.PluginConfigOptions>{
            //         browsers: config.browsers.concat(browser),
            //     }
            // })
            return config
        }
    },
})

function getPrismaInstance() {
    process.env['DATABASE_URL'] = 'postgresql://fassn:fassn@localhost:5432/aks_watcher'
    return new PrismaClient({ log: ['info'] })
}

function getGamesFixture() {
    const content = fs.readFileSync('./cypress/fixtures/games.json', 'utf8')
    const games: Game[] = JSON.parse(content).games
    return games
}