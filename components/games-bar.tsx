import { useState } from "react"
import { DeleteAll } from "./delete-all"
import FlashMessage, { Flash } from "./flash-msg"
import { RefreshAll } from "./refresh-all"
import { SortGames } from "./sort-games"

export const GamesBar = () => {
    const [flash, setFlash] = useState<Flash>({})

    return (
        <div className="flex border-solid border-deep-blue border-b-2 py-2">
            <div className="flex font-josephin">
                <SortGames />
            </div>
            {/* <RefreshAll setFlash={setFlash}/> */}
            <div className="flex min-w-fit">
                <FlashMessage id='main_flash' severity={(flash.severity) as ('success' | 'info' | 'error')} delay={flash.delay ?? 5000}>
                    {flash.message}
                </FlashMessage>
            </div>
            <DeleteAll setFlash={setFlash} />
        </div>
    )
}