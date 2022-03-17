import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { Listing } from "../components/listing";
import styles from "../styles/Home.module.css";
import { Game } from "./api/helpers/game";
import { gamesRepo } from "./api/helpers/games-repo";

export const getStaticProps: GetStaticProps = async () => {
    const games = gamesRepo.getAll()
    return { props: { games } }
}

const Home: NextPage = ({ games }: InferGetStaticPropsType<typeof getStaticProps>) => {
    console.log(games)
    return (
        <>
            <div className={styles.container}>
                {
                    games.length > 0
                    ? <Listing games={games}></Listing>
                    : <div>There are no games.</div>
                }
            </div>
            {/* <div>
                {
                    games.map((game: Game) => {
                        return (
                            <div key={game.id}>{game.name}</div>
                        )
                    })
                }
            </div> */}
        </>
    );
};

export default Home;
