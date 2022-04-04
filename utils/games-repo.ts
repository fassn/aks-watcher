import { URL } from 'url';
import { Game } from './game';
import { promises as fsp } from 'fs';
import { join } from 'path';

const jsonStorageUrl = process.env.JSONSTORAGE_URL as string
const jsonStorageId = process.env.JSONSTORAGE_ID

const gamesRepo = {
    getAll,
    getById,
    getNameFromUrl,
    create,
    update,
    delete: _delete
};

async function getAll(): Promise<Game[]> {
    let games: Game[] = []
    if (!jsonStorageId) {
        console.log('No JSONStorage ID was provided. Please provide one in your .env file.')
    } else {
        const res = await fetch(join(jsonStorageUrl, jsonStorageId))
        games = await res.json()
    }
    return games
}

async function getById(id: number): Promise<Game | undefined> {
    const games = await getAll()
    const game = games.find((game: Game) => game.id === id)

    return game
}

function getNameFromUrl(url: string): string {
    const splittedUrl = new URL(url).pathname.split('-')
    return splittedUrl.slice(1, splittedUrl.length - 4).join(' ').toUpperCase()
}

async function create(game: any) {
    const games = await getAll()

    // generate new game id
    game.id = games.length ? Math.max(...games.map((game: Game) => game.id)) + 1 : 1;

    // set date created and updated
    game.dateCreated = new Date().toISOString()
    game.dateUpdated = new Date().toISOString()

    // add and save game
    games.push(game);
    saveData(games);
    return games
}

async function update(id: number, params: any): Promise<Game | undefined> {
    let games = await getAll()

    let game = games.find((game: Game) => game.id === id)
    if (!game) {
        console.warn(`Nothing updated as the game with the id ${id} wasn't found.`)
        return
    }

    // set date updated
    game.dateUpdated = new Date().toISOString()

    // update and save
    const updatedGame: Game = {...game, ...params}
    games = games.map((game: Game) => {
        if (game.id === updatedGame.id) game = {...updatedGame}
        return game
    })

    saveData(games);
    return updatedGame
}

// prefixed with underscore '_' because 'delete' is a reserved word in javascript
async function _delete(id: number) {
    let games = await getAll()

    // filter out deleted game and save
    const deletedGame = games.filter((game: Game) => game.id === id)
    games = games.filter((game: Game) => game.id !== id);
    saveData(games);
    return deletedGame
}

async function saveData(games: Game[]) {
    if (!jsonStorageId) {
        console.log('No JSONStorage ID was provided. Please provide one in your .env file.')
    } else {
        await fetch(join(jsonStorageUrl, jsonStorageId), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(games),
        })
    }
}

export default gamesRepo