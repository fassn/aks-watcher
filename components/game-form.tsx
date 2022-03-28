import { useRouter } from "next/router"

interface FormData {
    aksLink: { value: string }
}

export const GameForm = () => {
    const router = useRouter()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const target = event.target as typeof event.target & FormData
        const endpoint = '/api/games/store'
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({url: target.aksLink.value}),
        }
        await fetch(endpoint, options)

        router.push('/')
    }

    // Can easily add new patterns if AllKeyShop URLs were to change in the future.
    const regexPatterns = [
        'https:\/\/www\.allkeyshop\.com\/blog\/buy-[A-Za-z0-9\-]+compare-prices\/?',
        'https:\/\/www\.allkeyshop\.com\/blog\/compare-and-buy-cd-key-for-digital-download-[A-Za-z0-9\-]+\/?'
    ]
    const pattern = regexPatterns.join('|')

    return (
        <>
            <form onSubmit={handleSubmit} method='post'>
                <div className="flex flex-col h-96 bg-light-grey font-josephin outline outline-2 shadow-md shadow-deep-blue px-4 pt-10 pb-4">
                    <div className="w-full mb-3">
                        Paste an AllKeyShop link:<br />
                        <i className="text-xs break-words">https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/</i>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aksLink">AllKeyShop Link:</label>
                        <input
                            className="shadow appearance-none border border-deep-blue rounded w-full py-2 px-3 text-deep-blue mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            type='text'
                            id='aksLink'
                            name='aksLink'
                            placeholder='https://www.allkeyshop.com/...'
                            pattern={pattern}
                            title='Invalid link. Please check the description above for an example.'
                            required
                        />
                    </div>
                    <div className="flex h-full">
                        <button className="flex w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded" type='submit'>Add Game</button>
                    </div>
                </div>
            </form>
        </>
    )
}