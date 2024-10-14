const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

// User Schema
const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

// Admin Schema
const adminSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

// Course Schema
const courseSchema = new Schema({
  title: {type: String, unique: true},
  description: String,
  price: Number,
});

// Purchase Schema
const purchaseSchema = new Schema({
  userId: { type: ObjectId, ref: "User" },
  courseId: { type: ObjectId, ref: "Course" },
  purchaseDate: { type: Date, default: Date.now },
  amountPaid: Number,
  paymentStatus: Boolean,
});

// Create Models from Schemas
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);
const Purchase = mongoose.model("Purchase", purchaseSchema);

// Export the models
module.exports = {
  User,
  Admin,
  Course,
  Purchase,
};
