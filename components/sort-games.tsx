import { Game } from "@prisma/client"
import { ChangeEvent } from "react"

type SortGamesProps = {
    games: Game[],
    setGames: any
}

export const SortGames = ({ games, setGames }: SortGamesProps) => {
    const sort = (event: ChangeEvent<HTMLSelectElement>) => {
        switch (event.target.value) {
            case 'game_asc':
                games.sort((a: Game, b: Game) => {
                    if (a.name < b.name) return -1
                    if (a.name > b.name) return 1
                    return 0
                })
                break;
            case 'game_desc':
                games.sort((a: Game, b: Game) => {
                    if (a.name < b.name) return 1
                    if (a.name > b.name) return -1
                    return 0
                })
                break;
            case 'price_asc':
                games.sort((a: Game, b: Game) => {
                    if (a.bestPrice < b.bestPrice) return -1
                    if (a.bestPrice > b.bestPrice) return 1
                    return 0
                })
                break;
            case 'price_desc':
                games.sort((a: Game, b: Game) => {
                    if (a.bestPrice < b.bestPrice) return 1
                    if (a.bestPrice > b.bestPrice) return -1
                    return 0
                })
                break;
        }
        setGames([...games])
    }

    return (
        <>
            <label htmlFor="sort_games">Sort </label>
            <select onChange={sort} id="sort_games">
                <option value='game_asc'>Game (a-z)</option>
                <option value='game_desc'>Game (z-a)</option>
                <option value='price_asc'>Price (smallest)</option>
                <option value='price_desc'>Price (biggest)</option>
            </select>
        </>
    )
}