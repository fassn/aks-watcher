import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import useSWR, { mutate, SWRConfig } from 'swr'
import fetcher from "../utils/fetcher";

import { Game } from "../utils/game";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css";

// export const getStaticProps: GetStaticProps = async () => {
//     const games = await gamesRepo.getAll()
//     return {
//         props: {
//             fallback: {
//                 '/api/games/get': games
//             }
//         }
//     }
// }

const Home: NextPage = () => {
    const { data: games, error, mutate } = useSWR('/api/games/get', fetcher, {
        // fallbackData: fallback['/api/games/get'],
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    useSWR(() => {
        if (games === undefined) throw Error('`games` is not ready yet.')
        return '/api/games/update'
    }, (payload) => fetch('api/games/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(games)
    }), {
        onSuccess: async (data) => {
            const updatedGames = await data.json()
            mutate([...updatedGames])
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
