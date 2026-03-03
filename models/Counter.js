const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
    year: Number,
    lastNumber: Number,
});

const Counter = mongoose.model("Counter", counterSchema);
module.exports = Counter;