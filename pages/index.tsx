import type { NextPage } from "next";
import useSWR, { mutate } from 'swr'
import fetcher from "../utils/fetcher";

import { Game } from "../utils/game";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css"

const Home: NextPage = () => {
    const { data: games, error } = useSWR('/api/games/get', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    useSWR(() => {
        if (games === undefined) throw Error('`games` is not ready yet.')
        return '/api/games/update'
    }, () => fetch('api/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(games)
    }), {
        onSuccess: async (data) => {
            const updatedGames = await data.json()
            mutate('/api/games/get', async (games: Game[]) => [...updatedGames])
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    if (error) return <div>failed to load</div>
    if (!games) return <div>loading...</div>
    return (
        <>
            <div className={styles.container}>
                <div className={"flex justify-evenly " + (games.length > 0? "flex-wrap": "flex-col")}>
                    {
                        games.length > 0
                            ? games.map((game: Game) => (
                                <GameCard key={game.id} gameData={game} />
                            ))
                            : <div className="flex h-full justify-center items-center">
                                <p>There are no games tracked yet.</p>
                            </div>
                    }
                    <AddGameCard></AddGameCard>
                </div>
            </div>
        </>
    );
};

export default Home;
