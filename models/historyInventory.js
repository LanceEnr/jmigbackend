const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const historyInventorySchema = new mongoose.Schema(
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
  { collection: "historyInventory" }
);

module.exports = mongoose.model("historyInventory", historyInventorySchema);
