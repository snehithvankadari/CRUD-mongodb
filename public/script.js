let selectedStudentId = null;


// ========================================
// SHOW ERROR
// ========================================

function showError(message) {

    document.getElementById(
        "errorMessage"
    ).textContent = message;

}


// ========================================
// CLEAR ERROR
// ========================================

function clearError() {

    document.getElementById(
        "errorMessage"
    ).textContent = "";

}


// ========================================
// GET DEPARTMENT ID
// ========================================

async function getDepartmentId(departmentName) {

    const response =
        await fetch("/api/departments");


    const departments =
        await response.json();


    const department =
        departments.find(
            d =>
                d.name.toLowerCase() ===
                departmentName.toLowerCase()
        );


    if (!department) {

        return null;

    }


    return department._id;

}


// ========================================
// CREATE
// ========================================

async function addStudent() {

    clearError();


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const rollno =
        document.getElementById(
            "rollno"
        ).value.trim();


    const age =
        document.getElementById(
            "age"
        ).value;


    const department =
        document.getElementById(
            "department"
        ).value.trim();


    // CHECK EMPTY FIELDS

    if (
        !name ||
        !rollno ||
        !age ||
        !department
    ) {

        showError(
            "Please fill every field"
        );

        return;

    }


    // CHECK AGE

    if (
        Number(age) < 15 ||
        Number(age) > 25
    ) {

        showError(
            "Age must be between 15 and 25"
        );

        return;

    }


    // FIND DEPARTMENT

    const departmentId =
        await getDepartmentId(
            department
        );


    if (!departmentId) {

        showError(
            "Department does not exist. Use CSE, ECE or AIML."
        );

        return;

    }


    const student = {

        name: name,

        rollno: rollno,

        age: Number(age),

        departmentId:
            departmentId

    };


    try {

        const response =
            await fetch(
                "/api/students",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(student)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showError(
                data.message
            );

            return;

        }


        clearForm();

        getStudents();

    }

    catch (error) {

        showError(
            "Unable to connect to server"
        );

    }

}


// ========================================
// READ
// ========================================

async function getStudents() {

    try {

        const response =
            await fetch(
                "/api/students"
            );


        const students =
            await response.json();


        const table =
            document.getElementById(
                "studentTable"
            );


        table.innerHTML = "";


        students.forEach(
            student => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${student.name}
                    </td>

                    <td>
                        ${student.rollno}
                    </td>

                    <td>
                        ${student.age}
                    </td>

                    <td>
                        ${
                            student.departmentId
                                ? student.departmentId.name
                                : "Unknown"
                        }
                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick='editStudent(${JSON.stringify(student)})'
                        >
                            Edit
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteStudent('${student._id}')"
                        >
                            Delete
                        </button>

                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );

    }

    catch (error) {

        showError(
            "Unable to load students"
        );

    }

}


// ========================================
// EDIT
// ========================================

function editStudent(student) {

    clearError();


    selectedStudentId =
        student._id;


    document.getElementById(
        "name"
    ).value =
        student.name;


    document.getElementById(
        "rollno"
    ).value =
        student.rollno;


    document.getElementById(
        "age"
    ).value =
        student.age;


    if (student.departmentId) {

        document.getElementById(
            "department"
        ).value =
            student.departmentId.name;

    }

}


// ========================================
// UPDATE
// ========================================

async function updateStudent() {

    clearError();


    if (!selectedStudentId) {

        showError(
            "Select a student using Edit first"
        );

        return;

    }


    const name =
        document.getElementById(
            "name"
        ).value.trim();


    const rollno =
        document.getElementById(
            "rollno"
        ).value.trim();


    const age =
        document.getElementById(
            "age"
        ).value;


    const department =
        document.getElementById(
            "department"
        ).value.trim();


    // CHECK EMPTY FIELDS

    if (
        !name ||
        !rollno ||
        !age ||
        !department
    ) {

        showError(
            "Please fill every field"
        );

        return;

    }


    // CHECK AGE

    if (
        Number(age) < 15 ||
        Number(age) > 25
    ) {

        showError(
            "Age must be between 15 and 25"
        );

        return;

    }


    // FIND DEPARTMENT

    const departmentId =
        await getDepartmentId(
            department
        );


    if (!departmentId) {

        showError(
            "Department does not exist. Use CSE, ECE or AIML."
        );

        return;

    }


    const student = {

        name: name,

        rollno: rollno,

        age: Number(age),

        departmentId:
            departmentId

    };


    try {

        const response =
            await fetch(
                `/api/students/${selectedStudentId}`,
                {

                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify(student)

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showError(
                data.message
            );

            return;

        }


        clearForm();

        getStudents();

    }

    catch (error) {

        showError(
            "Unable to connect to server"
        );

    }

}


// ========================================
// DELETE
// ========================================

async function deleteStudent(id) {

    clearError();


    try {

        const response =
            await fetch(
                `/api/students/${id}`,
                {

                    method: "DELETE"

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showError(
                data.message
            );

            return;

        }


        getStudents();

    }

    catch (error) {

        showError(
            "Unable to delete student"
        );

    }

}


// ========================================
// CLEAR FORM
// ========================================

function clearForm() {

    document.getElementById(
        "name"
    ).value = "";


    document.getElementById(
        "rollno"
    ).value = "";


    document.getElementById(
        "age"
    ).value = "";


    document.getElementById(
        "department"
    ).value = "";


    selectedStudentId = null;


    clearError();

}


// ========================================
// START
// ========================================

getStudents();