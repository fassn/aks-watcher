import Image from "next/image"
import { Game } from "../pages/api/helpers/game"

export const GameCard = (props: { game: Game }) => {
    return (
        <>
            <div className="flex justify-center">
                <div className="w-64 my-10 border-solid border-2 shadow-md shadow-deep-blue">
                    <div className="flex">
                        <Image
                            src={ props.game.cover }
                            alt={ props.game.name + ' game cover'}
                            width='256'
                            height='256'
                        />
                    </div>
                    <div className="flex h-40 space-x-3 px-4 py-6 font-josephin bg-light-grey">
                        <span className="w-20 h-fit rounded-lg bg-deep-blue text-center text-cream font-semibold">{ props.game.platform }</span>
                        <div>
                            <pre className="inline-block font-josephin">Best Price: </pre>
                            <span className="font-semibold">{ props.game.bestPrice } €</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center h-16 bg-deep-blue text-center uppercase text-xl leading-6">
                        { props.game.name }
                    </div>
                </div>
            </div>
        </>
    )
}