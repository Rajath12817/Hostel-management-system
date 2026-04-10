const form = document.getElementById("loginForm");
const errorBox = document.getElementById("loginError");

document.querySelectorAll(".demo-logins button").forEach((button) => {
    button.addEventListener("click", () => {
        document.getElementById("email").value = button.dataset.email;
        document.getElementById("password").value = button.dataset.password;
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.classList.add("d-none");
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                email: document.getElementById("email").value,
                password: document.getElementById("password").value
            })
        });
        const body = await response.json();
        if (!response.ok) {
            throw new Error(body.message || "Login failed");
        }
        localStorage.setItem("hostelUser", JSON.stringify(body));
        window.location.href = "/dashboard.html";
    } catch (error) {
        errorBox.textContent = error.message;
        errorBox.classList.remove("d-none");
    }
});
