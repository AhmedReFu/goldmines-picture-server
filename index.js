const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

// use middleware
app.use(cors())
app.use(express.json());

// connect mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qil1a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        await client.connect();
        const moviesCollection = client.db("goldmines").collection("movies");
        console.log('db connected');

        app.get('/movies', async (req, res) => {
            const query = {};
            const cursor = moviesCollection.find(query);
            const users = await cursor.toArray();
            res.send(users);
        });

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


        app.get('/movies/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await moviesCollection.findOne(query);
            res.send(result);
        });
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