const otps = new Map();

exports.sendOtp = async (email) => {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otps.set(email, otp);
  return otp; // ✅ return it
};

exports.verifyOtpCode = (email, inputOtp) => {
  const realOtp = otps.get(email);
  if (realOtp === inputOtp) {
    otps.delete(email);
    return true;
  }
  return false;
};
