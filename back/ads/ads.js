const express = require('express');
const app = express();

const { MongoClient } = require('mongodb'); 
const mongoURI = "mongodb://localhost:27017";
const client = new MongoClient(mongoURI); 

let port = 3012;

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

//GET ADS
app.get('/', async (request, response) =>{
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    try{
        await client.connect();
        await client.db('dailybugle').collection('ads')
        .find()
        .toArray()
        .then(results =>{
            response.send(results);
            console.log(results);
        }).catch(error => console.error(error));
    } catch(error){
        console.error(error);
    }finally{
        client.close();
    }
});

