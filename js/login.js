function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const username = form.username.value;
    const password = form.password.value;
    const userType = form.userType.value;

    // Clear previous error messages
    const usernameError = document.getElementById('username-error');
    const passwordError = document.getElementById('password-error');
    if (usernameError) usernameError.textContent = '';
    if (passwordError) passwordError.textContent = '';

    // Mock database
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
            { username: "ltc1357", password: "usnavy25", name: "Lieutenant Clark" },
            { username: "ltjg2468", password: "", name: "Officer Tan" }
        ]
    };

    // Find user
    const user = mockDatabase[userType]?.find(user => user.username === username && user.password === password);

    if (user) {
        sessionStorage.setItem("username", user.username); // <-- use username, not name
        sessionStorage.setItem("userType", userType);

        const loadingOverlay = document.getElementById('loading-overlay');
        loadingOverlay.classList.remove('hidden');

        setTimeout(() => {
            window.location.href = `dashBoard/${userType}-dashboard.html`;
        }, 1500);
    } else {
        // Show red error messages below inputs
        let usernameValid = mockDatabase[userType]?.some(user => user.username === username);
        if (!usernameValid) {
            if (usernameError) usernameError.textContent = "Invalid username.";
        } else {
            if (passwordError) passwordError.textContent = "Invalid password.";
        }
    }
}

// Add these lines to your HTML below each input:
// <div class="error" id="username-error"></div>
// <div class="error" id="password-error"></div>

//flipping functionality for the signup form
loginButton.onclick = function(){
	document.querySelector("#flipper").classList.toggle("flip");
}

//flipping functionality for the signup form
registerButton.onclick = function(){
	document.querySelector("#flipper").classList.toggle("flip");
}