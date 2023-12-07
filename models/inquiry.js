const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const inquirySchema = new mongoose.Schema(
  {
    _name: String,
    _email: String,
    _message: String,
    _inquiryID: String,
    _date: String,
  },
  { collection: "inquiry" }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
