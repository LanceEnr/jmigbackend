const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const valuesSchema = new mongoose.Schema(
  {
    _valueHeading1: String,
    _valueSubheading1: String,
    _valueHeading2: String,
    _valueSubheading2: String,
    _valueHeading3: String,
    _valueSubheading3: String,
  },
  { collection: "values" }
);

module.exports = mongoose.model("Values", valuesSchema);
