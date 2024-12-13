const express = require('express');
const app = express();

const { MongoClient, ObjectId } = require('mongodb'); 
const mongoURI = "mongodb://localhost:27017";
const client = new MongoClient(mongoURI); 

let port = 3013;

app.use(express.json());

app.listen(port,()=> console.log(`listening on port ${port}`));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); 
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); 

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next(); 
});

app.post('/adView', async(request, response) =>{
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    let user_ip = request.ip;
    console.log(user_ip);
    try{
        const {ad_id, date, user_agent, event_type, article_id} = request.body;

        const newAdEvent = {
            ad_id,
            date: new Date(date),  
            user_ip,
            user_agent,
            event_type,
            article_id: article_id || null  
        };
        const adEvent = await client.db('dailybugle').collection('ad_event').insertOne(newAdEvent);
        response.status(201).send(adEvent);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'An error occurred while sending the ad view.' });
    }
});

app.post('/adClick', async(request, response) =>{
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    let user_ip = request.ip;
    try{
        const {ad_id, date, user_agent, event_type, article_id} = request.body;

        const newAdEvent = {
            ad_id,
            date: new Date(date),  
            user_ip,
            user_agent,
            event_type,
            article_id: article_id || null  
        };
        const adEvent = await client.db('dailybugle').collection('ad_event').insertOne(newAdEvent);
        response.status(201).send(adEvent);
    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'An error occurred while sending the ad view.' });
    }
});