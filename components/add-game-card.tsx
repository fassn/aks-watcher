import Link from "next/link"

export const AddGameCard = () => {
    return (
        <div className="flex justify-center">
            <div className="w-64 h-64 my-10 outline outline-2 shadow shadow-light-grey">
                <button className="flex justify-center items-center w-full h-full">
                    <Link href='/add' passHref={true}>
                        <a className="flex justify-center items-center w-64 h-64">
                            <svg className="h-20 w-20 text-deep-blue"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                            </svg>
                        </a>
                    </Link>
                </button>
            </div>
        </div>
    )
}