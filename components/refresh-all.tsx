import { useGames } from "lib/hooks"
import { useSession } from "next-auth/react"
import { Dispatch, SetStateAction, useState } from "react"
import { Flash } from "./flash-msg"

type RefreshAllProps = {
    setFlash: Dispatch<SetStateAction<Flash>>
}

export const RefreshAll = ({ setFlash }: RefreshAllProps) => {
    const { data: session } = useSession()
    const { games, mutate } = useGames()

    const [isRefreshing, setIsRefreshing] = useState(false)
    const onClick = async () => {
        if (isRefreshing) {
            throw new Error('You have already requested a full refresh. No need to spam the button ;-)')
        }
        const { id: userId } = session?.user
        if (!userId) {
            throw new Error('You are not logged in.')
        }

        setIsRefreshing(true)
        setFlash({ message: 'Update has started. This may take some time.', severity: 'info', delay: 5000 })

        const res = await fetch('/api/games/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, games: games })
        })
        if (res.status !== 200) {
            const error = await res.json().then(res => res.error)
            setFlash({ message: error, severity: 'error', delay: 5000 })
            setIsRefreshing(false)
            setTimeout(() => setFlash({}), 5000)
        }
        if (res.status === 200 && games) {
            /*
            ** Pretty terrible but since a job doesn't return anything and I seemingly cant mutate from the job or an api route,
            ** I cheat by delaying the mutation here by the max number of games that can be updated.
            */
            const timeout = games.length * process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES
            setTimeout(() => {
                mutate()
                setFlash({ message: 'Games were successfully updated', severity: 'success', delay: 5000 })
                setIsRefreshing(false)
            }, timeout)
        }
    }

    return (
        <div className="flex mx-10">
            <span className="w-20 font-josephin dark:text-light-grey">Refresh all </span>
            <button id="refresh_all" onClick={onClick}>
                <svg className={`${isRefreshing ? 'animate-spin ' : ''} inline-block h-4 w-4 mx-2 text-deep-blue dark:text-light-grey`} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -5v5h5" />  <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 5v-5h-5" /></svg>
            </button>
        </div>
    )
}