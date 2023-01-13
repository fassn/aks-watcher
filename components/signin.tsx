import { signIn, signOut, useSession } from "next-auth/react"

const handleSubmit = (event: any) => {
    event.preventDefault()
    const target = event.target as typeof event.target & FormData
    signIn("email", { email: target.email.value })
}

const SignIn = () => {
    const { data: session } = useSession()

    if (session?.user) {
        return (
            <div>
                <span className="text-cream" data-cy="signedin_email">
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