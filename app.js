const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express()
const port = 3000

app.use(express.json())
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5500");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

app.get('/', async (req, res) => {
  const response = await connectMongo(findElement, 'items', {}).then( items => {
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

  const response = await connectMongo(addElement, 'items', itemToAdd).catch(error => error)
  res.send(response)
})

app.patch('/item', async (req, res) => {
  const itemsToUpdate = req.body

  const response = await connectMongo(updateElements, 'items', itemsToUpdate).catch(error => error)
  res.send(response)
})

app.put('/item/:id', async (req, res) => {
  const itemToPut = { idToReplace: { _id: req.params.id }, replaceWith: req.body }
  const response = await connectMongo(replaceElement, 'items', itemToPut).catch(error => error)
  res.send(response)
})

app.delete('/item/:id', async (req, res) => {
  const itemToDelete = { _id: req.params.id }
  const response = await connectMongo(deleteElement, 'items', itemToDelete).catch(error => error)
  res.send(response)
})

app.get('/image/:id', async (req, res) => {
  const imageToFind = { _id: req.params.id}
  const response = await connectMongo(findElement, 'images', imageToFind).catch(error => error)
  res.send(response)
})

app.put('/image/:id', async (req, res) => {
  const imageToPut = { idToReplace: { _id: req.params.id }, replaceWith: req.body }
  const response = await connectMongo(replaceElement, 'images', imageToPut).catch(error => error)
  res.send(response)
})

app.delete('/image/:id', async (req, res) => {
  const imageToDelete = { _id: req.params.id }
  const response = await connectMongo(deleteElement, 'images', imageToDelete).catch(error => error)
  res.send(response)
})

const connectMongo = async (functionToCall, dbCollection, element) => {
  const url = 'mongodb://localhost:27017';
  const dbName = 'Stepify';
  const client = new MongoClient(url);

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