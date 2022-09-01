const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create Schema
const Audit = new Schema({
  user: mongoose.SchemaTypes.Mixed,
  method: String,
  url: String,
  params: mongoose.SchemaTypes.Mixed,
  query: mongoose.SchemaTypes.Mixed,
  body: mongoose.SchemaTypes.Mixed,
  statusCode: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("audit", Audit);
