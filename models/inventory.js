const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const inventorySchema = new mongoose.Schema(
  {
    _inventoryID: {
      type: Number,
      unique: true,
    },
    _itemName: String,
    _quantity: String,
    _location: String,
    _lastUpdated: String,
    _status: String,
  },
  { collection: "inventory" }
);

module.exports = mongoose.model("Inventory", inventorySchema);
