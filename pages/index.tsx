import type { NextPage } from "next";
import styles from "../styles/Home.module.css"
import { useGames } from "lib/hooks";
import { useSession } from "next-auth/react";

import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import { GamesBar } from "components/games-bar";
import { ExampleGames } from "components/example-games";
import { GameWithPrices } from "types/game-with-prices";

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
                                    ? games.map((game: GameWithPrices) => (
                                        <GameCard key={game.id} game={game} />
                                    ))
                                    : <div className="flex h-full justify-center items-center">
                                        <p>There are no games tracked yet.</p>
                                    </div>
                            }
                            <AddGameCard></AddGameCard>
                        </div>
                    </> :
                    <ExampleGames games={games} />
                }
            </div>
        </>
    );
    return <></>
};



export default Home;
