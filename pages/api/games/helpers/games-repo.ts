import { URL } from 'url';
import { Game } from './game';

const fsp = require('fs').promises

export const gamesRepo = {
    getAll,
    getById,
    getNameFromUrl,
    create,
    update,
    delete: _delete
};

async function getAll(): Promise<Game[]> {
    const file_data = await fsp.readFile(`${process.cwd()}/data/games.json`)
    return JSON.parse(file_data)
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
    games = games.filter((game: Game) => game.id !== id);
    saveData(games);
}

// private helper functions

async function saveData(games: Game[]) {
    await fsp.writeFile(`${process.cwd()}/data/games.json`, JSON.stringify(games, null, 4));
}