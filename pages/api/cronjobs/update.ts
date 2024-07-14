import { CronJob } from "quirrel/next";
import prisma from "lib/prisma";
import { timeout, updatePrice } from "../shared";

export default CronJob(
    "api/cronjobs/update",
    ["0 10 * * *", "Europe/Paris"], // (see https://crontab.guru/)
    async () => {
        const games = await prisma.game.findMany({
            where: {
                userId: { not: null }
            },
            include: {
                prices: true
            }
        }).then(async games => {
            for (const game of games) {
                await Promise.all([
                    await updatePrice(game),
                    timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
                ]);
            }
        })
    }
);