import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useEffect, useState } from "react";

import { Game } from "./api/helpers/game";
import { gamesRepo as repo } from "./api/helpers/games-repo";
import { GameCard } from "../components/game-card";
import { AddGameCard } from "../components/add-game-card"
import styles from "../styles/Home.module.css";

export const getStaticProps: GetStaticProps = () => {
    const gamesRepo: Game[] = repo.getAll()

    return { props: { gamesRepo } }
}

const Home: NextPage = ({ gamesRepo }: InferGetStaticPropsType<typeof getStaticProps>) => {
    const [games, setGames] = useState(gamesRepo)

    useEffect(() => {
        const today = new Date().getDate()
        let gamesIdToUpdate: number[] = []

        for (const game of games) {
            const lastUpdated = new Date(game.dateUpdated).getDate()
            const dateDiff = today - lastUpdated
            if (dateDiff >= 3) {
                gamesIdToUpdate.push(game.id)
            }
        }
        if (gamesIdToUpdate.length > 0) {
            const endpoint = '/api/games/update'
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(gamesIdToUpdate),
            }
            fetch(endpoint, options)
                .then(res => res.json())
                .then((updatedGames: Game[]) => {
                    setGames([...updatedGames])
                })
        }
    }, [])

    return (
        <>
            <div className={styles.container}>
                {
                    games.length > 0
                    ? games.map((game: Game) => (
                        <GameCard key={game.id} gameData={game} />
                    ))
                    : <div className="flex h-full justify-center items-center">
                        <p className="flex-none">There are no games tracked yet.</p>
                    </div>
                }
                <AddGameCard></AddGameCard>
            </div>
        </>
    );
};

export default Home;
