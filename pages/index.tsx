import type { NextPage } from "next";
import { Game } from "@prisma/client";
import styles from "../styles/Home.module.css"
import { useGames } from "lib/hooks";
import { useSession } from "next-auth/react";

import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import { GamesBar } from "components/games-bar";

const Home: NextPage = () => {
    const { data: session } = useSession()
    const { games, isError, isLoading } = useGames()

    if (isError) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>
    if (games) return (
        <>
            <div className={styles.container}>
                {
                    session ?
                        <>
                            <GamesBar />

                            <div id="games_container" className={"flex justify-evenly " + (games.length > 0 ? "flex-wrap" : "flex-col")}>
                                {
                                    games.length > 0
                                        ? games.map((game: Game) => (
                                            <GameCard key={game.id} game={game} />
                                        ))
                                        : <div className="flex h-full justify-center items-center">
                                            <p>There are no games tracked yet.</p>
                                        </div>
                                }
                                <AddGameCard></AddGameCard>
                            </div>
                        </> :
                        <div className="text-center text-deep-blue leading-loose">
                            <p className="text-lg mb-4 italic" data-cy="short_description">The AKS Price Tracker uses the links from a game price comparison page on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.<br />
                                For example the <a href="https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/">game page for Doom Eternal</a> is https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/.
                            </p>
                            <div className="justify-center text-xl">
                                <h1 className="underline text-4xl">How to use</h1>
                                <ol className="list-decimal text-lg text-left inline-block my-10" data-cy="how_to_use_instructions">
                                    <li>Sign-in using your email in the header field.</li>
                                    <li>Search for the games you would like to track on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.</li>
                                    <li>Copy the link from a game price comparison page.</li>
                                    <li>Once signed-in, add a game by clicking the + icon at the top right or the blank game card.</li>
                                    <li>Profit!</li>
                                </ol>
                            </div>
                            <h2 className="underline text-3xl">Example of tracked games:</h2>
                            <div className="flex justify-evenly flex-wrap" data-cy="example_games">
                                {
                                    games.map((exampleGame: Game) => (
                                        <GameCard key={exampleGame.id} game={exampleGame} />
                                    ))
                                }
                            </div>
                        </div>
                }
            </div>
        </>
    );
    return <></>
};



export default Home;
