import type { NextPage } from "next";
import useSWR, { mutate } from 'swr'
import fetcher from "../lib/fetcher";

import { Game } from "@prisma/client";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css"
import { ChangeEvent, useEffect, useState } from "react";

const Home: NextPage = () => {
    const { data, error } = useSWR('/api/games/get', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })
    const [games, setGames] = useState([])
    useEffect(() => { setGames(data) })

    // TODO: I should probably just check the game updated when doing the GET query
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
            mutate('/api/games/get', async () => [...updatedGames])
        },
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    const sortGames = (event: ChangeEvent<HTMLSelectElement>) => {
        switch (event.target.value) {
            case 'game_asc':
                games.sort((a: Game, b: Game) => {
                    if (a.name < b.name) return -1
                    if (a.name > b.name) return 1
                    return 0
                })
                break;
            case 'game_desc':
                games.sort((a: Game, b: Game) => {
                    if (a.name < b.name) return 1
                    if (a.name > b.name) return -1
                    return 0
                })
                break;
            case 'price_asc':
                games.sort((a: Game, b: Game) => {
                    if (a.bestPrice < b.bestPrice) return -1
                    if (a.bestPrice > b.bestPrice) return 1
                    return 0
                })
                break;
            case 'price_desc':
                games.sort((a: Game, b: Game) => {
                    if (a.bestPrice < b.bestPrice) return 1
                    if (a.bestPrice > b.bestPrice) return -1
                    return 0
                })
                break;
        }
        setGames([...games])
    }

    if (error) return <div>failed to load</div>
    if (!games) return <div>loading...</div>
    return (
        <>
            <div className={styles.container}>
                <div className="flex justify-center">
                    Sort
                    <select onChange={sortGames}>
                        <option value='game_asc'>Game (a-z)</option>
                        <option value='game_desc'>Game (z-a)</option>
                        <option value='price_asc'>Price (smallest)</option>
                        <option value='price_desc'>Price (biggest)</option>
                    </select>
                </div>

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
