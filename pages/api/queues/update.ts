import { Game } from "@prisma/client";
import { Queue } from "quirrel/next";
import { timeout, updatePrice } from "../shared";

export default Queue('api/queues/update', async (games: Game[]) => {
    for (const game of games) {
        await Promise.all([
            await updatePrice(game),
            timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
        ])
    }
})