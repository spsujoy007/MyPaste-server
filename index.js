const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000
require('dotenv').config()

// PORT: https://mypaste.vercel.app/ 


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.6ke0m0t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// middleware
app.use(cors())
app.use(express.json())

const warning_info = {
    "error": "not a valid user", 
    "warning": "Do not use mypaste api without our permission!", 
    "owner-info": {
        "Phone": "01859342364",
        "Whatsapp": "01859342364",
        "Facebook": "https://www.facebook.com/spsujoy07"
    }
}

async function run () {
    try{
        // const notesCollection = client.db('MyPaste').collection('notes');
        const notesCollection = client.db('MyPaste').collection('mynotes');
        const pinNotesCollection = client.db('MyPaste').collection('pinNotes');
        
        // add a new note 
        app.post('/addnote', async(req, res) => {
            const addNoteBody = req.body;
            const result = await notesCollection.insertOne(addNoteBody)
            res.send(result)
        }) 

        app.post('/editnote', async (req, res) => {
            const id = req.query.id;
            const modifiedNote = req.body;
            const filter = {_id: new ObjectId(id)};
            const option = {upsert: true}
            const updatedDoc = {
                $set: {
                    title: modifiedNote.title,
                    note: modifiedNote.note
                }
            }
            const result = await notesCollection.updateOne(filter, updatedDoc, option)
            res.send(result)
        })

        //to get all notes of one account
        app.get('/notes', async(req, res) => {
            const email = req.query.email;
            const useruid = req.query.uid;
            const query = {email: email}
            const sortingdata = {_id: -1, "copied_count": -1}
            const notes = await notesCollection.find(query).sort({ _id: -1}).toArray()
            if(useruid)
            {
                res.send(notes)
            }
            else{
                res.json(warning_info);
            }
        })
        app.get('/sortednotes', async(req, res) => {
            const email = req.query.email;
            const useruid = req.query.uid;
            const query = {email: email}
            const sortingdata = {_id: -1, "copied_count": -1}
            const notes = await notesCollection.find(query).sort({copied_count: -1}).toArray()
            if(useruid)
            {
                res.send(notes)
            }
            else{
                res.json(warning_info);
            }
        })

        //to get all notes 
        app.get('/allnotes', async(req, res) => {
            const useruid = req.query.uid;
            const query = {}
            const notes = await notesCollection.find(query).toArray()
            if(useruid)
            {
                res.send(notes)
            }
            else{
                res.json(warning_info)
            }
        })

        //get the highest noter
        // app.get('/highestnoter', async(req, res) => {
        //     const useruid = req.query.uid;
        //     const query = {}
        //     const notes = await notesCollection.find(query).toArray()
        //     if(useruid)
        //     {
        //         res.send(notes)
        //     }
        //     else{
        //         res.json(warning_info)
        //     }
        // })

        // get single note 
        app.get('/note/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await notesCollection.findOne(query);
            res.send(result)
        })

        // get single note for only same page
        app.get('/singlenote', async(req, res) => {
            const id = req.query.id;
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