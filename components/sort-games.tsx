import { ChangeEvent, useState } from "react"
import { useEffectAfterMount, useGames } from "lib/hooks"
import { GameWithPrices } from "types/game-with-prices"

type SortValue = ('game_asc' | 'game_desc' | 'price_asc' | 'price_desc')

export const SortGames = () => {
    const { games, mutate } = useGames()
    const [sortValue, setSortValue] = useState<SortValue>('game_asc')

    useEffectAfterMount(() => { // There is no need to sort on inital render
        sort(sortValue)
    }, [games])

    const sort = (sortValue: SortValue) => {
        if (games) {
            switch (sortValue) {
                case 'game_asc':
                    games.sort((a: GameWithPrices, b: GameWithPrices) => {
                        if (a.name < b.name) return -1
                        if (a.name > b.name) return 1
                        return 0
                    })
                    break;
                case 'game_desc':
                    games.sort((a: GameWithPrices, b: GameWithPrices) => {
                        if (a.name < b.name) return 1
                        if (a.name > b.name) return -1
                        return 0
                    })
                    break;
                case 'price_asc':
                    games.sort((a: GameWithPrices, b: GameWithPrices) => {
                        const aPrice = a.prices.at(-1)?.bestPrice ?? 0
                        const bPrice = b.prices.at(-1)?.bestPrice ?? 0
                        if (aPrice < bPrice) return -1
                        if (aPrice > bPrice) return 1
                        return 0
                    })
                    break;
                case 'price_desc':
                    games.sort((a: GameWithPrices, b: GameWithPrices) => {
                        const aPrice = a.prices.at(-1)?.bestPrice ?? 0
                        const bPrice = b.prices.at(-1)?.bestPrice ?? 0
                        if (aPrice < bPrice) return 1
                        if (aPrice > bPrice) return -1
                        return 0
                    })
                    break;
            }
            mutate()
        }
    }

    const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const newValue = event.target.value as SortValue
        sort(newValue)
        setSortValue(newValue)
    }

    return (
        <>
            <label htmlFor="sort_games" className="dark:text-light-grey">Sort </label>
            <select value={sortValue} onChange={onChange} id="sort_games" className="ml-2 dark:bg-slate-300">
                <option value='game_asc'>Game (a-z)</option>
                <option value='game_desc'>Game (z-a)</option>
                <option value='price_asc'>Price (smallest)</option>
                <option value='price_desc'>Price (biggest)</option>
            </select>
        </>
    )
}