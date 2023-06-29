import dynamic from 'next/dynamic'
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useGames } from "lib/hooks"
import { useSession } from "next-auth/react"
import FlashMessage, { Flash } from "./flash-msg"
import { GameWithPrices } from "types/game-with-prices"
import { DeleteGameButton } from "./delete-game-button"

const DynamicGamePriceHistory = dynamic(() => import('../components/game-price-history').then(mod => mod.GamePriceHistory), {
    loading: () => <p>Loading...</p>,
})

export const GameCard = (props: { game: GameWithPrices }) => {
    const locale = process.env.NEXT_PUBLIC_LOCALE
    const { mutate } = useGames()

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [flash, setFlash] = useState<Flash>({})
    const FLASH_MESSAGE_DELAY = 5000

    const session = useSession()
    const { id: userId } = session.data?.user || '' // default when using with unsigned user (exampleGames)

    const updateGame = async () => {
        if (isRefreshing) {
            throw new Error('You have already requested an update for this game. No need to spam the button ;-)')
        }
        setIsRefreshing(true)
        const res = await fetch(`/api/games/update/${props.game.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId })
        })
        if (res.status !== 200) {
            const error = await res.json().then(res => res.error)
            setFlash({ message: error, severity: 'error', delay: FLASH_MESSAGE_DELAY })

        } else {
            mutate()
            setFlash({ message: 'Game was successfully updated', severity: 'success', delay: FLASH_MESSAGE_DELAY })
        }
        setIsRefreshing(false)
        setTimeout(() => setFlash({}), FLASH_MESSAGE_DELAY)
    }

    return (
        <div className="w-64 mx-5 my-10 shadow-md shadow-deep-blue" data-cy="gamecard">
            <div className="relative">
                <div className="absolute top-0 z-10">
                    <FlashMessage severity={(flash.severity) as ('success' | 'error')} delay={flash.delay ?? 5000}>
                        {flash.message}
                    </FlashMessage>
                </div>
            </div>
            <Link href={props.game.url} >
                <div className="w-64 h-64 relative">
                    <Image className="object-fill"
                        fill
                        src={props.game.cover}
                        alt={props.game.name + ' game cover'}
                        unoptimized={true}
                    />
                </div>
            </Link>
            <div className="flex flex-col relative h-40 px-4 py-6 font-josephin bg-light-grey dark:bg-slate-300">

                <DeleteGameButton game={props.game} />

                <div className="flex space-x-3 mt-3">
                    <span className="w-16 h-fit rounded-lg bg-deep-blue text-center text-cream font-semibold" data-cy="game_platform">{props.game.platform}</span>
                    <div className="flex">
                        <pre className="inline-block font-josephin">Best Price: </pre>
                        <span className="font-semibold text-deep-blue" data-cy="game_price">{props.game.prices.reduce((a, b) => (a.date > b.date ? a : b)).bestPrice}€</span>

                        <DynamicGamePriceHistory game={props.game} />
                    </div>
                </div>
                <div className="flex h-full justify-center items-end text-sm">
                    <pre className="inline-block font-josephin">Last updated: </pre>
                    <span className="font-semibold text-deep-blue" data-cy="game_update_date">{new Date(props.game.dateUpdated).toLocaleDateString(locale)}</span>
                    {
                        session.status === 'authenticated' ?
                            <button onClick={updateGame} className="w-12" data-cy="game_update_button">
                                <svg className={`${isRefreshing ? 'animate-spin ' : ''} inline-block h-4 w-4 text-deep-blue`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                            </button> :
                            <></>
                    }
                </div>
            </div>
            <div className="flex justify-center items-center h-16 bg-deep-blue dark:bg-slate-300 dark:border-t-[1px] dark:border-t-deep-blue dark:border-opacity-30 text-cream dark:text-deep-blue text-center text uppercase text-xl leading-6">
                <Link href={props.game.url} data-cy="game_name">
                    {props.game.name}
                </Link>
            </div>
        </div>
    )
}