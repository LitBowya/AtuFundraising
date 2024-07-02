import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    date: Date,
    recurring: Boolean,
    frequency: String, // 'monthly', 'quarterly', 'annual'
    paystackSubscriptionCode: String, // For managing subscriptions
  paystackCustomerCode: String // For managing customer
  });
  const Donation = mongoose.model('Donation', donationSchema);
 
  export default Donation