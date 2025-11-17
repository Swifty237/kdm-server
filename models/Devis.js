import mongoose from "mongoose";

const devisSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        entreprise: { type: String },
        telephone: { type: String },
        service: { type: String, required: true },
        date: { type: String },
        departure: {
            surface: String,
            volume: String,
            rooms: String,
            floor: String,
            elevator: Boolean,
            elevatorSize: String,
            stairsSize: String,
            address: String,
        },
        arrival: {
            floor: String,
            elevator: Boolean,
            elevatorSize: String,
            stairsSize: String,
            address: String,
            contactName: String,
            entreprise: String,
            date: String,
        },
        archived: { type: Boolean }
    },
    { timestamps: true }
);

const Devis = mongoose.model("Devis", devisSchema);
export default Devis;
