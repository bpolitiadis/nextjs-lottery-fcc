import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import ManualHeader from '../components/ManualHeader'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>DeKino Decentralized Lottery</title>
        <meta name="description" content="DeKino Decentralized Lottery created with NextJS" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* header / connect button / nav bar */}
      <ManualHeader></ManualHeader>
    Helloooo
      
    </div>
  )
}
