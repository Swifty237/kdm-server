import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    year: Number,
    lastNumber: Number,
});

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;