// models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
    },
    userFirstname: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
    },
    login: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Génère automatiquement le login avant la sauvegarde
userSchema.pre("validate", function (next) {
    if (!this.login && this.userName) {
        this.login = `${this.userName.toLowerCase()}`;
    }
    next();
});

// Hash automatique du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
