
const mongoose = require("mongoose");
const MarketplaceConnectionRequest = require("../models/MarketplaceConnectionRequest");
const MarketplaceProfessional = require("../models/MarketplaceProfessional");
const marketplaceSeed = require("../data/marketplaceSeed");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const mutableFields = [
  "name",
  "profilePhoto",
  "role",
  "category",
  "bio",
  "experience",
  "skills",
  "portfolio",
  "previousProjects",
  "location",
  "languages",
  "price",
  "priceType",
  "availability",
];

const pickFields = (source) =>
  Object.fromEntries(mutableFields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]));

const sortOptions = {
  "highest-rated": { rating: -1, reviewCount: -1 },
  "lowest-price": { price: 1, rating: -1 },
  "highest-experience": { experience: -1, rating: -1 },
  newest: { createdAt: -1 },
  recommended: { rating: -1, reviewCount: -1, availability: -1 },
};

const getProfessionals = async (req, res) => {
  try {
    const {
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      availability,
      search,
      sort = "recommended",
      page = "1",
      limit = "24",
    } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };
    if (minRating !== undefined) filter.rating = { $gte: Number(minRating) };
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    if (availability !== undefined) filter.availability = availability === "true";
    if (search) {
      const terms = String(search).trim().split(/\s+/).filter(Boolean);
      filter.$and = terms.map((value) => {
        const term = { $regex: escapeRegex(value), $options: "i" };
        return {
          $or: [
            { name: term },
            { role: term },
            { category: term },
            { bio: term },
            { skills: term },
            { location: term },
          ],
        };
      });
    }

    const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
    const safeLimit = Math.min(60, Math.max(1, Number.parseInt(limit, 10) || 24));
    const [professionals, total] = await Promise.all([
      MarketplaceProfessional.find(filter)
        .select("-ownerId -__v")
        .sort(sortOptions[sort] || sortOptions.recommended)
        .skip((safePage - 1) * safeLimit)
        .limit(safeLimit)
        .lean(),
      MarketplaceProfessional.countDocuments(filter),
    ]);

    return res.status(200).json({ professionals, total, page: safePage, pages: Math.ceil(total / safeLimit) });
  } catch (error) {
    console.error("Marketplace listing error:", error.message);
    return res.status(500).json({ message: "Unable to load professionals." });
  }
};

const getProfessionalById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Professional not found." });
  }

  try {
    const professional = await MarketplaceProfessional.findById(req.params.id).select("-ownerId -__v").lean();
    if (!professional) return res.status(404).json({ message: "Professional not found." });
    return res.status(200).json(professional);
  } catch (error) {
    console.error("Marketplace profile error:", error.message);
    return res.status(500).json({ message: "Unable to load this professional." });
  }
};

const createProfessional = async (req, res) => {
  try {
    const professional = await MarketplaceProfessional.create({ ...pickFields(req.body), ownerId: req.user.id });
    return res.status(201).json({ professional });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to create professional profile." });
  }
};

const updateProfessional = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Professional not found." });
  }

  try {
    const professional = await MarketplaceProfessional.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      { $set: pickFields(req.body) },
      { returnDocument: "after", runValidators: true }
    );
    if (!professional) return res.status(404).json({ message: "Professional profile not found." });
    return res.status(200).json({ professional });
  } catch (error) {
    return res.status(400).json({ message: error.message || "Unable to update professional profile." });
  }
};

const deleteProfessional = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Professional not found." });
  }

  try {
    const professional = await MarketplaceProfessional.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!professional) return res.status(404).json({ message: "Professional profile not found." });
    await MarketplaceConnectionRequest.deleteMany({ professionalId: professional._id });
    return res.status(200).json({ message: "Professional profile deleted." });
  } catch (error) {
    console.error("Marketplace profile delete error:", error.message);
    return res.status(500).json({ message: "Unable to delete professional profile." });
  }
};

const createConnectionRequest = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Professional not found." });
  }

  const message = String(req.body.message || "").trim();
  if (message.length < 10 || message.length > 1200) {
    return res.status(400).json({ message: "Write a message between 10 and 1,200 characters." });
  }

  try {
    const professionalExists = await MarketplaceProfessional.exists({ _id: req.params.id });
    if (!professionalExists) return res.status(404).json({ message: "Professional not found." });

    const request = await MarketplaceConnectionRequest.create({
      professionalId: req.params.id,
      userId: req.user.id,
      message,
    });
    return res.status(201).json({ requestId: request._id, message: "Connection request sent." });
  } catch (error) {
    console.error("Marketplace connection error:", error.message);
    return res.status(500).json({ message: "Unable to send your connection request." });
  }
};

const seedMarketplace = async () => {
  if (process.env.NODE_ENV === "production" && process.env.SEED_DEMO_DATA !== "true") return;
  if (await MarketplaceProfessional.estimatedDocumentCount()) return;
  await MarketplaceProfessional.insertMany(marketplaceSeed);
};

module.exports = {
  getProfessionals,
  getProfessionalById,
  createProfessional,
  updateProfessional,
  deleteProfessional,
  createConnectionRequest,
  seedMarketplace,
};