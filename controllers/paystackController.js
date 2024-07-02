import https from 'https'
import paystack from "../utils/payment.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Donation from "../models/donationModel.js";
import User from "../models/userModel.js";

const initializePayment = asyncHandler(async (req, res) => {
  try {
    const { email, amount, name } = req.body;

    const params = JSON.stringify({
      email: email,
      amount: amount * 100,
      name: name,
    });

    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",

      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const clientReq = https
      .request(options, (apiRes) => {
        let data = "";
        apiRes.on("data", (chunk) => {
          data += chunk;
        });
        apiRes.on("end", () => {
          res.status(200).json(JSON.parse(data));
        });
      })
      .on("error", (error) => {
        console.error(error);
        res.status(400).json(error.message);
      });

    clientReq.write(params);
    clientReq.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { reference } = req.query;
    const response = await paystack.get(`/transaction/verify/${reference}`);
    const { status, customer, amount, paid_at } = response.data.data;

    if (status === "success") {
      const user = await User.findOne({ email: customer.email });
      const newDonation = new Donation({
        userId: user._id,
        amount: amount / 100, // Convert from kobo
        date: paid_at,
        recurring: false,
      });
      await newDonation.save();
      console.log("Payment verified:", newDonation);
      // res.redirect("/donation-history");
    } else {
      res.status(400).send("Payment verification failed");
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).send("Error verifying payment");
  }
});

const setupRecurringPayment = asyncHandler(async (req, res) => {
  try {
    const { email, amount, frequency } = req.body;
    const customerResponse = await paystack.post("/customer", { email });
    const { customer_code } = customerResponse.data.data;

    const planResponse = await paystack.post("/plan", {
      name: `Recurring Donation - ${frequency}`,
      amount: amount * 100,
      interval: frequency, // monthly, quarterly, annual
    });
    const { plan_code } = planResponse.data.data;

    const subscriptionResponse = await paystack.post("/subscription", {
      customer: customer_code,
      plan: plan_code,
    });
    const { subscription_code } = subscriptionResponse.data.data;

    const user = await User.findOne({ email });
    const newDonation = new Donation({
      userId: user._id,
      amount,
      date: new Date(),
      recurring: true,
      frequency,
      paystackSubscriptionCode: subscription_code,
      paystackCustomerCode: customer_code,
    });
    await newDonation.save();
    console.log("Recurring payment set up:", newDonation);
    // res.redirect("/donation-history");
  } catch (error) {
    console.error("Error setting up recurring payment:", error);
    res.status(500).send("Error setting up recurring payment");
  }
});

export { initializePayment, verifyPayment, setupRecurringPayment };
