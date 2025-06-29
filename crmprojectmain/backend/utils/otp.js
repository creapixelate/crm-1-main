// ✅ File: utils/otp.js
exports.generateOTP = function () {
  return Math.floor(1000 + Math.random() * 9000).toString(); // Always 4-digit
};
