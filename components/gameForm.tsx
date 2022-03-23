import { useRouter } from "next/router"

interface FormData {
    aksLink: { value: string }
}

export const GameForm = () => {
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const target = event.target as typeof event.target & FormData
        const JSONdata = JSON.stringify({url: target.aksLink.value})
        const endpoint = '/api/games/register'
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSONdata,
        }
        await fetch(endpoint, options)

        router.push('/')
    }

    return (
        <>
            <form onSubmit={handleSubmit} method='post'>
                <div>
                    Paste the AllKeyShop link. Example:<br />
                    <i>https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/</i>
                </div>
                <label htmlFor="aksLink">AllKeyShop Link</label>
                <input
                    type='text'
                    id='aksLink'
                    name='aksLink'
                    placeholder='https://www.allkeyshop...'
                    pattern="https:\/\/www\.allkeyshop\.com\/blog\/buy-[A-Za-z0-9\-]+compare-prices\/?"
                    title='Invalid link. Please check the description above for an example.'
                    required
                />
                <button type='submit'>Add Game</button>
            </form>
        </>
    )
}