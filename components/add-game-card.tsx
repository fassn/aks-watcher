import Link from "next/link"

export const AddGameCard = () => {
    return (
        <div className="flex justify-center">
            <div className="w-64 h-120 mx-5 my-10 outline outline-2 shadow shadow-light-grey">
                <button name="add_game">
                    <Link href='/add' className="flex justify-center items-center w-64 h-120">
                        <svg className="h-20 w-20 text-deep-blue"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                        </svg>
                    </Link>
                </button>
            </div>
        </div>
    )
}