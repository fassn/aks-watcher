import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"

export const Header = () => {
    const {data: session} = useSession()

    const handleSubmit = (event: any) => {
        event.preventDefault()
        const target = event.target as typeof event.target & FormData
        signIn("email", { email: target.email.value })
    }

    const LoginButton = () => {
        if (session?.user) {
            return (
                <div>
                    <span className="text-cream">
                        <strong>{session.user.email}</strong>
                    </span>
                    <button onClick={() => signOut()} className='w-32'>
                        Sign Out
                    </button>
                </div>
            )
        } else {
            return (
                <form onSubmit={handleSubmit}>
                    <input
                        type='text'
                        id='email'
                        name='email'
                        placeholder='email@example.com'
                        className="shadow appearance-none border border-deep-blue rounded text-center text-deep-blue"
                    />
                    <button type='submit'
                        className="w-20 justify-center bg-deep-blue text-cream font-semibold"
                    >
                        Sign In
                    </button>
                </form>
            )
        }
    }

    const AddGameButton = () => {
        if (session) {
            return (
                <div className="flex w-full justify-end">
                    <button className="flex justify-center items-center w-11 h-11">
                        <Link href='/add' passHref={true}>
                            <svg className="h-6 w-6 text-cream"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                        </Link>
                    </button>
                </div>
            )
        }
        return <></>
    }

    return (
        <header className="flex w-full fixed top-0 z-50 h-12 items-center bg-deep-blue pl-8 pr-4">
            <h1 className="flex-none text-light-grey justify-center uppercase font-josephin font-bold">
                <Link href='/'>
                    <a>AKS Price Tracker</a>
                </Link>
            </h1>
            <span className="flex-none text-light-grey mx-6 pb-1">|</span>
            <div className="flex-none text-light-grey justify-center font-josephin font-bold">
                <LoginButton />
            </div>
            <AddGameButton />
        </header>
    )
}