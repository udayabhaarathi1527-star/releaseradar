const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    organizer: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, maxlength: 4000 },
    category: {
      type: String,
      required: true,
      enum: [
        "Short Film Competitions",
        "Film Festivals",
        "Student Film Competitions",
        "Screenwriting Competitions",
        "Workshops",
        "Film Awards",
        "Pitching Events",
        "Filmmaking Programs",
      ],
    },
    location: { type: String, required: true, trim: true },
    format: { type: String, enum: ["Online", "Offline", "Hybrid"], default: "Online" },
    entryFee: { type: Number, min: 0, default: 0 },
    prize: { type: String, default: "Not specified" },
    deadline: { type: Date, required: true },
    eligibility: [{ type: String, trim: true }],
    filmTypes: [{ type: String, trim: true }],
    durationRequirement: { type: String, default: "Not specified" },
    genres: [{ type: String, trim: true }],
    submissionRequirements: [{ type: String, trim: true }],
    importantDates: [
      {
        label: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    websiteUrl: {
      type: String,
      default: "",
      validate: {
        validator: (value) => !value || /^https:\/\//i.test(value),
        message: "Official website links must use HTTPS.",
      },
    },
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified"],
      default: "unverified",
    },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

opportunitySchema.index({ deadline: 1, category: 1, format: 1 });
opportunitySchema.index({ filmTypes: 1, genres: 1, location: 1 });

module.exports = mongoose.model("Opportunity", opportunitySchema);