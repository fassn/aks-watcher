import { ReactNode, useEffect, useState } from "react"

export interface Flash {
    message?: string,
    severity?: ('success'|'error'),
    delay?: number
}

type FlashMessageProps = {
    children: ReactNode,
    severity: ('success'|'error'),
    delay: number,
}

const FlashMessage: React.FC<FlashMessageProps> = ({ children, severity, delay }) => {
    const [isVisible, setIsVisible] = useState(false)

    let className = 'text-base text-center '
    switch (severity) {
        case 'success':
            className += 'bg-green-100 text-green-700 '
            break;
        case 'error':
            className += 'bg-red-100 text-red-700'
            break;
        default:
            className = ''
    }

    useEffect(() => {
            setIsVisible(true)
            setTimeout(() => {
                setIsVisible(false)
            }, delay)
    }, [children])

    return (
        isVisible ?
            <div className={className} role="alert">
                {children}
            </div> :
        <></>
    )
}

export default FlashMessage