import { useGames } from "lib/hooks"
import { useState } from "react"
import FlashMessage, { Flash } from "./flash-msg"

interface FormData {
    aks_links: { value: string }
}

type GameFormProps = {
    closeModal: () => void
}

export const GameForm = ({ closeModal }: GameFormProps) => {
    const { mutate } = useGames()
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
            setFlash({ message: 'Games are being added. Please wait.', severity: 'info', delay: FLASH_MESSAGE_DELAY })
            fetch('/api/games/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls: links })
            })
            .then(async (res) => {
                if (res.status !== 200) {
                    const error: string = (await res.json())?.error
                    setFlash({ message: error, severity: 'error', delay: FLASH_MESSAGE_DELAY })
                }
                if (res.status === 200) {
                    mutate()
                    closeModal()
                }
            })
            .catch((e) => {
                throw new Error(`There was an issue while storing the games ${e.message}`)
            })
        }

    }

    // Can easily add new patterns if AllKeyShop URLs were to change in the future.
    const baseUrlPattern = 'https:\/\/www\.allkeyshop\.com\/'
    const regexPatterns = [
        baseUrlPattern + 'blog\/buy-[A-Za-z0-9\-]+compare-prices\/?$',
        baseUrlPattern + 'blog\/compare-and-buy-cd-key-for-digital-download-[A-Za-z0-9\-]+\/?$'
    ]
    const pattern = regexPatterns.join('|')

    const validateLinks = (target: EventTarget & FormData) => {
        const links: string[] = target.aks_links.value.trim().split(/\s/)
        if (links[0] === '') {
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
            <form id="add_game_form" onSubmit={handleSubmit} method='dialog'>
                <div className="flex flex-col bg-cream font-josephin px-4 py-4">
                    <FlashMessage id='add_game_flash' severity={(flash.severity) as ('success'|'error')} delay={flash.delay ?? 5000}>
                        { flash.message }
                    </FlashMessage>
                    <div id="add_game_form_desc" className="mb-3">
                        Add Games to be tracked:<br />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="aks_links">AllKeyShop Link(s):</label>
                        <textarea
                            className="shadow appearance-none border border-deep-blue rounded w-full py-2 px-3 text-deep-blue mb-3 leading-tight focus:outline-none focus:shadow-outline"
                            id='aks_links'
                            name='aks_links'
                            rows={10}
                            placeholder={
                                `You can paste one or multiple links here, one per line.
                                https://www.allkeyshop.com/...\nhttps://www.allkeyshop.com/...`
                            }
                        ></textarea>
                    </div>
                    <div className="flex h-full">
                        <button
                            id="add_game_submit"
                            type="submit"
                            className="flex w-full justify-center self-end bg-deep-blue text-cream font-semibold py-2 px-4 border border-blue-500 hover:border-transparent rounded"
                        >
                            Add Game
                        </button>
                    </div>
                </div>
            </form>
        </>
    )
}