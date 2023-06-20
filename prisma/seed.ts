import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const johndoe = await prisma.user.upsert({
        where: { email: 'example@user.com' },
        update: {},
        create: {
            email: 'example@user.com',
            name: 'johndoe',
        },
    })

    // seed file might not always be used with a formatted database hence
    // need to check if the test user already exists. (cypress testing)
    try {
        await prisma.user.delete({
            where: { email: 'christopher@test.com' }
        })
    } catch(e) {
        console.log('Test user doesn\'t exist already. Nothing to delete.');
    }

    const testUser = await prisma.user.upsert({
        where: { email: 'christopher@test.com' },
        update: {},
        create: {
            id: 'clcz4aeku0002d6i04xfe5mp8',
            email: 'christopher@test.com',
            name: 'TestUser',
            emailVerified: '2022-01-01T00:00:00.000Z'
        }
    })

    const testUserSession = await prisma.session.upsert({
        where: { sessionToken: '6aae236f-057d-4707-a1df-aef75791c135' },
        update: {},
        create: {
            sessionToken: '6aae236f-057d-4707-a1df-aef75791c135',
            userId: testUser.id,
            expires: '2099-01-01T00:00:00.000Z'
        }
    })

    const exampleGames = await prisma.exampleGame.findMany()

    if (exampleGames.length === 0) {
        await prisma.exampleGame.createMany({
            data: [
                {
                    userId: undefined,
                    url: 'https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/',
                    name: 'Cyberpunk 2077',
                    cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1672764493/example_games/Cyberpunk%202077.jpg',
                    platform: 'PC',
                    bestPrice: 21.60,
                    dateCreated: '2023-01-06T20:00:00.000Z',
                    dateUpdated: '2023-01-06T20:00:00.000Z'
                },
                {
                    userId: undefined,
                    url: 'https://www.allkeyshop.com/blog/buy-desperados-3-cd-key-compare-prices/',
                    name: 'Desperados 3',
                    cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1672764490/example_games/Desperados%203.jpg',
                    platform: 'PC',
                    bestPrice: 3.56,
                    dateCreated: '2023-01-06T20:00:00.000Z',
                    dateUpdated: '2023-01-06T20:00:00.000Z'
                },
                {
                    userId: undefined,
                    url: 'https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/',
                    name: 'Doom Eternal',
                    cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1673021626/example_games/DOOM%20Eternal.jpg',
                    platform: 'PC',
                    bestPrice: 5.28,
                    dateCreated: '2023-01-06T20:00:00.000Z',
                    dateUpdated: '2023-01-06T20:00:00.000Z'
                },
            ]
        })
    }

    const johndoeGames = await prisma.game.findMany({
        where: { userId: johndoe.id }
    })

    if (johndoeGames.length === 0) {
        await prisma.game.create({
            data: {
                userId: johndoe.id,
                url: 'https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/',
                name: 'DOOM Eternal',
                cover: 'https://www.allkeyshop.com/blog/wp-content/uploads/DOOMEternal-1.jpg',
                platform: 'PC',
                prices: {
                    create: {
                        bestPrice: 12.82,
                        date: '2022-04-03T20:00:17.299Z'
                    }
                },
                dateCreated: '2022-04-03T20:00:17.299Z',
                dateUpdated: '2022-04-03T20:00:17.299Z'
            }
        })
        await prisma.game.create({
            data: {
                userId: johndoe.id,
                url: 'https://www.allkeyshop.com/blog/buy-fallout-4-cd-key-compare-prices/',
                name: 'Fallout 4',
                cover: 'https://www.allkeyshop.com/blog/wp-content/uploads/Fallout4-1.jpg',
                platform: 'PC',
                prices: {
                    create: {
                        bestPrice: 3.64,
                        date: '2022-04-03T20:00:17.299Z'
                    }
                },
                dateCreated: '2022-04-03T20:00:17.299Z',
                dateUpdated: '2022-04-03T20:00:17.299Z'
            }
        })
    }
}

main()
.then(async () => {
    await prisma.$disconnect()
})
.catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
})
