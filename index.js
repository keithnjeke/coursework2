const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const app = express();
const port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;

const url = "mongodb+srv://keithnjeke:njekstar420!@cluster0.9fwow.mongodb.net/?retryWrites=true&w=majority";
// Database Name
const dbName = 'After-School';
// Connect using MongoClient
const mongoClient = new MongoClient(url);
const client = mongoClient.connect()

const db = client.then((a,b)=>{
    return a.db(dbName)
})

// MIDDLEWARES
// use Parser Middleware
app.use(express.json());

//connection of the mongoclient
// use Logger middleware
app.use(function (req, res, next) {
  console.log("Request IP: " + req.url);
  console.log("Request date: " + new Date());
  return next();
});

// use param middleware
app.param("collectionName", function (req, res, next, collectionName) {
  req.collection = db.collection(collectionName);
  return next();
});

// use static file middleware
app.use(function (req, res, next) {
  const filePath = path.join(__dirname, "static", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) return next();
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

// CORS allows you to configure the web API's security.
// It has to do with allowing other domains to make requests against your web API.
app.use(cors());


// Endpoint to get user (from group CW)
app.get("/user", async function (req, res, next) {
  res.json({ email: "user@email.com", password: "mypassword" });
  if (e) return next(e);
});

// Endpoint to get all lessons
app.get("/collection/:collectionName", async function (req, res, next) {
  await req.collection.find().toArray((e, results) => {
    if (e) return next(e);
    res.json(results);
  });
});

// Endpoint to add an order
app.post("/collection/:collectionName", async function (req, res, next) {
  await req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.status(201).send(results);
  });
});

// Endpoint to update number of available spaces in lesson
app.put("/collection/:collectionName/:id", async function (req, res, next) {
  await req.collection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { space: req.body.space } },
    (e, results) => {
      res.json(results);
      if (e) return next(e);
    }
  );
});

// Endpoint to perform a Full Text Search on lessons
app.get("/search/:collectionName", async function (req, res, next) {
  await req.collection
    .find({ $text: { $search: req.query.query } })
    .toArray((err, results) => {
      res.json(results);
      if (err) return next(err);
    });
});

// Listen to port
app.listen(port, function () {
  console.log(`Server running at http://localhost:${port}`);
});
