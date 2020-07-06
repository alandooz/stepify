const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const app = express()

const portServer = 3000
const portClient = 5500
const portMongoDB = 27017
const dbName = 'Stepify';
const dbCollection = 'items';


app.use(express.json())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", `http://localhost:${portClient}`);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Max-Age", "86400");
  next();
});
app.listen(portServer, () => console.log(`Example app listening at http://localhost:${portServer}`))

app.get('/', async (req, res) => {
  const response = await connectMongo(findElement, dbCollection, {}).then( items => {
    // Change _id from MongoDB to id to match the data structure in the front-end
    items.forEach(element => {
      if (element._id) {
        let id = element._id;
        delete element._id;
        element.id = id;
      }
    });
    return items
  }).catch(error => error)

  res.set('Access-Control-Allow-Origin', '*');
  res.send(response)
})

app.post('/item', async (req, res) => {
  const itemToAdd = req.body

   if (itemToAdd.id) {
    let id = itemToAdd.id;
    delete itemToAdd.id;
    itemToAdd._id = id;
  }

  const response = await connectMongo(addElement, dbCollection, itemToAdd).catch(error => error)
  res.send(response)
})

app.patch('/item', async (req, res) => {
  const itemsToUpdate = req.body
  const response = await connectMongo(updateElements, dbCollection, itemsToUpdate).catch(error => error)
  res.send(response)
})

app.put('/item/:id', async (req, res) => {
  const itemToPut = { idToReplace: { _id: req.params.id }, replaceWith: req.body }
  const response = await connectMongo(replaceElement, dbCollection, itemToPut).catch(error => error)
  res.send(response)
})

app.delete('/item/:id', async (req, res) => {
  const itemToDelete = { _id: req.params.id }
  const response = await connectMongo(deleteElement, dbCollection, itemToDelete).catch(error => error)
  res.send(response)
})

const connectMongo = async (functionToCall, dbCollection, element) => {
  const url = `mongodb://localhost:${portMongoDB}`;
  const client = new MongoClient(url, {useUnifiedTopology: true});

  const response = await client.connect().then(async () => {
    const db = client.db(dbName);
    const functionToCallResponse = await functionToCall(dbCollection, element, db).catch(error => error)
    client.close();
    return functionToCallResponse;
  }).catch(error => error);

  return response;
}

const addElement = async (dbCollection, newElement, db) => {
  const collection = db.collection(dbCollection);
  const added = await collection.insertOne(newElement).then(response => response).catch(error => error);
  return added;
}

const findElement = async (dbCollection, findElement, db) => {
  const collection = db.collection(dbCollection);
  const finded = await collection.find(findElement).toArray().then(response => response).catch(error => error);
  return finded;
}

const deleteElement = async (dbCollection, deleteElement, db) => {
  const collection = db.collection(dbCollection);
  const deleted = await collection.deleteOne(deleteElement).then(response => response).catch(error => error);
  return deleted;
}

const replaceElement = async (dbCollection, replaceElement, db) => {
  const collection = db.collection(dbCollection);
  const replaced = await collection.replaceOne(replaceElement.idToReplace, replaceElement.replaceWith).then(response => response).catch(error => error);
  return replaced;
}

const updateElement = async (dbCollection, updateElement, db) => {
  const collection = db.collection(dbCollection);
  const replaced = await collection.updateOne(updateElement.idToUpdate, updateElement.updateWith).then(response => response).catch(error => error);
  return replaced;
}

const updateElements = async (dbCollection, updateElements) => {

  const updated = await Promise.all(updateElements.map(async (element) => {
    const itemToUpdate = {
      idToUpdate: { _id: element.idToUpdate },
      updateWith: { $set: { index: element.newIndex } },
    }

    const response = await connectMongo(updateElement, dbCollection, itemToUpdate).then(response => response.result).catch(error => error);

    return response;
  }));

  return await updated;
}