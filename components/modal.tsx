import { ReactNode, useEffect, useRef } from "react"

type ModalProps = {
    id?: string,
    children: ReactNode,
    open: boolean,
    onRequestClose: () => void,
    className: string
}

export const Modal: React.FC<ModalProps> = ({ id, children, open, onRequestClose, className }) => {
    const dialogRef = useRef<any>(null)

    useEffect(() => {
        const dialogNode = dialogRef.current

        if (open) {
            dialogNode?.showModal()
        } else {
            dialogNode?.close()
        }
    }, [open])

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