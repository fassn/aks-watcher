import { ReactNode, useEffect, useState } from "react"

export interface Flash {
    message?: string,
    severity?: ('success'|'info'|'error'),
    delay?: number
}

type FlashMessageProps = {
    children: ReactNode,
    id?: string,
    severity: ('success'|'info'|'error'),
    delay: number,
}

const FlashMessage: React.FC<FlashMessageProps> = (props) => {
    const [isVisible, setIsVisible] = useState(false)

    let className = 'text-base text-center '
    switch (props.severity) {
        case 'success':
            className += 'bg-green-100 text-green-700 '
            break;
        case 'info':
            className += 'bg-yellow-100 text-yellow-700'
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
            }, props.delay)
    }, [props.children])

    return (
        isVisible ?
            <div id={props.id} className={className} role="alert">
                {props.children}
            </div> :
        <></>
    )
}

export default FlashMessage