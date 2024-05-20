const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const User = require('./models/User');

dotenv.config();
const app = express();

const mongoURL = process.env.MONGO_URL;
const clientURL = process.env.CLIENT_URL;
const jwtSecret = process.env.JWT_SECRET;
mongoose.connect(mongoURL).catch(err => console.log(err)
);

// app configuration
app.use(cors({
    credentials: true,
    origin: clientURL
}));
app.use(bodyParser.json());


app.get('/test', (req, res) => {
    res.json('ok!')
})

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const createdUser = await User.create({ username, password });
        jwt.sign({ userId: createdUser._id }, jwtSecret, {}, (err, token) => {
            if (err) throw err;
            res.cookie('token', token).status(201).json({ id: createdUser._id });
        });
    } catch (err) {
        res.status(400).json('User creation failed!')
        throw err;
    }
})

app.listen(4000, (err) => {
    if (err) console.log(err);
    console.log('Server listening on port: ', process.env.API_PORT)
})