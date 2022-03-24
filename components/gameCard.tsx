import Image from "next/image"
import Link from "next/link"
import { Game } from "../pages/api/helpers/game"

const refreshPrice = () => {
    fetch('/api/games/refresh').then()
}

export const GameCard = (props: { game: Game }) => {
    const locale = process.env.NEXT_PUBLIC_LOCALE
    return (
        <div className="flex justify-center">
            <div className="w-64 my-10 outline outline-2 shadow shadow-light-grey">
                <div className="flex h-64">
                    <Link href={props.game.url}>
                        <a>
                            <Image
                                src={ props.game.cover }
                                alt={ props.game.name + ' game cover'}
                                width='256'
                                height='256'
                            />
                        </a>
                    </Link>
                </div>
                <div className="flex flex-col h-40 px-4 py-6 font-josephin bg-light-grey">
                    <div className="flex space-x-3">
                        <span className="w-16 h-fit rounded-lg bg-deep-blue text-center text-cream font-semibold">{ props.game.platform }</span>
                        <div>
                            <pre className="inline-block font-josephin">Best Price: </pre>
                            <span className="font-semibold text-deep-blue">{ props.game.bestPrice }€</span>
                        </div>
                    </div>
                    <div className="flex h-full justify-center items-end text-sm">
                        <pre className="inline-block font-josephin">Last updated: </pre>
                        <span className="font-semibold text-deep-blue">{ new Date(props.game.dateUpdated).toLocaleDateString(locale) }</span>
                        <button onClick={refreshPrice} className="w-12">
                            <svg className="inline-block h-4 w-4 text-deep-blue" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z"/>  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex justify-center items-center h-16 bg-deep-blue text-cream text-center uppercase text-xl leading-6">
                    <Link href={props.game.url}>
                        <a>{ props.game.name }</a>
                    </Link>
                </div>
            </div>
        </div>
    )
}