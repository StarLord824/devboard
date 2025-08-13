import { Router } from "express";
import { authMiddleware } from "./middlewares";
import signup from "./controllers/signup";
import signin from "./controllers/signin";
import create_board from "./controllers/create_board";
import get_board from "./controllers/get_board";

const router : Router = Router();

router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
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

router.get('/boards', authMiddleware, async (req, res) => {
    get_board(req, res);
});

export default router;