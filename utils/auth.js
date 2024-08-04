export function isAuthenticated() {
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1]; // Ensure we are extracting the actual token value
  console.log("Token:", token); // Log to check if token is being read correctly
  return token ? true : false;
}

export function redirectToLogin() {
  console.log("Redirecting to login"); // Log redirection
  window.location.href = "/login";
}

// export { isAuthenticated, redirectToLogin };
