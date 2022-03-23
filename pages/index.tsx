import type { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Link from "next/link";
import { Listing } from "../components/listing";
import styles from "../styles/Home.module.css";
import { gamesRepo } from "./api/helpers/games-repo";

export const getStaticProps: GetStaticProps = async () => {
    const games = gamesRepo.getAll()
    return { props: { games } }
}

const Home: NextPage = ({ games }: InferGetStaticPropsType<typeof getStaticProps>) => {
    return (
        <>
            <div className={styles.container}>
                {
                    games.length > 0
                    ? <Listing games={games}></Listing>
                    : <div className="flex h-full justify-center items-center">
                        <div className="flex-none">There are no games tracked yet.</div>
                        <Link href="/add">
                            <a>Track a Game Now</a>
                        </Link>
                    </div>
                }
            </div>
        </>
    );
};

export default Home;
