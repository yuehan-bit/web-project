
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    
    // If not logged in, redirect to login page
    if (isLoggedIn !== "true") {
        // Before redirecting, store the current page URL to return after login
        localStorage.setItem("redirectAfterLogin", window.location.href);
        
        // Redirect to login page
        window.location.href = "../portal/portal.html"; // Adjust path as needed
        return false;
    }
    
    return true;
}

// Function to log out user
function logout() {
    // Clear all authentication data from both localStorage and sessionStorage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userType");
    sessionStorage.removeItem("username");
    
    // Redirect to login page
    window.location.href = "../portal.html"; // Adjust path as needed
}