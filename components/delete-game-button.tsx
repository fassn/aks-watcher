import { useGames } from "lib/hooks"
import { useSession } from "next-auth/react"
import { useState } from "react"
import ReactModal from "react-modal"
import { GameWithPrices } from "types/game-with-prices"

export const DeleteGameButton = (props: { game: GameWithPrices }) => {

    const [modalShow, setModalShow] = useState(false)
    const { mutate } = useGames()

    const session = useSession()
    const { id: userId } = session.data?.user || '' // default when using with unsigned user (exampleGames)

    const deleteGame = async () => {
        const res = await fetch(`/api/games/delete/${props.game.id}?userId=${userId}&name=${props.game.name}`, {
            method: 'DELETE',
        })
        mutate()
        setModalShow(false)
    }

    const showModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    return <>
        {
            session.status === 'authenticated' ?
            <button onClick={showModal} data-cy="game_delete_button">
                <svg className="absolute top-0 right-0 h-6 w-6 text-red-600 hover:text-deep-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="15" y1="7" x2="7" y2="15" /> <line x1="7" y1="7" x2="15" y2="15" /></svg>
            </button> :
            <></>
        }
        <ReactModal
            id="delete_game_modal"
            className='absolute top-1/3 left-1/2 -translate-x-1/2 overflow-auto'
            overlayClassName='fixed inset-0 backdrop-blur-[5px]'
            isOpen={modalShow}
            onRequestClose={closeModal}
        >
            <div className="flex flex-col w-80 h-48 p-4 bg-white dark:bg-slate-300">
                <p className="h-1/2 text-center">Are you sure you want to remove this game from the list?</p>
                <div className="flex h-1/2">
                    <button id='delete_submit' onClick={deleteGame} className="flex-none w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded">Confirm</button>
                </div>
            </div>
        </ReactModal>
    </>
}