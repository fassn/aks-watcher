import { ReactNode, useEffect, useRef } from "react"

type ModalProps = {
    id?: string,
    children: ReactNode,
    show: boolean,
    onRequestClose: () => void,
    className: string
}

export const Modal: React.FC<ModalProps> = ({ id, children, show, onRequestClose, className }) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialogNode = dialogRef.current

        if (show) {
            dialogNode?.showModal()
        }
        return () => dialogNode?.close()
    }, [show])

    useEffect(() => {
        const dialogNode = dialogRef.current

        const handleCancel = (event: Event) => {
            event.preventDefault()
            onRequestClose()
        }
        const handleBackdropClick = (event: Event) => {
            event.preventDefault()
            if (event.target === dialogNode) {
                onRequestClose()
            }
        }
        dialogNode?.addEventListener('cancel', handleCancel)
        dialogNode?.addEventListener('click', handleBackdropClick)
        return () => {
            dialogNode?.removeEventListener('cancel', handleCancel)
            dialogNode?.removeEventListener('click', handleBackdropClick)
        }
    }, [onRequestClose])

    return (
        <dialog id={id} className={className} ref={dialogRef}>{children}</dialog>
    )
}