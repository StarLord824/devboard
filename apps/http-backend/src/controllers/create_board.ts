import { boardSchema } from "@devboard/common/types";
import { createBoard, getBoard } from "../services/db";   
import { Request, Response } from "express";    

export default async (req: Request, res: Response) => {
    const { slug, admin } = req.body;
    const parsedBody = boardSchema.safeParse(req.body);
    if(!parsedBody.success){
        res.status(400).send('Invalid request body');
        return;
    }
    const existingBoard = await getBoard(slug);
    if(existingBoard){
        res.status(400).send('Board with this slug already exists, try another');
        return;
    }
    const newBoard = await createBoard({
        slug,
        admin,  
        participants: [],
        chats: [],
    })
    res.status(200).send({newBoard});
}