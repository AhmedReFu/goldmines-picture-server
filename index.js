const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken')
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

// use middleware
app.use(cors())
app.use(express.json());

//verify


// connect mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qil1a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unAuthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}
async function run() {
    try {
        await client.connect();
        const moviesCollection = client.db("goldmines").collection("movies");
        const userCollection = client.db("goldmines").collection("users");

        console.log('db connected');

        app.get('/movies', async (req, res) => {
            const query = {};
            const cursor = moviesCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })

        app.get('/search/', async (req, res) => {
            const search = req.query.search
            const cursor = moviesCollection.find({ name: { $regex: search } });
            const movie = await cursor.toArray();
            res.send(movie);
        });

        app.get('/movies/category/:category', async (req, res) => {
            const category = req.params.category;
            const query = { Language: category };
            const result = moviesCollection.find(query);
            const users = await result.toArray();
            res.send(users);
        });


        app.get('/movies/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await moviesCollection.findOne(query);
            res.send(result);
        });

        app.delete('/movies/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await moviesCollection.deleteOne(filter);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to Goldmines Picture 2022')
})

app.listen(port, () => {
    console.log("Listening to port", port)
})