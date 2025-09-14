import { Response, Request } from "express";
import { getBoard } from "../services/db";

export default async (req: Request, res: Response, slug: string) => {
    const {adminId} = req.body;
    const board = await getBoard(slug);
    if(!board) {
        res.status(404).send('Board not found');
        return;
    }
    if(board.adminId !== adminId) {
        res.status(403).send('You are not the admin of this board');
        return;
    }
    res.status(200).send({board});
}