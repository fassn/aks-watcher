import { useSession } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { GameForm } from "./game-form"
import SignIn from "./signin"
import ReactModal from "react-modal"

export const Header = () => {
    const {data: session} = useSession()
    const [modalShow, setModalShow] = useState(false)

    const openModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    const AddGameButton = () => {
        useEffect(() => {
            ReactModal.setAppElement(document.getElementById('root')!); //non-null assertion
        }, [])

        if (session) {
            return (
                <div className="flex w-full justify-end">
                    <button onClick={openModal} className="flex justify-center items-center w-11 h-11">
                        <svg className="h-6 w-6 text-cream"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </button>
                        <ReactModal
                            className='absolute top-1/3 overflow-auto left-[40%] w-1/5 rounded p-5'
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

    return (
        <header className="flex w-full fixed top-0 z-50 h-12 items-center bg-deep-blue pl-8 pr-4">
            <div className="flex-none text-light-grey justify-center uppercase font-josephin font-bold">
                <Link href='/' data-cy='homepage_link'>
                    AKS Price Tracker
                </Link>
            </div>
            <span className="flex-none text-light-grey mx-6 pb-1">|</span>
            <div className="flex-none text-light-grey justify-center font-josephin font-bold">
                <SignIn />
            </div>
            <AddGameButton />
        </header>
    )
}