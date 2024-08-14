document.addEventListener("DOMContentLoaded", function () {
  /**
   * Function to load content via AJAX and update the page.
   * @param {string} url - The URL to fetch the content from.
   */
  function loadContent(url) {
    axios
      .get(url)
      .then((response) => {
        document.querySelector(".content-wrapper").innerHTML = response.data;
        initializeEventForm();
        initializeProjectForm();
        initializeChart();
        initializeVisits();
        initializeSearch();
        initializeEventAction();
        initializeProjectAction();
      })
      .catch((error) => {
        console.error("Error loading content:", error);
        document.querySelector(".content-wrapper").innerHTML =
          "<p>Error loading content. Please try again later.</p>";
      });
  }

  /**
   * Function to initialize form functionalities.
   */
  function initializeEventForm() {
    const form = document.getElementById("createEventForm");
    if (form) {
      const addGoalButton = form.querySelector("#addGoalButton");
      const goalsContainer = form.querySelector("#goals-container");

      if (addGoalButton && goalsContainer) {
        addGoalButton.addEventListener("click", function () {
          const newInput = document.createElement("input");
          newInput.type = "text";
          newInput.name = "goals[]";
          newInput.className = "form-control mb-2";
          goalsContainer.appendChild(newInput);
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(form);

        fetch("/events/create", {
          method: "POST",
          body: formData,
        })
          .then((response) =>
            response.ok
              ? response.json()
              : Promise.reject("Something went wrong")
          )
          .then((data) => {
            document.getElementById("successMessage").style.display = "block";
            form.reset();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("There was an error creating the event.");
          });
      });
    }
  }

  function initializeProjectForm() {
    const form = document.getElementById("createProjectForm");
    if (form) {
      const addProjectGoal = form.querySelector(".addProjectGoal");
      const projectGoals = form.querySelector(".projectGoals");

      if (addProjectGoal && projectGoals) {
        addProjectGoal.addEventListener("click", function () {
          const newInput = document.createElement("input");
          newInput.type = "text";
          newInput.name = "goals[]";
          newInput.className = "form-control mb-2";
          projectGoals.appendChild(newInput);
        });
      }

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(form);

        fetch("/projects/create", {
          method: "POST",
          body: formData,
        })
          .then((response) =>
            response.ok
              ? response.json()
              : Promise.reject("Something went wrong")
          )
          .then((data) => {
            document.getElementById("successMessage").style.display = "block";
            form.reset();
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("There was an error creating the project.");
          });
      });
    }
  }

  /**
   * Function to initialize the chart with data.
   */
  function initializeChart() {
    fetch("/dashboard/data")
      .then((response) => response.json())
      .then((data) => {
        const ctx = document.getElementById("donationChart").getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: data.months,
            datasets: [
              {
                label: "Total Donations",
                data: data.amounts,
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }

  function initializeVisits() {
    fetch("/dashboard/visits")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Transform data for Chart.js
        const labels = data.map((entry) => {
          const month = new Date(
            entry._id.year,
            entry._id.month - 1
          ).toLocaleString("default", { month: "short" });
          return `${month} ${entry._id.year}`;
        });
        const visitCounts = data.map((entry) => entry.count);

        const ctx = document.getElementById("visitsChart").getContext("2d");

        new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels, // Month and Year labels
            datasets: [
              {
                label: "Number of Visits",
                data: visitCounts,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Number of Visits",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Month",
                },
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching visit data:", error));
  }

  /**
   * Function to initialize the search functionality.
   */
  function initializeSearch() {
    const searchInput = document.getElementById("searchInput");
    const userCards = document.querySelectorAll(".user-card");

    if (searchInput && userCards.length > 0) {
      searchInput.addEventListener("keyup", function () {
        const filter = searchInput.value.toLowerCase();

        userCards.forEach((card) => {
          const userName = card
            .querySelector(".user-name")
            .textContent.toLowerCase();
          card.style.display = userName.includes(filter) ? "" : "none";
        });
      });
    }
  }

  function initializeEventAction() {
    document.querySelectorAll(".edit").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        const eventId = this.getAttribute("data-id");
        fetch(`/events/${eventId}/edit`)
          .then((response) => response.text())
          .then((html) => {
            createEventSection.innerHTML = html;
          })
          .catch((error) => console.error("Error loading edit form:", error));
      });
    });

    document.querySelectorAll(".delete").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        const eventId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this event?")) {
          fetch(`/events/${eventId}/delete`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Remove the row from the table
                this.closest("tr").remove();
                alert("Event deleted successfully.");
              } else {
                alert("Error deleting event.");
              }
            })
            .catch((error) => console.error("Error deleting event:", error));
        }
      });
    });
  }

  function initializeProjectAction() {
    document.querySelectorAll(".edit-project").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        const projectId = this.getAttribute("data-id");
        fetch(`/projects/${projectId}/edit`)
          .then((response) => response.text())
          .then((html) => {
            createEventSection.innerHTML = html;
          })
          .catch((error) => console.error("Error loading edit form:", error));
      });
    });

    document.querySelectorAll(".delete-project").forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        const projectId = this.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this event?")) {
          fetch(`/projects/${projectId}/delete`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                // Remove the row from the table
                this.closest("tr").remove();
                alert("Event deleted successfully.");
              } else {
                alert("Error deleting event.");
              }
            })
            .catch((error) => console.error("Error deleting event:", error));
        }
      });
    });
  }

  /**
   * Set up the sidebar click event to load content dynamically.
   */
  document
    .querySelector(".sidebar")
    .addEventListener("click", function (event) {
      const target = event.target.closest("a[data-url]");
      if (target) {
        event.preventDefault();
        const url = target.getAttribute("data-url");
        console.log("Loading content from URL:", url);
        loadContent(url);
      }
    });

  // Initialize functionalities on page load
  initializeEventForm();
  initializeProjectForm();
  initializeChart();
  initializeVisits();
  initializeSearch();
  initializeEventAction();
  initializeProjectAction();
});
