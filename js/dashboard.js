// Function to retrieve logged-in user data (based on username)
function getUserData() {
    // Retrieve username from sessionStorage, or fallback to a default value
    const username = sessionStorage.getItem("username") ||("Cadet" || "Instructor" || "Off");

    // Return user-specific data
    // You can replace this mock data with a real API call to get user details
    return {
        name: username,  // Use username for personalization
        role: "Cadet"    // Default role, this can also be fetched from a backend
    };
}

// Update the welcome message with the user's name
document.addEventListener("DOMContentLoaded", () => {
    const username = sessionStorage.getItem("username") || "Cadet";
    const welcomeMessage = document.getElementById("welcome-message");
    welcomeMessage.textContent = `Welcome, ${username}!`;
});

document.addEventListener('DOMContentLoaded', () => {
        const logoDropdown = document.querySelector('.dropdown');
        const logoToggle = document.querySelector('.logo-toggle');

        logoToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            logoDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            logoDropdown.classList.remove('active');
        });
    });