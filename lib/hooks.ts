import useSWR, { KeyedMutator } from 'swr'
import { fetcher } from 'lib/utils'
import { Game } from '@prisma/client'

interface useGames {
    games: Game[] | undefined,
    isLoading: boolean,
    isError: Error | undefined,
    isValidating: boolean,
    mutate: KeyedMutator<any>
}

export function useGames() {
    const { data, error, isLoading, isValidating, mutate } = useSWR<Game[], Error>('/api/games/get', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        suspense: true,
        fallbackData: []
    })

    const useGames: useGames = {
        games: data,
        isLoading,
        isError: error,
        isValidating,
        mutate
    }
    return useGames
}