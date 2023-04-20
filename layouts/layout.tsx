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

            <div id='root'>
                <Header />

                <main id="main" className="min-h-screen h-full pt-20 pb-32 bg-cream dark:bg-deep-blue">
                    {children}
                </main>
            </div>


            <Footer />
        </>
    )
}