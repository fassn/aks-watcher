import { CronJob } from "quirrel/next";
import prisma from "lib/prisma";
import { getPrice, timeout } from "../utils";


export default CronJob(
    "api/cronjobs/update",
    ["0 10 * * *", "Europe/Paris"], // (see https://crontab.guru/)
    async () => {
        const gameTable = await prisma.game
        await updateTable(gameTable);

        // TODO update exampleGames using the old bestPrice field instead of prices table
        // update example games from the homepage
        // const exampleGameTable = await prisma.exampleGame
        // await updateTable(exampleGameTable);
    }
);

async function updateTable(prismaTable: any) {
    const games = await prismaTable.findMany()
    for (const game of games) {
        await Promise.all([
            fetch(game.url)
                .then(res => res.text())
                .then(async (contents) => {
                    const newPrice = getPrice(contents);
                    await prismaTable.update({
                        where: { id: game.id },
                        data: {
                            bestPrice: newPrice,
                            dateUpdated: new Date().toISOString()
                        }
                    }).catch((e: Error) => {
                        throw new Error(e.message);
                    });
                })
                .catch(() => {
                    throw new Error(`There was an issue while updating ${game.name}.`);
                }),
            timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
        ]);
    }
}