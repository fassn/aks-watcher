import type { NextPage } from "next";
import { Game } from "@prisma/client";
import styles from "../styles/Home.module.css"
import { useGames } from "lib/hooks";
import { useState } from "react";
import { useSession } from "next-auth/react";

import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import { SortGames } from "components/sort-games";
import { RefreshAll } from "components/refresh-all";
import { DeleteAll } from "components/delete-all";
import FlashMessage, { Flash } from "components/flash-msg";

const Home: NextPage = () => {
    const { data: session } = useSession()
    const { games, isError, isLoading } = useGames()
    const [flash, setFlash] = useState<Flash>({})

    if (isError) return <div>failed to load</div>
    if (isLoading) return <div>loading...</div>
    if (games) return (
        <>
            <div className={styles.container}>
                {
                    session ?
                        <>
                            <div className="flex border-solid border-deep-blue border-b-2 py-2">
                                <div className="flex font-josephin">
                                    <SortGames />
                                </div>
                                <RefreshAll setFlash={setFlash}/>
                                <div className="flex min-w-fit">
                                    <FlashMessage severity={(flash.severity) as ('success' | 'info' | 'error')} delay={flash.delay ?? 5000}>
                                        {flash.message}
                                    </FlashMessage>
                                </div>
                                <DeleteAll setFlash={setFlash} />
                            </div>

                            <div className={"flex justify-evenly " + (games.length > 0 ? "flex-wrap" : "flex-col")}>
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
                            <p className="text-lg mb-4 italic">The AKS Price Tracker uses the links from a game price comparison page on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.<br />
                                For example the <a href="https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/">game page for Doom Eternal</a> is https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/.
                            </p>
                            <div className="justify-center text-xl">
                                <h1 className="underline text-4xl">How to use</h1>
                                <ol className="list-decimal text-lg text-left inline-block my-10">
                                    <li>Sign-in using your email in the header field.</li>
                                    <li>Search for the games you would like to track on the <a href="https://www.allkeyshop.com">AllKeyShop</a> website.</li>
                                    <li>Copy the link from a game price comparison page.</li>
                                    <li>Once signed-in, add a game by clicking the + icon at the top right or the blank game card.</li>
                                    <li>Profit!</li>
                                </ol>
                            </div>
                            <h2 className="underline text-3xl">Example of tracked games:</h2>
                            <div className="flex justify-evenly flex-wrap">
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
