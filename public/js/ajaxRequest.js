document.addEventListener("DOMContentLoaded", function () {
  function loadContent(url) {
    axios
      .get(url)
      .then((response) => {
        document.querySelector(".content-wrapper").innerHTML = response.data;

        // Initialize the form and its event handlers
        initializeForm();
      })
      .catch((error) => {
        console.error("Error loading content:", error);
        document.querySelector(".content-wrapper").innerHTML =
          "<p>Error loading content. Please try again later.</p>";
      });
  }

  function initializeForm() {
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
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Something went wrong");
            }
          })
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

  // Initialize the form if it exists on the initial load
  initializeForm();
});
