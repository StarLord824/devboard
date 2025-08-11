import { Router } from "express";
// import {prisma} from "@devboard/db"

const router : Router = Router();

router.get('/', (req, res) => {
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

router.post('signup', (req, res) => {
    const { username, name, email, password } = req.body;
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

router.post('login', (req, res) => {
    const { username, password } = req.body;
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});


//auth middleware
router.use( (req, res, next) => {
    const token = req.headers['x-auth-token'];
    if (!token) {
        return res.status(401).send('Unauthorized');
    }
    next();
});

router.get('create-board', (req, res) => {
    const { username, password } = req.body;
    res.status(200).send(`This is devboard backend, route : ${req.url}`);
});

export default router;