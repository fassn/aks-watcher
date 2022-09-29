import type { AppProps } from 'next/app'
import { Session } from 'next-auth';
import { SessionProvider } from "next-auth/react"
import '../styles/globals.css'

import { Layout } from '../layouts/layout';

function MyApp({ Component, pageProps }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={pageProps.session}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SessionProvider>
  )
}

export default MyApp
