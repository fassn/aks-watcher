import { useState } from "react"
import ReactModal from "react-modal"
import { GameForm } from "./game-form"

export const AddGameCard = () => {
    const [modalShow, setModalShow] = useState(false)

    const openModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    return (
        <div className="flex justify-center">
            <div className="w-64 h-120 mx-5 my-10 outline outline-2 shadow shadow-light-grey">
                <button onClick={openModal} className="flex justify-center items-center w-64 h-120">
                    <svg className="h-20 w-20 text-deep-blue dark:text-light-grey"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        </div>
    )
}