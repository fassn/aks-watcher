import type { NextPage } from "next";
import useSWR, { mutate } from 'swr'
import fetcher from "../lib/fetcher";

import { Game } from "@prisma/client";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css"
import { useState } from "react";
import { useSession } from "next-auth/react";
import FlashMessage, { Flash } from "components/flash-msg";
import Image from "next/image";
import { SortGames } from "components/sort-games";
import { Modal } from "components/modal";

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

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [flash, setFlash] = useState<Flash>({})
    const refreshAll = async () => {
        if (isRefreshing) {
            throw new Error('You have already requested a full refresh. No need to spam the button ;-)')
        }
        const { id: userId } = session?.user
        if (!userId) {
            throw new Error('You are not logged in.')
        }

        setIsRefreshing(true)
        setFlash({ message: 'Update has started. This may take a while. Please do not reload the page.', severity:'info', delay: 5000 })

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

    const [modalOpen, setModalOpen] = useState(false)
    const deleteAll = async () => {
        if (isDeleting) {
            throw new Error('You have already requested a full deletion of your games. No need to spam.')
        }
        const { id: userId } = session?.user
        if (!userId) {
            throw new Error('You are not logged in.')
        }

        setIsDeleting(true)
        setModalOpen(false)
        setFlash({ message: 'Deletion has started. This may take a while. Please do not reload the page.', severity:'info', delay: 5000 })

        const res = await fetch('/api/games/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, games: games })
        })
        if (res.status !== 200) {
            const error = await res.json().then(res => res.error)
            setFlash({ message: error, severity: 'error', delay: 5000 })
        }
        if (res.status === 200) {
            mutate('/api/games/get', async (games: Game[]) => {
                return []
            })
            setFlash({ message: 'Games were successfully deleted', severity: 'success', delay: 5000 })
        }
        setIsDeleting(false)
        setTimeout(() => setFlash({}), 5000)
    }

    const openModal = () => {
        setModalOpen(!modalOpen)
    }

    const closeModal = () => {
        setModalOpen(false)
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
                            <div className="flex font-josephin">
                                <SortGames games={games} setGames={setGames} />
                            </div>

                            <div className="flex mx-10">
                                <span className="w-20 font-josephin">Refresh all </span>
                                <button onClick={refreshAll} id="refresh_all">
                                    <svg className={`${isRefreshing ? 'animate-spin ' : ''} inline-block h-4 w-4 mx-2 text-deep-blue`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                                </button>
                            </div>
                            <div>
                                <FlashMessage severity={(flash.severity) as ('success'|'info'|'error')} delay={flash.delay ?? 5000}>
                                    { flash.message }
                                </FlashMessage>
                            </div>
                            <div className="w-full flex justify-end">
                                <button className="flex items-center mr" onClick={openModal} id="delete_all">
                                    <span className="font-josephin mr-2">
                                        Delete all
                                    </span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 32 32"><g data-name="70-Trash"><path d="m29.89 6.55-1-2A1 1 0 0 0 28 4h-7V2a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2H4a1 1 0 0 0-.89.55l-1 2A1 1 0 0 0 3 8h2v22a2 2 0 0 0 .47 1.41A2 2 0 0 0 7 32h18a2 2 0 0 0 2-2V8h2a1 1 0 0 0 .89-1.45zM13 2h6v2h-6zm12 28H7V8h18z"/><path d="M17 26V10a2 2 0 0 0-2 2l.06 14H15v2a2 2 0 0 0 2-2zM22 26V10a2 2 0 0 0-2 2l.06 14H20v2a2 2 0 0 0 2-2zM12 26V10a2 2 0 0 0-2 2l.06 14H10v2a2 2 0 0 0 2-2z"/></g></svg>
                                </button>
                                <Modal open={modalOpen} onRequestClose={closeModal} className="w-80 h-48">
                                    <p className="h-1/2">Are you sure you want to remove all your games?</p>
                                    <div className="flex h-1/2">
                                        <button onClick={deleteAll} className="flex-none w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded">Confirm</button>
                                    </div>
                                </Modal>
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
