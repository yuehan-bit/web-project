document.addEventListener("DOMContentLoaded", function () {
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
    window.signupValidation = function (event, userType) {
        event.preventDefault();
        const schoolId = form['school-id'].value.trim();
        const fullName = form['full-name'].value.trim();
        const courseYearSection = form['course-year-section'].value.trim();
        const birthday = form['birthday'].value.trim();

        fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ schoolId, fullName, courseYearSection,  birthday})
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'Signup successful!') {
                    alert('Signup successful!');
                    form.reset();
                    submitButton.disabled = true;
                } else {
                    alert(data.message || 'Signup failed.');
                }
            })
            .catch(() => alert('Signup failed. Please try again.'));
    };
});
