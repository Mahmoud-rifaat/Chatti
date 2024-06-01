const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./models/User');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

dotenv.config();
const app = express();

const mongoURL = process.env.MONGO_URL;
const clientURL = process.env.CLIENT_URL;
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
mongoose.connect(mongoURL).catch(err => console.log(err)
);

// app configuration
app.use(cors({
    credentials: true,
    origin: clientURL
}));
app.use(express.json()); // Parses body, not working on cookies
app.use(cookieParser());

app.get('/test', (req, res) => {
    res.json('ok!')
})


app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwtSecret, {}, (err, userData) => {
            if (err) res.json(err.message);
            res.json(userData);
        });
    }
    else {
        res.status(401).json('No token!');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            jwt.sign({ userId: foundUser._id, username: foundUser.username }, jwtSecret, {}, (err, token) => {
                if (err) res.json(err.message);
                res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true }).status(201).json({ id: createdUser._id });
            })
        }
    }
})

app.post('/logout', (req, res) => {
    res.cookie('token', '', { sameSite: 'none', secure: true }).json('ok');
})

app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser = await User.create({
            username,
            password: hashedPassword
        });
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure: true }).status(201).json({ id: createdUser._id });
        });
    } catch (err) {
        res.status(400).json('User creation failed!')
        // throw err;
    }
})

app.listen(4000, (err) => {
    if (err) console.log(err);
    console.log('Server listening on port: ', process.env.API_PORT)
})