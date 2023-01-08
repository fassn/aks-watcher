import { Game } from "@prisma/client"
import { useGames } from "lib/hooks"
import { useRouter } from "next/router"
import { useState } from "react"
import { mutate } from "swr"
import FlashMessage, { Flash } from "./flash-msg"

interface FormData {
    aksLinks: { value: string }
}

export const GameForm = () => {
    const router = useRouter()
    const { games, mutate } = useGames()
    const [flash, setFlash] = useState<Flash>({})
    const FLASH_MESSAGE_DELAY = 5000

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const target = event.target as typeof event.target & FormData
        const { links, error } = validateLinks(target)
        if (error) {
            setFlash({ message: error, severity: 'error', delay: FLASH_MESSAGE_DELAY })
            setTimeout(() => setFlash({}), FLASH_MESSAGE_DELAY)
        } else {
            fetch('/api/games/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: links })
            }).then(res => res.json().then((storedGames: Game[]) => {
                const newGames = [...games, ...storedGames]
                mutate(newGames)
            }))
            router.push('/')
        }

    }

    // Can easily add new patterns if AllKeyShop URLs were to change in the future.
    const regexPatterns = [
        'https:\/\/www\.allkeyshop\.com\/blog\/buy-[A-Za-z0-9\-]+compare-prices\/?$',
        'https:\/\/www\.allkeyshop\.com\/blog\/compare-and-buy-cd-key-for-digital-download-[A-Za-z0-9\-]+\/?$'
    ]
    const pattern = regexPatterns.join('|')

    const validateLinks = (target: EventTarget & FormData) => {
        const links: string[] = target.aksLinks.value.trim().split('\n')
        if (links.length === 0) {
            return { error: 'No links were found.'}
        }
        if (links.length > 10) {
            return { error: 'Please do not submit more than 10 links at once.' }
        }
        const regex = new RegExp(pattern)
        let validatedLinks = []
        for (const link of links) {
            if (!link) continue
            if (!regex.test(link)) {
                return { error: `the link ${link} is incorrect or not well formatted.`}
            }
            validatedLinks.push(link)
        }
        return { links: validatedLinks, error: '' }
    }

    return (
        <>
            <form onSubmit={handleSubmit} method='post'>
                <div className="flex flex-col h-auto bg-light-grey font-josephin outline outline-2 shadow-md shadow-deep-blue px-4 pt-10 pb-4">
                    <FlashMessage severity={(flash.severity) as ('success'|'error')} delay={flash.delay ?? 5000}>
                        { flash.message }
                    </FlashMessage>
                    <div className="mb-3">
                        Add Games to be tracked:<br />
                        {/* <i className="text-xs break-words">https://www.allkeyshop.com/blog/buy-doom-eternal-cd-key-compare-prices/</i> */}
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aksLinks">AllKeyShop Link(s):</label>
                        <textarea
                            className="shadow appearance-none border border-deep-blue rounded w-full py-2 px-3 text-deep-blue mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id='aksLinks'
                            name='aksLinks'
                            rows={10}
                            placeholder={
                                `You can paste one or multiple links here, one per line.
                                https://www.allkeyshop.com/...\nhttps://www.allkeyshop.com/...`
                            }
                        ></textarea>
                    </div>
                    <div className="flex h-full">
                        <button className="flex w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded" type='submit'>Add Game</button>
                    </div>
                </div>
            </form>
        </>
    )
}