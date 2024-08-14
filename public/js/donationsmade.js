// Ensure that this script runs after the DOM has loaded
document.addEventListener("DOMContentLoaded", () => {
  if (typeof chartData !== "undefined") {
    const { months, amounts } = chartData;

    // Use the data for your charts or any other purpose
    console.log("Months:", months);
    console.log("Amounts:", amounts);

    // Example: Creating a chart with Chart.js
    const ctx = document.getElementById("donationChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Monthly Donations",
            data: amounts,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  } else {
    console.error("chartData is not defined");
  }
});
