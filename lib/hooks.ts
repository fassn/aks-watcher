import useSWR, { KeyedMutator } from 'swr'
import fetcher from 'lib/fetcher'
import { Game } from '@prisma/client'

interface useGames {
    games: Game[],
    isLoading: boolean,
    isError: any,
    isValidating: boolean,
    mutate: KeyedMutator<any>
}

export function useGames() {
    const { data, error, isLoading, isValidating, mutate } = useSWR('/api/games/get', fetcher, {
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