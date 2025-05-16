/* document.addEventListener("DOMContentLoaded", function () {
    const form = document.forms["signup"];
    const inputs = form.querySelectorAll("input[type='text']");
    const submitButton = form.querySelector("input[type='submit']");

    // Enable submit button if all fields are filled
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            const allFilled = Array.from(inputs).every(field => field.value.trim() !== "");
            submitButton.disabled = !allFilled;
        });
    });

    // Handle form submission
    window.signupValidation = function (event, type) {
        event.preventDefault(); // Prevent actual form submission

        const schoolId = form["school-id"].value.trim();
        const fullName = form["full-name"].value.trim();
        const courseSection = document.getElementById("course-year-section").value.trim();

        console.log("=== New Registration ===");
        console.log("User Type:", type);
        console.log("School ID:", schoolId);
        console.log("Full Name:", fullName);
        console.log("Course/Year/Section:", courseSection);

        // Optionally clear form
        form.reset();
        submitButton.disabled = true;
    };
 */
    const signupForm = document.forms.signup;
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Collect form data
            const data = {
                schoolId: signupForm['school-id'].value,
                fullName: signupForm['full-name'].value,
                courseYearSection: signupForm['course-year-section'].value
            };

            // Send data to server (replace '/api/signup' with your real endpoint)
            try {
                const response = await fetch('/api/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Signup successful!');
                    signupForm.reset();
                } else {
                    alert('Signup failed. Please try again.');
                }
            } catch (err) {
                alert('Network error. Please try again later.');
            }
        });
    }
