export const requestOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.json({ success: false, message: "Phone required" });
  }

  // Normally send SMS here
  const otp = "123456";

  res.json({
    success: true,
    message: "OTP sent",
    otp // only for testing
  });
};
