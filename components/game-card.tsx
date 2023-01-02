import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSWRConfig } from "swr"
import { Game } from "@prisma/client"
import { Modal } from "./modal"
import { useSession } from "next-auth/react"
import FlashMessage, { Flash } from "./flash-msg"

export const GameCard = (props: { gameData: Game }) => {
    const locale = process.env.NEXT_PUBLIC_LOCALE
    const [game, setGame] = useState({...props.gameData})
    const [modalOpen, setModalOpen] = useState(false)
    const { mutate } = useSWRConfig()

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [flash, setFlash] = useState<Flash>({})
    const FLASH_MESSAGE_DELAY = 5000

    useEffect(() => {
        setGame(props.gameData)
    }, [props.gameData])

    const session = useSession()
    const { id: userId } = session.data?.user

    const updatePrice = async () => {
        if (isRefreshing) {
            throw new Error('You have already requested an update for this game. No need to spam the button ;-)')
        }
        setIsRefreshing(true)
        const res = await fetch(`/api/games/update/${props.gameData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: props.gameData.url, lastUpdated: props.gameData.dateUpdated, userId: userId })
        })
        if(res.status !== 200) {
            const error = await res.json().then(res => res.error)
            setFlash({ message: error, severity: 'error', delay: FLASH_MESSAGE_DELAY })

        } else {
            const updatedGame = res
            mutate('/api/games/get', async () => {
                setGame({...game, ...updatedGame})
            })
            setFlash({ message: 'Game was successfully updated', severity: 'success', delay: FLASH_MESSAGE_DELAY })
        }
        setIsRefreshing(false)
        setTimeout(() => setFlash({}), FLASH_MESSAGE_DELAY)
    }

    const deleteGame = async () => {
        const res = await fetch(`/api/games/delete/${props.gameData.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, name: props.gameData.name })
        })
        const deletedGame: Game = await res.json()

        mutate('/api/games/get', async (games: Game[]) => {
            const filteredGames = games.filter((game: Game) => game.id !==  deletedGame.id)
            return [...filteredGames]
        })
        setModalOpen(false)
    }

    const openModal = () => {
        setModalOpen(!modalOpen)
    }

    const closeModal = () => {
        setModalOpen(false)
    }

    return (
        <div className="w-64 mx-5 my-10 outline outline-2 shadow-md shadow-deep-blue">
            <div className="relative">
                <div className="absolute top-0 z-10">
                    <FlashMessage severity={(flash.severity) as ('success'|'error')} delay={flash.delay ?? 5000}>
                        { flash.message }
                    </FlashMessage>
                </div>
            </div>
            <div className="flex h-64">
                <Link href={game.url}>
                    <a>
                        <Image
                            src={ game.cover }
                            alt={ game.name + ' game cover'}
                            width='256'
                            height='256'
                            unoptimized={true}
                        />
                    </a>
                </Link>
                <button onClick={openModal} className="relative w-0">
                    <svg className="absolute top-0 right-0 h-6 w-6 text-cream hover:text-deep-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10" /> <line x1="15" y1="9" x2="9" y2="15" /> <line x1="9" y1="9" x2="15" y2="15" /></svg>
                </button>
                <Modal open={modalOpen} onRequestClose={closeModal} className="w-80 h-48">
                    <p className="h-1/2">Are you sure you want to remove this game from the list?</p>
                    <div className="flex h-1/2">
                        <button onClick={deleteGame} className="flex-none w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded">Confirm</button>
                    </div>
                </Modal>
            </div>
            <div className="flex flex-col h-40 px-4 py-6 font-josephin bg-light-grey">
                <div className="flex space-x-3">
                    <span className="w-16 h-fit rounded-lg bg-deep-blue text-center text-cream font-semibold">{ game.platform }</span>
                    <div>
                        <pre className="inline-block font-josephin">Best Price: </pre>
                        <span className="font-semibold text-deep-blue">{ game.bestPrice }€</span>
                    </div>
                </div>
                <div className="flex h-full justify-center items-end text-sm">
                    <pre className="inline-block font-josephin">Last updated: </pre>
                    <span className="font-semibold text-deep-blue">{ new Date(game.dateUpdated).toLocaleDateString(locale) }</span>
                    <button onClick={updatePrice} className="w-12">
                        <svg className={`${isRefreshing ? 'animate-spin ' : ''} inline-block h-4 w-4 text-deep-blue`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                    </button>
                </div>
            </div>
            <div className="flex justify-center items-center h-16 bg-deep-blue text-cream text-center uppercase text-xl leading-6">
                <Link href={game.url}>
                    <a>{ game.name }</a>
                </Link>
            </div>
        </div>
    )
}