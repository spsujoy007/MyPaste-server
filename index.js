const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6ke0m0t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// middleware
app.use(cors())
app.use(express.json())

async function run () {
    try{
        const notesCollection = client.db('MyPaste').collection('notes');
        const pinNotesCollection = client.db('MyPaste').collection('pinNotes');
        
        // add a new note 
        app.post('/addnote', async(req, res) => {
            const addNoteBody = req.body;
            const result = await notesCollection.insertOne(addNoteBody)
            res.send(result)
        })

        //to get all notes
        app.get('/notes', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const notes = await notesCollection.find(query).sort({_id: -1}).toArray()
            res.send(notes)
        })

        // get single note 
        app.get('/note/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await notesCollection.findOne(query);
            res.send(result)
        })

        // to delete an note 
        app.delete('/deletenote', async(req, res) => {
            const id = req.query.id;
            const query = { _id: new ObjectId(id)}
            const result = await notesCollection.deleteOne(query);
            res.send(result)
        })

        // to pin a note 
        app.put('/pin', async(req, res) => {
            const id = req.query.id;
            console.log(id)
            const filter = { _id: new ObjectId(id) }
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    pinned: true
                }
            }
            const result = await notesCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        // get all pin notes
        app.get('/pinnotes', async(req, res) => {
            const email = req.query.email;
            const filterEmail = {email: email, pinned: true}
            const result = await notesCollection.find(filterEmail).toArray()
            res.send(result)
        })

        // un pin a note
        app.put('/removePin', async(req, res) => {
            const id = req.query.id;
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            const updatedDoc = {
                $set: {
                    pinned: false
                }
            }
            const result = await notesCollection.updateOne(filter, updatedDoc, options)
            res.send(result)
        })

        app.put('/copiedCount', async(req, res) => {
            const id = req.query.id;
            const filter = {_id: new ObjectId(id)}
            const options = {upsert: true}
            
            const mynote = await notesCollection.findOne(filter);
            const previousCopyCount = mynote.copied_count;

            const updatedDoc = {
                $set: {
                    copied_count: previousCopyCount + 1
                }
            }
            const result = await notesCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })


    }
    finally{

    }
}
run().catch(e => console.error(e))

app.get('/', (req, res) => {
  res.send('MyPaste Server. warning: do not miss use this')
})

app.listen(port, () => {
  console.log(`MyPaste app listening on port ${port}`)
})