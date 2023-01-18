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

async function createGames(count: number) {
    if (count < 1 || count > 10) {
        throw new Error('Please input a number between 1 and 10')
    }

    const games: Game[] = getGamesFixture()

    const prisma = getPrismaInstance()
    for (let i = 0; i < count; i++) {
        const game = await prisma.game.create({
            data: games[i]
        })
    }
    return null
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
                antedateGame,
                createGames
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