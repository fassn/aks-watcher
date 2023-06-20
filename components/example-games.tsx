import { GameCard } from "./game-card"
import { GameWithPrices } from "types/game-with-prices"

export const ExampleGames = (props: { games: GameWithPrices[] }) => {
    return (
        <div className="text-center text-deep-blue leading-loose">
            <p className="text-lg dark:text-light-grey mb-4 italic" data-cy="short_description">The AKS Price Tracker uses the links from a game price comparison page on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.<br />
                For example the <a href="https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/">game page for Doom Eternal</a> is https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/.
            </p>
            <div className="justify-center text-xl dark:text-light-grey">
                <h1 className="underline text-4xl">How to use</h1>
                <ol className="list-decimal text-lg text-left inline-block my-10" data-cy="how_to_use_instructions">
                    <li>Sign-in using your email in the header field.</li>
                    <li>Search for the games you would like to track on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.</li>
                    <li>Copy the link from a game price comparison page.</li>
                    <li>Once signed-in, add a game by clicking the + icon at the top right or the blank game card.</li>
                    <li>Profit!</li>
                </ol>
            </div>
            <h2 className="underline text-3xl dark:text-light-grey">Example of tracked games:</h2>
            <div className="flex justify-evenly flex-wrap" data-cy="example_games">
                {
                    props.games.map((exampleGame: GameWithPrices) => (
                        <GameCard key={exampleGame.id} game={exampleGame} />
                    ))
                }
            </div>
        </div>
    )
}