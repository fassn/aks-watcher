import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useEffect } from "react";
import Head from 'next/head'
import useSWR, { mutate, SWRConfig } from 'swr'
import fetcher from './api/games/helpers/fetcher'
import gamesRepo from './api/games/helpers/games-repo'

import { Game } from "./api/games/helpers/game";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css";

export const getStaticProps: GetStaticProps = async () => {
    const games = await gamesRepo.getAll()
    return {
        props: {
            fallback: {
                '/api/games/get': games
            }
        }
    }
}

const Home: NextPage = ({ fallback }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const { data: games, error } = useSWR('/api/games/get', fetcher, { fallbackData: fallback['/api/games/get'] })

    useEffect(() => {
        updateGames(games)
    }, [])

    if (error) return <div>failed to load</div>
    if (!games) return <div>loading...</div>
    return (
        <SWRConfig value={{ fallback }}>
            <Head>
                <link rel="preload" href="/api/games/get" as="fetch" crossOrigin="anonymous" key='get-games' />
            </Head>
            <div className={styles.container}>
                <div className="flex flex-wrap justify-evenly">
                    {
                        games.length > 0
                            ? games.map((game: Game) => (
                                <GameCard key={game.id} gameData={game} />
                            ))
                            : <div className="flex h-full justify-center items-center">
                                <p className="flex-none">There are no games tracked yet.</p>
                            </div>
                    }
                    <AddGameCard></AddGameCard>
                </div>
            </div>
        </SWRConfig>
    );
};

const getGamesIdToUpdate = (games: Game[]) => {
    const daysBeforeStale = process.env.NEXT_PUBLIC_DAYS_BEFORE_STALE
    const today = new Date().getDate()
    let gamesIdToUpdate: number[] = []

    for (const game of games) {
        const lastUpdated = new Date(game.dateUpdated).getDate()
        const dateDiff = today - lastUpdated
        if (dateDiff >= (daysBeforeStale ?? 3)) {
            gamesIdToUpdate.push(game.id)
        }
    }
    return gamesIdToUpdate
}

const updateGames = async (games: Game[]) => {
    const gamesIdToUpdate: number[] = getGamesIdToUpdate(games)

    let updatedGames: Game[] = []
    if (gamesIdToUpdate.length > 0) {
        await fetch('/api/games/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gamesIdToUpdate),
        })
            .then(res => res.json())
            .then((games: Game[]) => updatedGames = games)
    }
    // const filteredGames = games.filter(game => {
    //     return !updatedGames.some((ug: Game) => {
    //         return ug.id === game.id
    //     })
    // })
    // mutate({...filteredGames, ...updateGames})
    mutate('/api/games/get')
}

export default Home;
