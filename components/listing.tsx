import { Game } from "../pages/api/helpers/game"
import { GameCard } from "./gameCard"

type ListingProps = {
    games: Game[]
}

export const Listing = ({ games }: ListingProps) => {
    return (
        <>
            {games.map((game: Game) => (
                <GameCard key={game.id} gameData={game} />
            ))}
        </>
    )
}