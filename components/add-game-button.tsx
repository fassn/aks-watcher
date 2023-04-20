import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { GameForm } from "./game-form";

export const AddGameButton = () => {
    const {data: session} = useSession()
    const [modalShow, setModalShow] = useState(false)

    useEffect(() => {
        ReactModal.setAppElement(document.getElementById('root')!); //non-null assertion
    }, [])

    const openModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    if (session) {
        return (
            <div className="flex w-full justify-end">
                <button id='add_game_header' onClick={openModal} className="flex justify-center items-center w-11 h-11">
                    <svg className="h-6 w-6 text-cream dark:text-deep-blue"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                    </svg>
                </button>
                    <ReactModal
                        className='absolute top-1/3 overflow-auto left-[40%] w-1/5 rounded p-5'
                        overlayClassName='fixed inset-0 backdrop-blur-[5px]'
                        isOpen={modalShow}
                        onRequestClose={closeModal}
                    >
                        <GameForm closeModal={closeModal} />
                    </ReactModal>
            </div>
        )
    }
    return <></>
}