import useSWR, { KeyedMutator } from 'swr'
import { fetcher } from 'lib/utils'
import { Game } from '@prisma/client'
import { DependencyList, EffectCallback, useEffect, useRef } from 'react'

interface IUseGames {
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

    const useGames: IUseGames = {
        games: data,
        isLoading,
        isError: error,
        isValidating,
        mutate
    }
    return useGames
}

export function useEffectAfterMount(effect: EffectCallback, deps: DependencyList) {
    const isMounted = useRef(false);

    useEffect(() => {
        if (isMounted.current) return effect();
        else isMounted.current = true;
    }, deps);

    // reset on unmount; in React 18, components can mount again, development only
    // useEffect(() => {
    //     isMounted.current = false;
    // });
}