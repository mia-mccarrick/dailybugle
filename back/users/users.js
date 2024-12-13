const express = require('express');
const app = express();

const { MongoClient } = require('mongodb'); 
const mongoURI = "mongodb://localhost:27017";  
const client = new MongoClient(mongoURI); 

let port = 3010;

app.use(express.json());

app.listen(port, ()=> console.log(`listening on port ${port}`));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next(); 
});

//GET USERS
app.get('/', async (request, response) =>{
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    try{
        await client.connect();
        await client.db('dailybugle').collection('users')
        .find()
        .toArray()
        .then(results =>{
            response.send(results);
        }).catch(error => console.error(error));
    } catch(error){
        console.error(error);
    }finally{
        client.close();
    }
});

//SEND USER INFO
app.post('/', async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { username, password } = request.body;

    try {
        await client.connect();
        const user = await client.db('dailybugle').collection('users').findOne({ username });

        if (user && user.password === password) { 
            response.cookie('sessionId', user._id, { httpOnly: true, maxAge: 3600000 }); 

            response.status(200).json({ message: 'Login successful', role: user.role });
        } else {
            response.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ message: 'Internal server error' });
    } finally {
        client.close();
    }
});
