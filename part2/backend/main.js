const { MongoClient } = require("mongodb");
require("dotenv").config();

const username = encodeURIComponent(process.env.dbuser);
const password = encodeURIComponent(process.env.dbpassword);
const cluster = "cluster0.ygc2gib.mongodb.net";

const uri = `mongodb+srv://${username}:${password}@${cluster}/?appName=Cluster0`;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();

    const database = client.db("TaxiCabOnline");
    const collection = database.collection("bookings");

    // ✅ sample booking (for testing)
    const booking = {
      booking_id: "BKG999",
      booking_ref: "REF99999",
      cname: "George Collier",
      phone: "0211234567",
      sbname: "Auckland Airport",
      dsbname: "Sky Tower",
      pickup_date: "2026-05-16",
      pickup_time: "10:30:00",
      status: "unassigned",
    };

    // ✅ insert
    const result = await collection.insertOne(booking);
    console.log("Inserted ID:", result.insertedId);

    // ✅ fetch all bookings from collection "bookings"
    const cursor = collection.find(); 

    await cursor.forEach((doc) => console.log(doc)); // iterate over it and print them all
  } finally {
    await client.close();
  }
}

run().catch(console.dir);