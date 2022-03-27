import { ReactNode, useEffect, useRef } from "react"

type ModalProps = {
    id?: string,
    children: ReactNode,
    open: boolean,
    onRequestClose: () => void,
    className: string
}

export const Modal: React.FC<ModalProps> = ({ id, children, open, onRequestClose, className }) => {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialogNode = dialogRef.current

        if (open) {
            dialogNode.showModal()
        } else {
            dialogNode.close()
        }
    }, [open])

    useEffect(() => {
        const dialogNode = dialogRef.current
        const handleCancel = (event: Event) => {
            event.preventDefault()
            onRequestClose()
        }
        dialogNode.addEventListener('cancel', handleCancel)
        return () => {
            dialogNode.removeEventListener('cancel', handleCancel)
        }
    }, [onRequestClose])

    return (
        <dialog id={id} className={className} ref={dialogRef}>{children}</dialog>
    )
}