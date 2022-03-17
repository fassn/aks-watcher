function onSubmit() {
    //
}

export const GameForm = () => {
    return (
        <form onSubmit={onSubmit}>
            <input
                type="text"
                placeholder="https://www.allkeyshop.com/blog/buy-..."
            >
            </input>

            <button type="submit">Add Game</button>
        </form>
    )
}