function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;
    const userType = form.userType.value; // Get the selected user type (cadet, instructor, or officer)
    
    // Clear previous error message if exists
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
        errorElement.classList.remove('visible');
        errorElement.classList.remove('shake'); // Remove animation class if present
    }

    // Enhanced mock database with multiple users for each user type
    const mockDatabase = {
        cadet: [
            { username: "1234", password: "1234", name: "Cadet John" },
            { username: "23-3336", password: "02/22/2004", name: "Cadet John Mark" },
            { username: "23-5678", password: "password123", name: "Cadet Sarah Johnson" },
            { username: "24-1234", password: "cadet2024", name: "Cadet Michael Chen" },
            { username: "24-5678", password: "rotc2024", name: "Cadet Emma Rodriguez" },
            { username: "22-9012", password: "navy2022", name: "Cadet James Wilson" }
        ],
        instructor: [
            { username: "123", password: "123", name: "Instructor Smith" },
            { username: "inst456", password: "faculty22", name: "Instructor Parker" },
            { username: "prof789", password: "teach2023", name: "Instructor Williams" },
            { username: "instr100", password: "navy_inst", name: "Instructor Taylor" }
        ],
        officer: [
            { username: "12345", password: "12345", name: "Officer Jane" },
            { username: "off7890", password: "command1", name: "Officer Martinez" },
            { username: "cdr2468", password: "officer23", name: "Commander Johnson" },
            { username: "ltc1357", password: "usnavy25", name: "Lieutenant Clark" }
        ]
    };

    // Check if the user exists in the mock database
    const user = mockDatabase[userType]?.find(user => user.username === username && user.password === password);

    if (user) {
        // Save the user's name and userType in sessionStorage for personalization and role management
        sessionStorage.setItem("username", user.name);
        sessionStorage.setItem("username", user.name);
        sessionStorage.setItem("userType", userType);

        // Show loading spinner
        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.remove('hidden');

        // Simulate loading time before redirecting
        setTimeout(() => {
            window.location.href = `dashboard/${userType}-dashboard.html`; // Redirect based on user type
        }, 1500); // 1.5 seconds delay for loading spinner
    } else {
        // If user credentials don't match, show an error message
        alert("Invalid username or password. Please try again.");
    }
}

//flipping functionality for the signup form
loginButton.onclick = function(){
	document.querySelector("#flipper").classList.toggle("flip");
}

//flipping functionality for the signup form
registerButton.onclick = function(){
	document.querySelector("#flipper").classList.toggle("flip");
}