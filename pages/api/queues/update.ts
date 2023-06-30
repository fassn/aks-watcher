import { Game } from "@prisma/client";
import { Queue } from "quirrel/next";
import { timeout, updateGame } from "../utils";

export default Queue('api/queues/update', async (games: { id: string, url: string }[]) => {
    for (const game of games) {
        await Promise.all([
            await updateGame(game.id, game.url),
            timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
        ])
    }
})