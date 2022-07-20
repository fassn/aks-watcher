import { ReactNode, useEffect, useState } from "react"

export interface Flash {
    message?: string,
    severity?: ('success'|'error'),
    delay?: number
}

type FlashMsgProps = {
    children: ReactNode,
    severity: ('success'|'error'),
    delay: number,
}

const FlashMsg: React.FC<FlashMsgProps> = ({ children, severity, delay }) => {
    const [isVisible, setIsVisible] = useState(false)

    let className = 'text-base '
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
        isVisible ? <div className="relative">
            <div className='absolute top-0 z-10' role="alert">
                <div className={'whitespace-nowrap w-full opacity-80 ' + className}>
                    {children}
                </div>
            </div>
        </div> :
        <></>
    )
}

export default FlashMsg