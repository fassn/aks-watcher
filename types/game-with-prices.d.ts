import { Game, Price } from "@prisma/client";

export type GameWithPrices = Game & { prices: Price[] }