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

    const doom = await prisma.game.createMany({
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
.catch((e) => {
    console.error(e)
    process.exit(1)
})
.finally(async () => {
    await prisma.$disconnect()
})