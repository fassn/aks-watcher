import Link from "next/link"

export const Header = () => {
    return (
        <header className="flex w-full fixed top-0 z-50 h-12 items-center bg-deep-blue pl-8 pr-4">
            <h1 className="flex-none text-light-grey justify-center uppercase font-josephin font-bold">
                <Link href='/'>
                    <a>AKS Price Tracker</a>
                </Link>
            </h1>
            <div className="flex w-full justify-end">
                <button className="flex justify-center items-center w-11 h-11">
                    <Link href='/add'>
                        <svg className="h-6 w-6 text-cream"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </Link>
                </button>
            </div>
        </header>
    )
}