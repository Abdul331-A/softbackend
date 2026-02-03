import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        otp: { type: String }, // Add this field

        username: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },


        location: {
            type: String,
            trim: true
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 300
        },

        category: {
            mainCategory: {
                type: String,
                trim: true
            },
            subCategory: {
                type: String,
                trim: true
            }
        },

        profilePic: {
            type: String,
            default: ""
        },

        password: {
            type: String
        },

        isOtpVerified: {
            type: Boolean,
            default: false
        },

        isPasswordCreated: {
            type: Boolean,
            default: false
        },
        followers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },

    { timestamps: true }
);

export default mongoose.model("User", userSchema);
