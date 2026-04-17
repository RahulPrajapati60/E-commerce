import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,      
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    region: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    qty: {
      type: Number,
      required: true,
      min: 1,
    },
    img: {
      type: String,
      default: "",
    },
  },
  { _id: false }   
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    fullName:    { type: String, required: true },
    phone:       { type: String, required: true },
    address:     { type: String, required: true },
    locality:    { type: String, default: "" },
    city:        { type: String, required: true },
    state:       { type: String, required: true },
    pincode:     { type: String, required: true },
    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "cod"],
      required: true,
    },
    // UPI fields
    upiId:    { type: String, default: "" },
    upiApp:   { type: String, default: "" },   
    
    cardLast4:  { type: String, default: "" },
    cardHolder: { type: String, default: "" },
    cardExpiry: { type: String, default: "" },
    // Net banking
    bank:   { type: String, default: "" },
    // Wallet
    wallet: { type: String, default: "" },
    // COD has no extra fields
  },
  { _id: false }
);


const orderSchema = new mongoose.Schema(
  {
    orderId: { 
      type: String, 
      unique: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items: [orderItemSchema],

    deliveryAddress: deliveryAddressSchema,
    payment: paymentInfoSchema,

    
    subtotal:        { type: Number, required: true },
    shippingFee:     { type: Number, default: 0 },
    couponCode:      { type: String, default: "" },
    couponDiscount:  { type: Number, default: 0 },
    total:           { type: Number, required: true },

    // Order lifecycle
    status: {
      type: String,
      enum: ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled", "refunded"],
      default: "confirmed",
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "paid",      // COD starts as "pending" — see pre-save hook below
    },

    
    estimatedDelivery: {
      type: Date,
    },
    trackingId: { type: String, default: "" },
    notes:      { type: String, default: "" },
  },
  { timestamps: true }
);


orderSchema.pre("save", async function () {
  try {
    if (!this.orderId) {
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
      this.orderId = `UTS-${date}-${rand}`;
    }

    // COD payment status
    if (this.isNew && this.payment?.method === "cod") {
      this.paymentStatus = "pending";
    }

    // Estimated delivery
    if (!this.estimatedDelivery) {
      this.estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

     // ← Keep this
  } catch (error) {
    console.error("Order Pre-save Error:", error);
  }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ status: 1 });

export const Order = mongoose.model("Order", orderSchema);
export default Order;