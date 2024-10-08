import Link from "next/link"
import SignIn from "./signin"
import { AddGameButton } from "./add-game-button"

export const Header = () => {

    return (
        <header className="flex w-full fixed top-0 z-50 h-12 items-center bg-deep-blue dark:bg-slate-300 pl-8 pr-4">
            <div className="flex-none hidden md:flex text-light-grey dark:text-deep-blue justify-center uppercase font-josephin font-bold">
                <Link href='/' data-cy='homepage_link'>
                    AKS Price Tracker
                </Link>
            </div>
            <span className="flex-none hidden md:flex text-light-grey dark:text-deep-blue mx-6 pb-1">|</span>
            <div className="flex-none text-light-grey dark:text-deep-blue justify-center font-josephin font-bold">
                <SignIn />
            </div>
            <AddGameButton />
        </header>
    )
}