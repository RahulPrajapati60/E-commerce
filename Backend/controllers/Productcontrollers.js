import { Product } from "../models/Productmodel.js";


export const getAllProducts = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;

    const filter = {};   

  
    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
      ];
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      popular: { numReviews: -1 },
    };

    const sortQuery = sortMap[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .select("-reviews -__v");

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("reviews.userId", "firstName lastName");

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const createProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice,
      category, region, badge, img, images, stock, tags,
    } = req.body;

    if (!name?.trim()) return res.status(400).json({ success: false, message: "Product name is required" });
    if (!price) return res.status(400).json({ success: false, message: "Price is required" });
    if (!category) return res.status(400).json({ success: false, message: "Category is required" });
    if (!img?.trim()) return res.status(400).json({ success: false, message: "Main image URL is required" });

    const product = await Product.create({
      name: name.trim(),
      description: description?.trim() || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category,
      region: region?.trim() || "",
      badge: badge || null,
      img: img.trim(),
      images: images || [],
      stock: Number(stock) || 0,
      tags: tags || [],
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const allowed = [
      "name", "description", "price", "originalPrice", "category",
      "region", "badge", "img", "images", "stock", "tags", "isActive",
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.stock) updates.stock = Number(updates.stock);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, message: "Product updated", product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, message: "Product removed from store" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // One review per user per product
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId.toString() === req.id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "You have already reviewed this product" });
    }

    product.reviews.push({
      userId: req.id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      rating: Number(rating),
      comment: comment?.trim() || "",
    });

    product.recalcRating();
    await product.save();

    return res.status(201).json({ success: true, message: "Review added", rating: product.rating, numReviews: product.numReviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const adminGetAllProducts = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-reviews -__v");

    return res.status(200).json({ success: true, total, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};