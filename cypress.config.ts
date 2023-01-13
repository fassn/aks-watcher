import { defineConfig } from "cypress";

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

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here

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

        }
    },
})
