const { default: Stripe } = require("stripe");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse = require("../utils/ApiResponse");
const student = require("../models/student.model");
const { trusted } = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createSession = asyncHandler(async (req, res) => {
  const { plan } = req.body;
  const userId = req.user._id;
  if (!plan) {
    throw new ApiError(400, "please specify plan id");
  }
  const priceIds = {
    monthly: "price_1QQSAIKDd4UYTPIGXnTf4k85",
    yearly: "price_1QQSCQKDd4UYTPIGxApAMN1u",
  };
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceIds[plan],
        quantity: 1,
      },
    ],
    metadata: { userId: String(userId) },
    mode: "subscription",
    success_url: `${process.env.FRONT_END_URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONT_END_URL}/dashboard`,
  });

  res
    .status(200)
    .json(new ApiResponse(200, { checkOutUrl: stripeSession.url }));
});

const verifyCheckout = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const userId = session.metadata.userId;
  const studentSubscribed = await student.findByIdAndUpdate(userId, {
    isSubscribed: true,
  });
  if (!studentSubscribed) {
    throw new ApiError(404, "student not found");
  }
  res.status(200).json(new ApiResponse(200, "Verified Successfully"));
});

module.exports = { createSession, verifyCheckout };
