import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const fassn = await prisma.user.upsert({
        where: { email: 'christopher.fargere@gmail.com' },
        update: {},
        create: {
            email: 'christopher.fargere@gmail.com',
            name: 'fassn',
        },
    })

    await prisma.exampleGame.createMany({
        data: [
            {
                userId: undefined,
                url: 'https://www.allkeyshop.com/blog/buy-cyberpunk-2077-cd-key-compare-prices/',
                name: 'Cyberpunk 2077',
                cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1672764493/christopher.fargere%40gmail.com/Cyberpunk%202077.jpg',
                platform: 'PC',
                bestPrice: 21.60,
                dateCreated: '2023-01-06T20:00:00.000Z',
                dateUpdated: '2023-01-06T20:00:00.000Z'
            },
            {
                userId: undefined,
                url: 'https://www.allkeyshop.com/blog/buy-desperados-3-cd-key-compare-prices/',
                name: 'Desperados 3',
                cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1672764490/christopher.fargere%40gmail.com/Desperados%203.jpg',
                platform: 'PC',
                bestPrice: 3.56,
                dateCreated: '2023-01-06T20:00:00.000Z',
                dateUpdated: '2023-01-06T20:00:00.000Z'
            },
            {
                userId: undefined,
                url: 'https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/',
                name: 'Doom Eternal',
                cover: 'https://res.cloudinary.com/dis8knofp/image/upload/v1673021626/christopher.fargere%40gmail.com/DOOM%20Eternal.jpg',
                platform: 'PC',
                bestPrice: 5.28,
                dateCreated: '2023-01-06T20:00:00.000Z',
                dateUpdated: '2023-01-06T20:00:00.000Z'
            },
        ]
    })

    await prisma.game.createMany({
        data: [
            {
                userId: fassn.id,
                url: 'https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/',
                name: 'DOOM Eternal',
                cover: 'https://www.allkeyshop.com/blog/wp-content/uploads/DOOMEternal-1.jpg',
                platform: 'PC',
                bestPrice: 12.82,
                dateCreated: '2022-04-03T20:00:17.299Z',
                dateUpdated: '2022-04-03T20:00:17.299Z'
            },
            {
                userId: fassn.id,
                url: 'https://www.allkeyshop.com/blog/buy-fallout-4-cd-key-compare-prices/',
                name: 'Fallout 4',
                cover: 'https://www.allkeyshop.com/blog/wp-content/uploads/Fallout4-1.jpg',
                platform: 'PC',
                bestPrice: 3.64,
                dateCreated: '2022-04-03T20:00:28.433Z',
                dateUpdated: '2022-04-03T20:00:28.433Z'
            }
        ]
    })
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
