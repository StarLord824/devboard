import { Router } from "express";
import { authMiddleware } from "./middlewares";

import signup from "./controllers/signup";
import signin from "./controllers/signin";
import get_board from "./controllers/get_board";
import get_chats from "./controllers/get_chats";
import create_board from "./controllers/create_board";

const router : Router = Router();

router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : api/v1${req.url}`);
});

router.post('/signup', async (req, res) => {
    signup(req, res);
});
 
router.post('/login', async (req, res) => {
    signin(req, res);
});

router.post('/create-board', authMiddleware, async (req, res) => {
    create_board(req, res);
});

router.get('/boards/:slug', authMiddleware, async (req, res) => {
    const {slug} = req.params;
    if(!slug) {
        res.status(400).send('Board slug is required');
        return;
    }
    get_board(req, res, slug);
});

router.get('/chats/:slug', authMiddleware, async (req, res) => {
    const {slug} = req.params;
    if(!slug) {
        res.status(400).send('Board slug is required');
        return;
    }
    get_chats(req, res, slug);
});

export default router;