const express = require("express");
const bcrypt = require("bcrypt");
const { User, Admin, Course, Purchase } = require("./db");
const { authUser, authAdmin } = require("./auth");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;
const PORT = process.env.PORT;
const JWT_SECRET_Admin = process.env.JWT_SECRET_Admin;
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();
app.use(express.json());

mongoose.connect(DATABASE_URL);

// users routes
app.post("/signup", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 10);

    await User.create({
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

app.post("/signin", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({
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

app.post("/purchaseCourse", authUser, async function (req, res) {
  try {
    // Implement purchase logic here
    const courseName = req.body.courseName;
    const amountPaid = req.body.amountPaid;
    const paymentStatus = req.body.paymentStatus;
    const course = await Course.findOne({
      title: courseName,
    });
    if (course) {
      await Purchase.create({
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

app.get("/displayAllCourses", authUser, async function (req, res) {
  try {
    // Retrieve all courses, selecting only the title and description fields
    const courses = await Course.find({}, "title description");

    // Check if courses are available
    if (courses.length > 0) {
      const formattedCourses = courses.map((course, index) => {
        return {
          heading: `Course-${index + 1}`,
          title: course.title,
          description: course.description,
        };
      });

      res.json({
        message: "Courses retrieved successfully",
        courses: formattedCourses, // Sending the formatted courses
      });
    } else {
      res.json({
        message: "No courses available",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error displaying courses",
      error: error.message,
    });
  }
});

app.get("/seePurchasedCourses", authUser, async function (req, res) {
  try {
    const userId = req.userId; // Retrieve the userId from the request (set by authUser middleware)

    // Find all purchases for the specific user and populate course details (title, description)
    const purchasedCourses = await Purchase.find({ userId: userId }).populate(
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

// admins routes
app.post("/admin/signup", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const hasedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
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

app.post("/admin/signin", async function (req, res) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const admin = await Admin.findOne({
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

app.post("/admin/createCourse", authAdmin, async function (req, res) {
  try {
    // Implement create course logic here
    const courseName = req.body.courseName;
    const courseDesc = req.body.courseDesc;
    const coursePrice = req.body.coursePrice;

    await Course.create({
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

app.post("/admin/deleteCourse", authAdmin, async function (req, res) {
  try {
    // Implement delete course logic here
    const courseTitle = req.body.courseName;
    const course = await Course.findOne({
      title: courseTitle,
    });
    const result = await Course.deleteOne({
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

app.post("/admin/addCourseContent", async function (req, res) {
  try {
    // Implement add course content logic here
  } catch (error) {
    res.status(500).json({
      message: "Error adding course content",
      error: error.message,
    });
  }
});

app.listen(PORT);
