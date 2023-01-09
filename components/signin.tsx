import { signIn, signOut, useSession } from "next-auth/react"

const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const emailValue = (event.target as HTMLInputElement).value
    signIn("email", { email: emailValue })
}

const SignIn = () => {
    const { data: session } = useSession()

    if (session?.user) {
        return (
            <div>
                <span className="text-cream">
                    <strong>{ session.user.email }</strong>
                </span>
                <button onClick={() => signOut()} className='w-32' data-cy='signout'>
                    Sign Out
                </button>
            </div>
        )
    } else {
        return (
            <form onSubmit={handleSubmit} data-cy='signin_form'>
                <input
                    type='email'
                    id='email'
                    name='email'
                    placeholder='email@example.com'
                    className="shadow appearance-none border border-deep-blue rounded text-center text-deep-blue"
                    data-cy='email'
                    required
                />
                <button type='submit'
                    className="w-20 justify-center bg-deep-blue text-cream font-semibold"
                    data-cy='submit'
                >
                    Sign In
                </button>
            </form>
        )
    }
}

export default SignIn