import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, default: "" },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      required: true,
      enum: ["Sarees", "Jewellery", "Shawls", "Apparel", "Art", "Décor", "Other"],
    },
    region: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      enum: ["Bestseller", "New", "Sale", "Premium", "Handcrafted", null],
      default: null,
    },
    img: {
      type: String,
      required: true,
    },
    images: {
      type: [String],   
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);


productSchema.methods.recalcRating = function () {
  if (this.reviews.length === 0) {
    this.rating     = 0;
    this.numReviews = 0;
  } else {
    const sum       = this.reviews.reduce((s, r) => s + r.rating, 0);
    this.rating     = Math.round((sum / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ name: "text", description: "text" });

export const Product = mongoose.model("Product", productSchema);
export default Product;