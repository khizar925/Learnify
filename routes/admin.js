const { Router } = require("express");
const JWT_SECRET_Admin = process.env.JWT_SECRET_Admin;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authAdmin } = require("../middleware/admin");
const { AdminModel, CourseModel } = require("../db");

const adminRouter = Router();

adminRouter.post("/signup", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 10);

    await AdminModel.create({
      email: email,
      password: hasedPassword,
      name: name,
    });

    res.json({
      message: "You are signed up",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error signing up admin",
      error: error.message,
    });
  }
});
adminRouter.post("/signin", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await AdminModel.findOne({
      email: email,
    });

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (admin && passwordMatch) {
      const token = jwt.sign(
        {
          id: admin._id.toString(),
        },
        JWT_SECRET_Admin
      );

      res.json({
        token,
      });
    } else {
      res.status(403).json({
        message: "Incorrect creds",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error signing in admin",
      error: error.message,
    });
  }
});
adminRouter.post("/createCourse", authAdmin, async function (req, res) {
  try {
    // Implement create course logic here
    const courseName = req.body.courseName;
    const courseDesc = req.body.courseDesc;
    const coursePrice = req.body.coursePrice;

    await CourseModel.create({
      title: courseName,
      description: courseDesc,
      price: coursePrice,
    });

    res.json({
      message: "Course Created Succesfully!",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating course",
      error: error.message,
    });
  }
});
adminRouter.post("/deleteCourse", authAdmin, async function (req, res) {
  try {
    // Implement delete course logic here
    const courseTitle = req.body.courseName;
    const course = await CourseModel.findOne({
      title: courseTitle,
    });
    const result = await CourseModel.deleteOne({
      _id: course.id,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    res.json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting course",
      error: error.message,
    });
  }
});
module.exports = {
  adminRouter: adminRouter,
};
