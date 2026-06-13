const { client, getDB } = require("../db/mongo");

async function getNextBookingRef() {
  const counter = await client
    .db("TaxiCabOnline")
    .collection("counters")
    .findOneAndUpdate(
      { _id: "booking_ref" },
      { $inc: { seq: 1 } },
      {
        upsert: true,
        returnDocument: "false"
      }
    );

  if (!counter || !counter.seq) {
    console.log(client.db);
    console.log(counter.value, "counter:",counter);
    throw new Error("Counter not initialized properly");
  }
  const num = counter.seq;

  return `BRN${String(num).padStart(5, "0")}`;
}

module.exports = { getNextBookingRef };