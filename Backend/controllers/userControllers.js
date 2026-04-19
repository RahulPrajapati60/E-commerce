export const verify = async (req, res) => {
  try {
    //  Token ko 3 jagah se le rahe hain (Query, Body, Header)
    const token = 
      req.query.token || 
      req.body.token || 
      (req.headers.authorization && req.headers.authorization.split(" ")[1]);

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is missing"
      });
    }

    // JWT verify
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // User find karo
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Agar already verified hai
    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified"
      });
    }

    // User ko verified mark karo
    user.isVerified = true;
    user.token = null;        // token clear kar do
    await user.save();

    console.log(`✅ User ${user.email} verified successfully`);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now login."
    });

  } catch (error) {
    console.error("Verify Controller Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Verification link has expired. Please request a new one."
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link"
    });
  }
};
