const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const listingSchema = new mongoose.Schema(
  {
    _listingID: {
      type: Number,
      unique: true,
    },
    _listingName: String,
    _listingCategory: String,
    _listingPrice: Number,
    _listingDescription: String,
    _isPublished: Boolean,
    _imgPath: [String],
  },
  { collection: "listings" }
);

module.exports = mongoose.model("Listing", listingSchema);
