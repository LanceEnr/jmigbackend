const mongoose = require("mongoose");

// Define the schema for the 'Item' model
const orderSchema = new mongoose.Schema(
  {
    _orderDet: String,
    _name: String,
    _contactNum: String,
    _status: String,
    _date: String,
    _materialType: String,
    _quantity: Number,
    _price: Number,
    _orderNum: {
      type: Number,
      unique: true,
    },
    _time: String,
  },
  { collection: "order" }
);

module.exports = mongoose.model("Order", orderSchema);
