
// Demo admin credentials
const ADMIN_EMAIL = "admin@demo.com";
const ADMIN_PASSWORD = "Admin123";

// Get registered users from localStorage
function getUsers() {
    try {
        const data = JSON.parse(localStorage.getItem("users") || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        return [];
    }
}

// Display messages
function showMessage(text, color) {
    const message = document.getElementById("message");
    message.textContent = text;
    message.style.color = color;
}

// Hide all main sections
function hideAllSections() {
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("dashboardSection").classList.add("hidden");
    document.getElementById("adminSection").classList.add("hidden");
}

// Show registration form
function showRegister() {
    hideAllSections();
    document.getElementById("registerSection").classList.remove("hidden");
    showMessage("", "");
}

// Show login form
function showLogin() {
    hideAllSections();
    document.getElementById("loginSection").classList.remove("hidden");
    showMessage("", "");
}

// Register a new user
function registerUser() {
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim().toLowerCase();
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        showMessage("Please fill in all fields!", "red");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must contain at least 6 characters.", "red");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage("Please enter a valid email address.", "red");
        return;
    }

    if (email === ADMIN_EMAIL) {
        showMessage("This email is reserved for the demo admin.", "red");
        return;
    }

    const users = getUsers();

    const exists = users.some(user => user.email === email);

    if (exists) {
        showMessage("This email is already registered!", "red");
        return;
    }

    const newUser = {
        name: name,
        email: email,
        password: password,
        registeredOn: new Date().toLocaleString()
    };

    users.push(newUser);

    // Save registered users
    localStorage.setItem("users", JSON.stringify(users));

    document.getElementById("regName").value = "";
    document.getElementById("regEmail").value = "";
    document.getElementById("regPassword").value = "";

    showLogin();
    showMessage("Registration successful! Please login.", "green");
}

// Login user or admin
function loginUser() {
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showMessage("Please enter email and password.", "red");
        return;
    }

    // Check demo admin login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem("loggedInUser", JSON.stringify({
            name: "Administrator",
            email: ADMIN_EMAIL,
            role: "admin"
        }));

        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";

        showAdminDashboard();
        showMessage("Admin login successful!", "green");
        return;
    }

    // Check registered user credentials
    const users = getUsers();

    const user = users.find(item =>
        item.email === email && item.password === password
    );

    if (!user) {
        showMessage("Invalid email or password!", "red");
        return;
    }

    // Store only necessary user information in the session
    sessionStorage.setItem("loggedInUser", JSON.stringify({
        name: user.name,
        email: user.email,
        role: "user"
    }));

    document.getElementById("loginEmail").value = "";
    document.getElementById("loginPassword").value = "";

    showUserDashboard();
    showMessage("Login successful!", "green");
}

// Display regular user dashboard
function showUserDashboard() {
    const session = sessionStorage.getItem("loggedInUser");

    if (!session) {
        showLogin();
        return;
    }

    const user = JSON.parse(session);

    if (user.role !== "user") {
        showLogin();
        return;
    }

    hideAllSections();

    document.getElementById("dashboardSection").classList.remove("hidden");
    document.getElementById("welcomeMessage").textContent =
        "Hello, " + user.name + "!";

    document.getElementById("currentEmail").textContent =
        "Email: " + user.email;
}

// Display admin dashboard and all registered users
function showAdminDashboard() {
    const session = sessionStorage.getItem("loggedInUser");

    if (!session) {
        showLogin();
        return;
    }

    const admin = JSON.parse(session);

    // Only the admin session can access this dashboard
    if (admin.role !== "admin" || admin.email !== ADMIN_EMAIL) {
        showUserDashboard();
        showMessage("Access denied. Admin only.", "red");
        return;
    }

    hideAllSections();
    document.getElementById("adminSection").classList.remove("hidden");

    const users = getUsers();
    const tableBody = document.getElementById("userTableBody");
    const emptyMessage = document.getElementById("emptyMessage");

    // Update total registered user count
    document.getElementById("totalUsers").textContent = users.length;

    // Clear previous table rows
    tableBody.replaceChildren();

    if (users.length === 0) {
        emptyMessage.classList.remove("hidden");
        return;
    }

    emptyMessage.classList.add("hidden");

    // Create a table row for each registered user
    users.forEach(function(user, index) {
        const row = document.createElement("tr");

        const numberCell = document.createElement("td");
        numberCell.textContent = index + 1;

        const nameCell = document.createElement("td");
        nameCell.textContent = user.name;

        const emailCell = document.createElement("td");
        emailCell.textContent = user.email;

        const dateCell = document.createElement("td");
        dateCell.textContent = user.registeredOn || "Not available";

        row.append(numberCell, nameCell, emailCell, dateCell);
        tableBody.appendChild(row);
    });
}

// Logout user or admin
function logoutUser() {
    sessionStorage.removeItem("loggedInUser");

    hideAllSections();
    document.getElementById("loginSection").classList.remove("hidden");

    showMessage("Logged out successfully!", "green");
}

// Restore the current session when the page loads
window.addEventListener("DOMContentLoaded", function() {
    const session = sessionStorage.getItem("loggedInUser");

    if (!session) {
        showLogin();
        return;
    }

    try {
        const user = JSON.parse(session);

        if (user.role === "admin" && user.email === ADMIN_EMAIL) {
            showAdminDashboard();
        } else if (user.role === "user") {
            showUserDashboard();
        } else {
            sessionStorage.removeItem("loggedInUser");
            showLogin();
        }
    } catch (error) {
        sessionStorage.removeItem("loggedInUser");
        showLogin();
    }
});