const { MongoClient } = require("mongodb");
require("dotenv").config();

const username = encodeURIComponent(process.env.dbuser);
const password = encodeURIComponent(process.env.dbpassword);
const appName = encodeURIComponent(process.env.appname);
// console.log("user: ",username," password: ",password);
const cluster = "cluster0.ygc2gib.mongodb.net";

const uri = `mongodb+srv://${username}:${password}@${cluster}/?appName=${appName}`;

const client = new MongoClient(uri);

let db;

async function connectDB() {
  await client.connect();
  db = client.db("TaxiCabOnline");
  console.log("✅ Connected to MongoDB");
  return db;
}

function getDB() {
  if (!db) throw new Error("DB not initialized");
  return db;
}

module.exports = { connectDB, getDB, client };