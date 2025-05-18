document.addEventListener("DOMContentLoaded", () => {
  // Select all nav links
  const navLinks = document.querySelectorAll("nav ul li a");
  console.log("Nav links found:", navLinks);

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      console.log("Clicked link:", link.textContent);

      // Remove active class from all links
      navLinks.forEach((nav) => nav.classList.remove("active"));

      // Add active class to the clicked link
      link.classList.add("active");
    });
  });
});
