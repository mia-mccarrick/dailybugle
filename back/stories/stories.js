const express = require('express');
const app = express();

const { MongoClient, ObjectId } = require('mongodb'); 
const mongoURI = "mongodb://localhost:27017/";
const client = new MongoClient(mongoURI); 

let port = 3011;

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

app.get('/stories', async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*'); 
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    const { story, search } = request.query;  
    try {
        await client.connect();
        const storiesCollection = await client.db('dailybugle').collection('stories');

        if (story) {
            const storyData = await storiesCollection.findOne({ _id: new ObjectId(story) });

            if (storyData) {
                response.json(storyData);
            } else {
                response.status(404).json({ error: 'Story not found' });
            }
        } else {
            if (search) {
                const stories = await storiesCollection.find({
                    $text: { $search: search }
                }).sort({ date_created: -1 }).toArray();

                response.json(stories);
            } else {
                const stories = await storiesCollection.find().sort({ date_created: -1 }).toArray();
                response.json(stories);
            }
        }
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: 'Failed to fetch stories' });
    } finally {
        client.close();
    }
});

app.post('/stories', async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    console.log(request.body);
    const { _id, title, teaser, body, image, category, comment } = request.body;


    try {
        await client.connect();
        const storiesCollection = await client.db('dailybugle').collection('stories');

        const setFields = {};
        if (title) setFields.title = title;
        if (teaser) setFields.teaser = teaser;
        if (body) setFields.body = body;
        if (image) setFields.image = image;
        if (category) setFields.category = category.split(',').map(category => category.trim());

        if (Object.keys(setFields).length > 0 || comment) {
            setFields.date_edited = new Date();
        }


        if (Object.keys(setFields).length > 0) {
            await storiesCollection.updateOne(
                { _id: new ObjectId(_id) },  
                { $set: setFields }          
            );
        }

        if (comment) {
            await storiesCollection.updateOne(
                { _id: new ObjectId(_id) },  
                { $push: { comments: comment } }  
            );
        }

        const updatedStory = await storiesCollection.findOne({ _id: new ObjectId(_id) });
        response.status(200).send(updatedStory);

    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'An error occurred while updating the story.' });
    } finally {
        client.close();
    }
});

//NEW STORY
app.post('/newStory', async (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    const { title, teaser, body, image, categories } = request.body;

    if (!title || !teaser || !body || !categories) {
        return response.status(400).send({ error: 'Missing required fields' });
    }

    try {
        await client.connect();
        const storiesCollection = await client.db('dailybugle').collection('stories');

        const storyData = {
            title, 
            teaser, 
            body, 
            image: image || null,  
            categories, 
            date_created: new Date(),  
            date_edited: new Date()   
        };

        const result = await storiesCollection.insertOne(storyData);

        const newStory = await storiesCollection.findOne({ _id: result.insertedId });
        response.status(201).send(newStory);

    } catch (error) {
        console.error(error);
        response.status(500).send({ error: 'An error occurred while creating the story.' });
    } finally {
        client.close();
    }
});
