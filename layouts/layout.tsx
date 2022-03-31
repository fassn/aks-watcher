import { Header } from "../components/header"
import { Footer } from "../components/footer"
import { PropsWithChildren } from "react"
import Head from "next/head"

type LayoutProps = PropsWithChildren<{}>

export const Layout = ({ children }: LayoutProps) => {
    return (
        <>
            <Head>
                <title>AllKeyShop Price Tracker</title>
                <meta name="description" content="This app tracks prices on allkeyshop for games you want to buy." key='description' />
                <link rel="icon" href="/favicon.ico" key='icon' />
            </Head>

            <Header />

            <main className="pt-20 pb-32 bg-cream">
                {children}
            </main>

            <Footer />
        </>
    )
}