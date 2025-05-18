document.addEventListener("DOMContentLoaded", function () {
  // Check if user is logged in
  const username = sessionStorage.getItem("username");
  const userType = sessionStorage.getItem("userType");
  // If not logged in, redirect to login page
  if (!username || !userType) {
    window.location.href = "../portals/portal.html";
  }
});

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
  sessionStorage.clear();
  window.location.href = "../portal.html";
}
