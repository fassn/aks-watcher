import { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prisma";
import { timeout, updatePrice } from "../shared";

const isValidAuth = (authHeader: string | undefined): boolean => {
    const validUsername = process.env.NEXT_BASIC_AUTH_USERNAME;
    const validPassword = process.env.NEXT_BASIC_AUTH_PASSWORD;

    if (!authHeader) return false;

    const [type, encoded] = authHeader.split(" ");
    if (type !== "Basic") return false;

    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    const [username, password] = decoded.split(":");

    return username === validUsername && password === validPassword;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (!isValidAuth(req.headers.authorization)) {
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", 'Basic realm="Access to the update endpoint", charset="UTF-8"');
        res.end("Unauthorized");
        return;
    }

    const games = await prisma.game.findMany({
        where: {
            userId: { not: null },
        },
        include: {
            prices: true
        }
    })
    for (const game of games) {
        await Promise.all([
            await updatePrice(game),
            timeout(process.env.NEXT_PUBLIC_TIMEOUT_BETWEEN_QUERIES)
        ]);
    }

    return res.status(200).json({ message: "Authorized" });
}