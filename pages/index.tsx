import type { NextPage } from "next";
import useSWR, { mutate } from 'swr'
import fetcher from "../lib/fetcher";

import { Game } from "@prisma/client";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css"
import { ChangeEvent, useState } from "react";
import { useSession } from "next-auth/react";
import FlashMsg, { Flash } from "components/flash-msg";
import Image from "next/image";

const Home: NextPage = () => {
    const { data: session } = useSession()
    const [games, setGames] = useState([])
    const { data, error } = useSWR('/api/games/get', fetcher, {
        onSuccess: (games) => {
            setGames(games)
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
    const [flash, setFlash] = useState<Flash>({})

    const [isRefreshing, setIsRefreshing] = useState(false)
    const refreshAll = async () => {
        if (isRefreshing) {
            throw new Error('You have already requested a full refresh. No need to spam the button ;-)')
        }
        const { id: userId } = session?.user
        if (!userId) {
            throw new Error('You are not logged in.')
        }

        setIsRefreshing(true)
        const res = await fetch('/api/games/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, games: games })
        })
        if (res.status !== 200) {
            const error = await res.json().then(res => res.error)
            setFlash({ message: error, severity: 'error', delay: 5000 })
        }
        if (res.status === 200) {
            const updatedGames = await res.json()
            mutate('/api/games/get', async (games: Game[]) => {
                return [...updatedGames]
            })
            setFlash({ message: 'Games were successfully updated', severity: 'success', delay: 5000 })
        }
        setIsRefreshing(false)
        setTimeout(() => setFlash({}), 5000)
    }

    if (error) return <div>failed to load</div>
    if (!games) return <div>loading...</div>
    return (
        <>
            <div className={styles.container}>
                {
                    session ?
                    <>
                        <div className="flex border-solid border-deep-blue border-b-2 py-2">
                            <FlashMsg severity={(flash.severity) as ('success'|'error')} delay={flash.delay ?? 5000}>
                                { flash.message }
                            </FlashMsg>
                            <div className="flex">
                                <label htmlFor="sort_games" className="font-josephin">Sort </label>
                                <select onChange={sortGames} id="sort_games" className="font-josephin">
                                    <option value='game_asc'>Game (a-z)</option>
                                    <option value='game_desc'>Game (z-a)</option>
                                    <option value='price_asc'>Price (smallest)</option>
                                    <option value='price_desc'>Price (biggest)</option>
                                </select>
                            </div>

                            <div className="flex mx-10">
                                <span className="font-josephin">Refresh all </span>
                                <button onClick={refreshAll} id="refresh_all">
                                    <svg className="inline-block h-4 w-4 mx-2 text-deep-blue" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                                </button>
                            </div>
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
                    </> :
                    <div className="flex-col text-center text-3xl text-deep-blue leading-loose">
                        <div>
                            <ol className="list-decimal text-left inline-block">
                                <li>Please signin first</li>
                                <li>Track games from AllKeyShop</li>
                                <li>Voilà!</li>
                            </ol>
                        </div>
                            <Image
                                src='/aks-games.png'
                                alt='Tracked games example'
                                width='384'
                                height='256'
                            />
                        <div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
};

export default Home;
