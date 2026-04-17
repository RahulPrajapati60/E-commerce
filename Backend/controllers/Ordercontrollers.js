import Order from "../models/Ordermodel.js";

export const placeOrder = async (req, res ) => {
  try {
    const {
      items,
      deliveryAddress,
      payment,
      subtotal,
      shippingFee,
      couponCode,
      couponDiscount,
      total,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!deliveryAddress || !payment?.method) {
      return res.status(400).json({ success: false, message: "Address and payment method are required" });
    }

    const sanitisedPayment = {
      method: payment.method,
      upiId: payment.upiId || "",
      upiApp: payment.upiApp || "",
      bank: payment.bank || "",
      wallet: payment.wallet || "",
      cardLast4: payment.cardNumber ? payment.cardNumber.replace(/\s/g, "").slice(-4) : "",
      cardHolder: payment.cardHolder || "",
      cardExpiry: payment.cardExpiry || "",
    };

    const order = await Order.create({
      userId: req.id || null,
      items,
      deliveryAddress,
      payment: sanitisedPayment,
      subtotal: subtotal || 0,
      shippingFee: shippingFee || 0,
      couponCode: couponCode || "",
      couponDiscount: couponDiscount || 0,
      total,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({
      success: true,
      count:   orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate("userId", "firstName lastName email")
      .select("-__v");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Regular users can only see their own orders
    const isOwner = order.userId?._id?.toString() === req.id?.toString();
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-__v");

    return res.status(200).json({
      success: true,
      total,
      page:    Number(page),
      pages:   Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingId } = req.body;

    const validStatuses = ["pending","confirmed","packed","shipped","delivered","cancelled","refunded"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const update = { status };
    if (trackingId) update.trackingId = trackingId;

    // Auto-update payment status on delivery / refund
    if (status === "delivered")             update.paymentStatus = "paid";
    if (status === "refunded")              update.paymentStatus = "refunded";
    if (status === "cancelled")             update.paymentStatus = "refunded";

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Auth: required — user can only cancel their own orders that are still "confirmed"

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const isOwner = order.userId?.toString() === req.id?.toString();
    const isAdmin = req.user?.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const cancellable = ["pending", "confirmed", "packed"];
    if (!cancellable.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already "${order.status}"`,
      });
    }

    order.status        = "cancelled";
    order.paymentStatus = order.payment.method === "cod" ? "pending" : "refunded";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const [totalOrders, revenue, statusBreakdown, recentOrders] = await Promise.all([

      Order.countDocuments(),

      Order.aggregate([
        { $match: { status: { $nin: ["cancelled", "refunded"] } } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]),

      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort:  { count: -1 } },
      ]),

      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "firstName lastName")
        .select("orderId total status createdAt"),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: revenue[0]?.totalRevenue || 0,
        statusBreakdown,
        recentOrders,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};