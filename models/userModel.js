import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const alumniSchema = new mongoose.Schema({
  yearOfGraduation: {
    type: String,
    required: true,
  },
  faculty: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  academicDegree: {
    type: String,
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isAlumni: { type: Boolean, default: false },
    alumniDetails: { type: alumniSchema, default: null },
    socialMediaHandles: {
      twitter: String,
      linkedin: String,
      facebook: String,
    },
    privacySettings: {
      showEmail: Boolean,
      showPhoneNumber: Boolean,
      showAddress: Boolean,
      showProfilePicture: Boolean,
      showName: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;
