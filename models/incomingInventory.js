const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const incomingInventorySchema = new mongoose.Schema(
  {
    _orderDet: String,
    _name: String,
    _date: String,
    _materialType: String,
    _location: String,
    _quantity: Number,
    _inventoryID: {
      type: Number,
      unique: true,
    },
  },
  { collection: "incomingInventory" }
);

module.exports = mongoose.model("incomingInventory", incomingInventorySchema);
