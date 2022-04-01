import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useEffect } from "react";
import useSWR, { mutate, SWRConfig } from 'swr'
import fetcher from "../utils/fetcher";
import gamesRepo from "../utils/games-repo";
import moment from 'moment'

import { Game } from "../utils/game";
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
    const { data: games, error } = useSWR('/api/games/get', fetcher, {
        fallbackData: fallback['/api/games/get'],
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    })

    useEffect(() => {
        updateGames(games)
    }, [])

    if (error) return <div>failed to load</div>
    if (!games) return <div>loading...</div>
    return (
        <SWRConfig value={{ fallback }}>
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
        </SWRConfig>
    );
};

const getGamesIdToUpdate = (games: Game[]) => {
    const daysBeforeStale = process.env.NEXT_PUBLIC_DAYS_BEFORE_STALE
    const today = moment()
    let gamesIdToUpdate: number[] = []

    for (const game of games) {
        const lastUpdated = moment(game.dateUpdated)
        const dateDiff = Math.round(today.diff(lastUpdated) / (1000 * 60 * 60 * 24))
        if (dateDiff >= (daysBeforeStale ?? 3)) {
            gamesIdToUpdate.push(game.id)
        }
    }
    return gamesIdToUpdate
}

const updateGames = async (games: Game[]) => {
    const gamesIdToUpdate: number[] = getGamesIdToUpdate(games)

    if (gamesIdToUpdate.length > 0) {
        await fetch('/api/games/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gamesIdToUpdate),
        })
        mutate('/api/games/get')
    }
}

export default Home;
