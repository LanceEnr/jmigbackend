const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const aboutSchema = new mongoose.Schema(
  {
    _mission: String,
    _vision: String,
    image1: String,
    image2: String,
  },
  { collection: "about" }
);

module.exports = mongoose.model("About", aboutSchema);
