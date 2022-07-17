import { ReactNode } from "react"

type FlashMsgProps = {
    children: ReactNode,
    severity: ('success'|'error'),
}

const FlashMsg: React.FC<FlashMsgProps> = ({ children, severity }) => {
    let className = 'absolute top-0 z-10 text-base py-2 px-6 mb-4 '
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
    return (
        <div className="relative">
            <div className={className} role="alert">
                {children}
            </div>
        </div>
    )
}

export default FlashMsg