import https from "https";
import paystack from "../utils/payment.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Donation from "../models/donationModel.js";
import User from "../models/userModel.js";

const initializePayment = asyncHandler(async (req, res) => {
  try {
    const { email, amount, name } = req.body;

    const params = JSON.stringify({
      email: email,
      amount: amount,
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
        amount: amount / 100,
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

export { initializePayment, verifyPayment };
