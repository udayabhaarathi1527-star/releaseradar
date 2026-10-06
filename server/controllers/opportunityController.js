const mongoose = require("mongoose");
const Opportunity = require("../models/Opportunity");
const opportunitySeed = require("../data/opportunitySeed");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mutableFields = [
  "title",
  "organizer",
  "description",
  "category",
  "location",
  "format",
  "entryFee",
  "prize",
  "deadline",
  "eligibility",
  "filmTypes",
  "durationRequirement",
  "genres",
  "submissionRequirements",
  "importantDates",
  "websiteUrl",
];

const pickFields = (source) =>
  Object.fromEntries(mutableFields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));

const getOpportunityStatus = (deadline) => {
  const remaining = new Date(deadline).getTime() - Date.now();
  if (remaining < 0) return "Closed";
  if (remaining <= 7 * 24 * 60 * 60 * 1000) return "Closing Soon";
  return "Open";
};

const serializeOpportunity = (opportunity) => ({
  ...opportunity,
  verificationStatus: opportunity.verificationStatus || "unverified",
  status: getOpportunityStatus(opportunity.deadline),
});

const getOpportunities = async (req, res) => {
  try {
    const {
      category,
      filmType,
      genre,
      location,
      entryFee,
      deadline,
      eligibility,
      format,
      status,
      search,
      sort = "deadline-asc",
      page = "1",
      limit = "30",
    } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (filmType) filter.filmTypes = filmType;
    if (genre && genre !== "Any") filter.genres = genre;
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };
    if (eligibility) filter.eligibility = eligibility;
    if (format) filter.format = format;
    if (entryFee === "free") filter.entryFee = 0;
    if (entryFee === "paid") filter.entryFee = { $gt: 0 };

    const now = new Date();
    const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    if (deadline === "7-days") filter.deadline = { $gte: now, $lte: sevenDays };
    else if (deadline === "30-days") filter.deadline = { $gte: now, $lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) };
    else if (deadline === "upcoming") filter.deadline = { $gte: now };

    if (status === "Closed") filter.deadline = { $lt: now };
    else if (status === "Closing Soon") filter.deadline = { $gte: now, $lte: sevenDays };
    else if (status === "Open") filter.deadline = { $gt: sevenDays };

    if (search) {
      const term = { $regex: escapeRegex(search), $options: "i" };
      filter.$or = [{ title: term }, { organizer: term }, { description: term }, { location: term }, { category: term }];
    }

    const sortOptions = {
      "deadline-asc": { deadline: 1 },
      "deadline-desc": { deadline: -1 },
      newest: { createdAt: -1 },
      "entry-fee-asc": { entryFee: 1, deadline: 1 },
    };
    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(60, Math.max(1, Number.parseInt(limit, 10) || 30));
    const [opportunities, total] = await Promise.all([
      Opportunity.find(filter)
        .select("-ownerId -__v")
        .sort(sortOptions[sort] || sortOptions["deadline-asc"])
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      Opportunity.countDocuments(filter),
    ]);

    return res.status(200).json({
      opportunities: opportunities.map(serializeOpportunity),
      total,
      page: safePage,
      pages: Math.ceil(total / safeLimit),
    });
  } catch (error) {
    console.error("Opportunity listing error:", error.message);
    return res.status(500).json({ message: "Unable to load opportunities." });
  }
};

const getOpportunityById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Opportunity not found." });
  }

  try {
    const opportunity = await Opportunity.findById(req.params.id).select("-ownerId -__v").lean();
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });
    return res.status(200).json(serializeOpportunity(opportunity));
  } catch (error) {
    console.error("Opportunity detail error:", error.message);
    return res.status(500).json({ message: "Unable to load this opportunity." });
  }
};

const createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create({ ...pickFields(req.body), ownerId: req.user.id });
    return res.status(201).json({ opportunity: serializeOpportunity(opportunity.toObject()) });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to create opportunity." });
  }
};

const updateOpportunity = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Opportunity not found." });
  }

  try {
    const opportunity = await Opportunity.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: pickFields(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });
    return res.status(200).json({ opportunity: serializeOpportunity(opportunity.toObject()) });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to update opportunity." });
  }
};

const deleteOpportunity = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Opportunity not found." });
  }

  try {
    const opportunity = await Opportunity.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!opportunity) return res.status(404).json({ message: "Opportunity not found." });
    return res.status(200).json({ message: "Opportunity deleted." });
  } catch (error) {
    console.error("Opportunity delete error:", error.message);
    return res.status(500).json({ message: "Unable to delete opportunity." });
  }
};

const seedOpportunities = async () => {
  if (process.env.NODE_ENV === "production" && process.env.SEED_DEMO_DATA !== "true") return;
  if (await Opportunity.estimatedDocumentCount()) return;
  await Opportunity.insertMany(opportunitySeed);
};

module.exports = {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  seedOpportunities,
};