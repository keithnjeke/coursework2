const express = require('express');
const app = express();
const ObjectID = require('mongodb').ObjectId;
const cors = require('cors');
var path = require("path");
var fs = require("fs");
app.use(cors());
app.use(express.json());

const MongoClient = require('mongodb').MongoClient;

let db;

const mongodbUser = '';
const mongodbPassword = '';
const mongodbDatabase = '';

MongoClient.connect("mongodb+srv://keithnjeke:njekstar420!@cluster0.9fwow.mongodb.net/test", (error, client) => {
    db = client.db("webstore");
    console.log("database connected");
})

app.param('collectionName', (request, response, next, collectionName) => {
    request.collection = db.collection(collectionName)
    return next()
})

app.use(function (request, response, next) {
    console.log('Request IP: ' + request.url)
    console.log('Request date: ' + new Date())
    next()
})

app.use('/static', function (request, response, next) {

    var filePath = path.join(__dirname, "static", request.url);

    fs.stat(filePath, function (error, fileInfo) {
        if (error) {
            next();
            return;
        }
        if (fileInfo.isFile()) response.sendFile(filePath);
        else next();
    });
});

app.get('/images', (request, response, next) => {
        var filePath = path.join(__dirname, "static", request.url);

    fs.stat(filePath, function (error, fileInfo) {
        if (error) {
            next();
            return;
        }
        if (fileInfo.isFile()) response.sendFile(filePath);
        else next();
    });
    
    response.send(filePath)
})

app.get('/', (request, response, next) => {
    response.send('Welcome to express server!')
})

app.get('/collection/:collectionName', (request, response, next) => {
    request.collection.find({}).toArray((error, results) => {
        if (error) return next(error)
        response.send(results)
    })
})

app.post('/collection/:collectionName', (request, response, next) => {
    request.collection.insert(request.body, (error, results) => {
        if (error) return next(error)
        response.send(results)
    })
})

app.put('/collection/:collectionName/:id', (request, response, next) => {
    request.collection.update(
        { _id: new ObjectID(request.params.id) },
        { $set: request.body },
        { safe: true, multi: false },
        (error, result) => {
            if (error) return next(error)
            response.send(result.acknowledged == true ? {msg: 'success'} : {msg: 'error'})
        })
})

app.get('/search/:collectionName/:searchItem', (request, response, next) => {

    request.collection.aggregate(

        [{
            $search: {
                index: 'autoCompleteProducts',
                compound: {
                    should: [
                        {
                            "autocomplete": {
                                query: request.params.searchItem,
                                path: 'topic',
                                "tokenOrder": "sequential"
                            },
                        },
                        {
                            "autocomplete": {
                                query: request.params.searchItem,
                                path: 'location',
                                "tokenOrder": "sequential"
                            },
                        },
                    ],
                },
            },
        }]

    ).toArray((error, results) => {
        if (error) return next(error)
        response.send(results)
    })
})

app.listen(process.env.PORT || 3000, ()=> {
    console.log("app running");
});