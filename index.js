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
        
        // add a new note 
        app.post('/addnote', async(req, res) => {
            const addNoteBody = req.body;
            const result = await notesCollection.insertOne(addNoteBody)
            res.send(result)
        })

        //to get all notes
        app.get('/notes', async(req, res) => {
            const notes = await notesCollection.find({}).sort({_id: -1}).toArray()
            res.send(notes)
        })

        // get single note 
        

        // to delete an note 
        app.delete('/deletenote', async(req, res) => {
            const id = req.query.id;
            console.log(id)
            const query = { _id: new ObjectId(id)}
            const result = await notesCollection.deleteOne(query);
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