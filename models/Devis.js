import mongoose from "mongoose";

const devisSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true },
        entreprise: { type: String },
        telephone: { type: String, required: true },
        service: { type: String, required: true },
        offer: { type: String },
        billingAddress: { type: String, required: true },
        devisNumber: { type: String, required: true },
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
            telContact: String,
            entreprise: String,
            date: String,
        },
        archived: { type: Boolean, default: false },
        message: { type: String },
    },
    { timestamps: true }
);

const Devis = mongoose.model("Devis", devisSchema);
export default Devis;
