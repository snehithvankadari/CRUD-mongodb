const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 3000;

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// DEPARTMENT SCHEMA
// ==========================================

const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Department name is required"],
            unique: true,
            trim: true
        }
    },
    {
        collection: "departments"
    }
);

const Department =
    mongoose.model("Department", departmentSchema);


// ==========================================
// STUDENT SCHEMA
// ==========================================

const studentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },

        rollno: {
            type: String,
            required: [true, "Roll number is required"],
            unique: true,
            trim: true
        },

        age: {
            type: Number,
            required: [true, "Age is required"],
            min: [15, "Age must be between 15 and 25"],
            max: [25, "Age must be between 15 and 25"]
        },

        // FOREIGN KEY
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
            required: [true, "Department is required"]
        }
    },
    {
        collection: "students"
    }
);

const Student =
    mongoose.model("Student", studentSchema);


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect("mongodb://127.0.0.1:27017/5635")
    .then(async () => {

        console.log("MongoDB Connected Successfully");

        // Create default departments if they don't exist

        await Department.updateOne(
            { name: "CSE" },
            { $setOnInsert: { name: "CSE" } },
            { upsert: true }
        );

        await Department.updateOne(
            { name: "ECE" },
            { $setOnInsert: { name: "ECE" } },
            { upsert: true }
        );

        await Department.updateOne(
            { name: "AIML" },
            { $setOnInsert: { name: "AIML" } },
            { upsert: true }
        );

        console.log("Departments Ready: CSE, ECE, AIML");

    })
    .catch((error) => {

        console.log("MongoDB Connection Error:");
        console.log(error);

    });


// ==========================================
// CREATE STUDENT
// ==========================================

app.post("/api/students", async (req, res) => {

    try {

        const {
            name,
            rollno,
            age,
            departmentId
        } = req.body;


        // -------------------------------
        // CHECK NULL / EMPTY VALUES
        // -------------------------------

        if (
            !name ||
            !rollno ||
            age === undefined ||
            age === null ||
            age === "" ||
            !departmentId
        ) {

            return res.status(400).json({
                message: "All fields are required. Values cannot be empty or null."
            });

        }


        // -------------------------------
        // CHECK AGE
        // -------------------------------

        const numericAge = Number(age);

        if (
            !Number.isInteger(numericAge) ||
            numericAge < 15 ||
            numericAge > 25
        ) {

            return res.status(400).json({
                message: "Age must be an integer between 15 and 25."
            });

        }


        // -------------------------------
        // CHECK DEPARTMENT / FOREIGN KEY
        // -------------------------------

        const department =
            await Department.findById(departmentId);

        if (!department) {

            return res.status(400).json({
                message: "Department does not exist."
            });

        }


        // -------------------------------
        // CREATE STUDENT
        // -------------------------------

        const student = new Student({

            name: name.trim(),

            rollno: rollno.trim(),

            age: numericAge,

            departmentId: departmentId

        });


        const savedStudent =
            await student.save();


        res.status(201).json({
            message: "Student added successfully",
            student: savedStudent
        });


    } catch (error) {


        // =================================
        // DUPLICATE KEY ERROR
        // =================================

        if (error.code === 11000) {

            return res.status(400).json({
                message:
                    "Duplicate roll number. This roll number already exists."
            });

        }


        // =================================
        // MONGOOSE VALIDATION ERROR
        // =================================

        if (error.name === "ValidationError") {

            const messages =
                Object.values(error.errors)
                    .map(err => err.message)
                    .join(", ");

            return res.status(400).json({
                message: messages
            });

        }


        // =================================
        // OTHER ERROR
        // =================================

        res.status(400).json({
            message: error.message
        });

    }

});


// ==========================================
// GET ALL STUDENTS
// ==========================================

app.get("/api/students", async (req, res) => {

    try {

        const students =
            await Student
                .find()
                .populate("departmentId", "name");

        res.json(students);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching students"
        });

    }

});


// ==========================================
// GET DEPARTMENTS
// ==========================================

app.get("/api/departments", async (req, res) => {

    try {

        const departments =
            await Department.find();

        res.json(departments);

    } catch (error) {

        res.status(500).json({
            message: "Error fetching departments"
        });

    }

});


// ==========================================
// UPDATE STUDENT
// ==========================================

app.put("/api/students/:id", async (req, res) => {

    try {

        const {
            name,
            rollno,
            age,
            departmentId
        } = req.body;


        // -------------------------------
        // CHECK NULL / EMPTY VALUES
        // -------------------------------

        if (
            !name ||
            !rollno ||
            age === undefined ||
            age === null ||
            age === "" ||
            !departmentId
        ) {

            return res.status(400).json({
                message:
                    "All fields are required. Values cannot be empty or null."
            });

        }


        // -------------------------------
        // CHECK AGE
        // -------------------------------

        const numericAge = Number(age);

        if (
            !Number.isInteger(numericAge) ||
            numericAge < 15 ||
            numericAge > 25
        ) {

            return res.status(400).json({
                message:
                    "Age must be an integer between 15 and 25."
            });

        }


        // -------------------------------
        // CHECK FOREIGN KEY
        // -------------------------------

        const department =
            await Department.findById(departmentId);

        if (!department) {

            return res.status(400).json({
                message:
                    "Department does not exist."
            });

        }


        // -------------------------------
        // UPDATE
        // -------------------------------

        const updatedStudent =
            await Student.findByIdAndUpdate(

                req.params.id,

                {
                    name: name.trim(),

                    rollno: rollno.trim(),

                    age: numericAge,

                    departmentId: departmentId
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!updatedStudent) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        res.json({
            message: "Student updated successfully",
            student: updatedStudent
        });


    } catch (error) {


        // =================================
        // DUPLICATE KEY ERROR
        // =================================

        if (error.code === 11000) {

            return res.status(400).json({
                message:
                    "Duplicate roll number. This roll number already exists."
            });

        }


        // =================================
        // VALIDATION ERROR
        // =================================

        if (error.name === "ValidationError") {

            const messages =
                Object.values(error.errors)
                    .map(err => err.message)
                    .join(", ");

            return res.status(400).json({
                message: messages
            });

        }


        res.status(400).json({
            message: error.message
        });

    }

});


// ==========================================
// DELETE STUDENT
// ==========================================

app.delete("/api/students/:id", async (req, res) => {

    try {

        const deletedStudent =
            await Student.findByIdAndDelete(
                req.params.id
            );


        if (!deletedStudent) {

            return res.status(404).json({
                message: "Student not found."
            });

        }


        res.json({
            message: "Student deleted successfully"
        });


    } catch (error) {

        res.status(500).json({
            message: "Error deleting student"
        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});