 document.addEventListener("DOMContentLoaded", async function () {
    // Handle sidebar link clicks
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {
      link.addEventListener("click", function () {
        // Remove the 'active' class from all links
        navLinks.forEach(link => link.classList.remove("active"));

        // Add the 'active' class to the clicked link
        this.classList.add("active");

        // Optionally: Load content dynamically or change page content here
        const url = this.getAttribute("data-url");
      })
    });

    // Fetch user profile data
    try {
      const response = await axios.get("/users/profile", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${document.cookie.split("=")[1]}`,
        },
      });

      const data = response.data.user;
      const profilePicture = document.getElementById("profile-picture");
      const userName = document.getElementById("user-name");

      if (data && data.profilePicture) {
        profilePicture.src = data.profilePicture;
        userName.textContent = data.name || "Admin";
      } else {
        profilePicture.src = "";
        userName.textContent = "No Profile";
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Handle errors or fallback behavior
    }

    // Logout Button Event Listener
    document
      .getElementById("logoutButton")
      .addEventListener("click", function () {
        axios
          .post(
            "/users/logout",
            {},
            {
              headers: {
                Authorization: `Bearer ${document.cookie.split("=")[1]}`,
              },
            }
          )
          .then(() => {
            window.location.href = "/login";
          })
          .catch((error) => {
            console.error("Error logging out:", error);
          });
      });

  });
