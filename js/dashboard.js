// Function to retrieve logged-in user data (based on username)
function getUserData() {
    // Retrieve username from sessionStorage, or fallback to a default value
    const username = sessionStorage.getItem("username") || "Cadet";
    const role = sessionStorage.getItem("role") || "Cadet"; // Optionally store role too
    return {
        name: username,
        role: role
    };
}

// Update the welcome message with the user's name every time the dashboard loads
document.addEventListener("DOMContentLoaded", () => {
    const username = sessionStorage.getItem("username") || "Cadet";
    const userType = sessionStorage.getItem("userType") || "";
    const welcomeMessage = document.getElementById("welcome-message");
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${username}${userType ? " (" + userType + ")" : ""}!`;
    }
});

// Dropdown logic (unchanged)
document.addEventListener('DOMContentLoaded', () => {
    const logoDropdown = document.querySelector('.dropdown');
    const logoToggle = document.querySelector('.logo-toggle');

    if (logoToggle && logoDropdown) {
        logoToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            logoDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            logoDropdown.classList.remove('active');
        });
    }
});