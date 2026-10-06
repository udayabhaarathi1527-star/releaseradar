const mongoose = require("mongoose");

const marketplaceProfessionalSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    profilePhoto: { type: String, default: "" },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    category: {
      type: String,
      required: true,
      enum: [
        "Video Editors",
        "Poster Designers",
        "Graphic Designers",
        "Colorists",
        "Sound Designers",
        "VFX Artists",
        "Trailer Editors",
        "Social Media / Promotion Services",
        "Actors",
        "Cinematographers",
        "Writers",
        "Other Film Crew",
      ],
    },
    bio: { type: String, default: "", maxlength: 1200 },
    experience: { type: Number, min: 0, default: 0 },
    skills: [{ type: String, trim: true }],
    portfolio: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
        mediaType: { type: String, enum: ["image", "video"], default: "image" },
        url: { type: String, default: "" },
      },
    ],
    previousProjects: [
      {
        title: { type: String, required: true },
        role: { type: String, default: "" },
        year: { type: Number, default: null },
        description: { type: String, default: "" },
        thumbnail: { type: String, default: "" },
      },
    ],
    location: { type: String, required: true, trim: true },
    languages: [{ type: String, trim: true }],
    price: { type: Number, min: 0, default: 0 },
    priceType: {
      type: String,
      enum: ["project", "day", "hour", "negotiable"],
      default: "project",
    },
    availability: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    reviews: [
      {
        name: { type: String, default: "" },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        text: { type: String, default: "" },
        date: { type: Date, default: Date.now },
      },
    ],
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

marketplaceProfessionalSchema.index({ category: 1, location: 1, availability: 1 });
marketplaceProfessionalSchema.index({ rating: -1, reviewCount: -1 });

module.exports = mongoose.model("MarketplaceProfessional", marketplaceProfessionalSchema);