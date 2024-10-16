const { Router } = require("express");
const { UserModel, CourseModel, PurchaseModel } = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authUser } = require("../middleware/user")

const JWT_SECRET = process.env.JWT_SECRET;
const userRouter = Router();

userRouter.post("/signup", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email: email,
      password: hasedPassword,
      name: name,
    });

    res.json({
      message: "You are signed up",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error signing up",
      error: error.message,
    });
  }
});

userRouter.post("/signin", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await UserModel.findOne({
      email: email,
    });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (user && passwordMatch) {
      const token = jwt.sign(
        {
          id: user._id.toString(),
        },
        JWT_SECRET
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
      message: "Error signing in",
      error: error.message,
    });
  }
});

userRouter.post("/purchase", authUser, async function (req, res) {
  try {
    // Implement purchase logic here
    const courseName = req.body.courseName;
    const amountPaid = req.body.amountPaid;
    const paymentStatus = req.body.paymentStatus;
    const course = await CourseModel.findOne({
      title: courseName,
    });
    if (course) {
      await PurchaseModel.create({
        userId: req.userId,
        courseId: course._id,
        purchaseDate: Date.now(),
        amountPaid: amountPaid,
        paymentStatus: paymentStatus,
      });
      res.json({
        message: "Course Purchased Successfully!",
      });
    } else {
      res.json({
        message: "Course not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error purchasing course",
      error: error.message,
    });
  }
});

userRouter.get("/purchases", authUser, async function (req, res) {
  try {
    const userId = req.userId; // Retrieve the userId from the request (set by authUser middleware)

    // Find all purchases for the specific user and populate course details (title, description)
    const purchasedCourses = await PurchaseModel.find({ userId: userId }).populate(
      "courseId",
      "title description"
    );

    if (purchasedCourses.length > 0) {
      // If purchases exist, return the course details along with the purchase date
      const formattedResponse = purchasedCourses.map((purchase, index) => ({
        heading: `Course-${index + 1}`,
        title: purchase.courseId.title,
        description: purchase.courseId.description,
        purchaseDate: purchase.purchaseDate,
      }));

      res.json({
        message: "Purchased courses retrieved successfully",
        courses: formattedResponse,
      });
    } else {
      res.json({
        message: "No purchased courses found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error seeing purchased courses",
      error: error.message,
    });
  }
});

module.exports = {
    userRouter: userRouter
}