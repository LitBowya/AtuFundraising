// Function to check if the user is authenticated
async function isAuthenticated() {
  try {
    const response = await fetch("/auth-status", {
      method: "GET",
      credentials: "include", // Include cookies with the request
    });

    const data = await response.json();
    return data.authenticated; // Return true or false based on authentication status
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false; // Default to false if there is an error
  }
}

function redirectToLogin() {
  console.log("Redirecting to login"); // Log redirection
  window.location.href = "/login";
}

// Event listener for the donate button
document
  .getElementById("donateButton")
  .addEventListener("click", async function (event) {
    const authenticated = await isAuthenticated();

    if (!authenticated) {
        event.preventDefault();
        redirectToLogin();
    }
  });

document
  .getElementById("donationForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
      amount: formData.get("amount"),
      projectId: formData.get("projectId"),
    };

    try {
      const response = await axios.post(
        `/donations/donate/${data.projectId}`,
        data
      );

      if (response.status === 200) {
        // Save the payment reference in localStorage
        localStorage.setItem("paymentReference", response.data.reference);
        localStorage.setItem("amount paid", data.amount); // Store amount for verification
        localStorage.setItem("project id", data.projectId); // Store project ID for verification
        window.location.href = response.data.paymentUrl;
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("An error occurred while processing your donation.");
    } finally {
      // Hide loader after processing
      document.getElementById("loader").style.display = "none";
    }
  });

document
  .getElementById("verifyForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // Check if the user is authenticated
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    const formData = new FormData(this);
    const reference = formData.get("reference");

    // Show loader
    document.getElementById("loader").style.display = "flex";

    try {
      const response = await axios.get(`/donations/verify/${reference}`);

      if (response.status === 200) {
        alert(response.data.message);
        // Optionally clear localStorage after successful verification
        localStorage.removeItem("paymentReference");
        localStorage.removeItem("amount paid");
        localStorage.removeItem("project id");
        window.location.href = window.location.href;
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("An error occurred while verifying your donation.");
    } finally {
      // Hide loader after processing
      document.getElementById("loader").style.display = "none";
    }
  });

// Function to pre-fill reference field with value from localStorage
function prefillReference() {
  const reference = localStorage.getItem("paymentReference");
  const amount = localStorage.getItem("amount paid");
  const projectId = localStorage.getItem("project id");

  if (reference) {
    document.getElementById("reference").value = reference;
  }
  if (amount) {
    document.getElementById("paymentAmount").value = amount;
  }
  if (projectId) {
    document.getElementById("paymentProjectId").value = projectId;
  }
}

// Call prefillReference when the verify modal is shown
const verifyModal = document.getElementById("verifyModal");
verifyModal.addEventListener("shown.bs.modal", prefillReference);
