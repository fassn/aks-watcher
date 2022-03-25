import { writeFileSync } from 'fs';
import { URL } from 'url';
import data from '../../../data/games.json'
import { Game } from './game';

let games: Game[] = data

export const gamesRepo = {
    getAll: () => games,
    getById: (id: number) => games.find((game: Game) => game.id === id),
    // getByUrl: (url: URL) => games.find((game: Game) => game.url === url),
    getNameFromUrl,
    find: (x: any) => games.find(x),
    create,
    update,
    delete: _delete
};

function getNameFromUrl(url: string): string {
    const splittedUrl = new URL(url).pathname.split('-')
    return splittedUrl.slice(1, splittedUrl.length - 4).join(' ').toUpperCase()
}

function create(game: any) {
    // generate new game id
    game.id = games.length ? Math.max(...games.map((game: Game) => game.id)) + 1 : 1;

    // set date created and updated
    game.dateCreated = new Date().toISOString()
    game.dateUpdated = new Date().toISOString()

    // add and save game
    games.push(game);
    saveData();
}

function update(id: number, params: any) {
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
    saveData();
}

// prefixed with underscore '_' because 'delete' is a reserved word in javascript
function _delete(id: number) {
    // filter out deleted game and save
    games.filter((game: Game) => game.id !== id);
    saveData();
}

// private helper functions

function saveData() {
    writeFileSync('data/games.json', JSON.stringify(games, null, 4));
}