const { Router } = require("express");
const { authUser } = require("../middleware/user");
const { CourseModel } = require("../db");

const courseRouter = Router();

courseRouter.get("/display", authUser, async function (req, res) {
  try {
    // Retrieve all courses, selecting only the title and description fields
    const courses = await CourseModel.find({}, "title description");

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
module.exports = {
  courseRouter: courseRouter,
};
