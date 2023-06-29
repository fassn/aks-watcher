import { useGames } from "lib/hooks"
import { useSession } from "next-auth/react"
import { Dispatch, SetStateAction, useState } from "react"
import ReactModal from "react-modal"
import { Flash } from "./flash-msg"

type DeleteAllProps = {
    setFlash: Dispatch<SetStateAction<Flash>>
}

export const DeleteAll = ({ setFlash }: DeleteAllProps) => {
    const session = useSession()
    const { games, mutate } = useGames()

    const [isDeleting, setIsDeleting] = useState(false)
    const [modalShow, setModalShow] = useState(false)

    const onClick = async () => {
        if (isDeleting) {
            throw new Error('You have already requested a full deletion of your games. No need to spam.')
        }
        const { id: userId } = session.data?.user
        if (!userId) {
            throw new Error('You are not logged in.')
        }

        setIsDeleting(true)
        setModalShow(false)
        setFlash({ message: 'Deletion has started. This may take a while. Please do not reload the page.', severity: 'info', delay: 5000 })

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
            mutate([])
            setFlash({ message: 'Games were successfully deleted', severity: 'success', delay: 5000 })
        }
        setIsDeleting(false)
        setTimeout(() => setFlash({}), 5000)
    }

    const showModal = () => {
        setModalShow(!modalShow)
    }

    const closeModal = () => {
        setModalShow(false)
    }

    return (
        <div className="w-full flex justify-end">
            <button id="delete_all_button" className="flex items-center mr" onClick={showModal}>
                <span className="font-josephin mr-2 dark:text-light-grey">
                    Delete all
                </span>
                <svg className="dark:fill-light-grey" xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 32 32"><g data-name="70-Trash"><path d="m29.89 6.55-1-2A1 1 0 0 0 28 4h-7V2a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v2H4a1 1 0 0 0-.89.55l-1 2A1 1 0 0 0 3 8h2v22a2 2 0 0 0 .47 1.41A2 2 0 0 0 7 32h18a2 2 0 0 0 2-2V8h2a1 1 0 0 0 .89-1.45zM13 2h6v2h-6zm12 28H7V8h18z" /><path d="M17 26V10a2 2 0 0 0-2 2l.06 14H15v2a2 2 0 0 0 2-2zM22 26V10a2 2 0 0 0-2 2l.06 14H20v2a2 2 0 0 0 2-2zM12 26V10a2 2 0 0 0-2 2l.06 14H10v2a2 2 0 0 0 2-2z" /></g></svg>
            </button>
            <ReactModal
                id='delete_all_modal'
                className='absolute top-1/3 left-1/2 -translate-x-1/2 overflow-auto'
                overlayClassName='fixed inset-0 backdrop-blur-[5px]'
                isOpen={modalShow}
                onRequestClose={closeModal}
            >
                <div className="flex flex-col w-80 h-48 p-4 bg-white dark:bg-slate-300">
                    <p className="h-1/2 text-center">Are you sure you want to remove all your games?</p>
                    <div className="flex h-1/2">
                        <button id='delete_all_submit' onClick={onClick} className="flex-none w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded">Confirm</button>
                    </div>
                </div>
            </ReactModal>
        </div>
    )
}