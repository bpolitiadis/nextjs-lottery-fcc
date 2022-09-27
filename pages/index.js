import Head from "next/head";
import styles from "../styles/Home.module.css";
import ManualHeader from "../components/ManualHeader";
import Header from "../components/Header";
import LotteryEntrance from "../components/LotteryEntrance";
import Info from "../components/Info";

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>DeKino Decentralized Lottery</title>
                <meta
                    name="description"
                    content="DeKino Decentralized Lottery created with NextJS"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Header />
            <div className={styles.main}>
                <LotteryEntrance />
                <Info />
            </div>
        </div>
    );
}
