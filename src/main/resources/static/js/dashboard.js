const user = JSON.parse(localStorage.getItem("hostelUser") || "null");
const content = document.getElementById("content");
const nav = document.getElementById("sidebarNav");
const pageTitle = document.getElementById("pageTitle");
const alertHost = document.getElementById("alertHost");

if (!user) {
    window.location.href = "/";
}

document.getElementById("activeUser").textContent = `${user.name} (${user.role})`;
document.getElementById("roleLabel").textContent = `${user.role.toLowerCase()} portal`;
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("hostelUser");
    window.location.href = "/";
});

const state = {
    ADMIN: [
        ["dashboard", "Dashboard"],
        ["rooms", "Rooms"],
        ["bills", "Bills"],
        ["reports", "Reports"]
    ],
    WARDEN: [
        ["dashboard", "Dashboard"],
        ["applications", "Applications"],
        ["allocations", "Allocations"],
        ["attendance", "Attendance"],
        ["leave", "Leave Requests"],
        ["complaints", "Complaints"]
    ],
    STUDENT: [
        ["dashboard", "Dashboard"],
        ["applications", "Applications"],
        ["attendance", "Attendance"],
        ["leave", "Leave"],
        ["complaints", "Complaints"],
        ["bills", "Fees"]
    ]
};

function showAlert(message, type = "success") {
    alertHost.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${escapeHtml(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

function setTitle(title) {
    pageTitle.textContent = title;
}

function setActive(key) {
    document.querySelectorAll(".sidebar .nav-link").forEach((link) => {
        link.classList.toggle("active", link.dataset.key === key);
    });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function statusBadge(status) {
    const color = {
        APPROVED: "success",
        PRESENT: "success",
        PAID: "success",
        RESOLVED: "success",
        REJECTED: "danger",
        ABSENT: "danger",
        UNPAID: "warning",
        PENDING: "secondary",
        OPEN: "primary",
        IN_PROGRESS: "info",
        AVAILABLE: "success",
        OCCUPIED: "secondary",
        MAINTENANCE: "warning"
    }[status] || "secondary";
    return `<span class="badge text-bg-${color}">${escapeHtml(status)}</span>`;
}

function table(headers, rows) {
    const headerHtml = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
    const rowHtml = rows.length
        ? rows.join("")
        : `<tr><td colspan="${headers.length}" class="text-center text-muted py-4">No records found</td></tr>`;
    return `<div class="table-responsive"><table class="table align-middle">
        <thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody>
    </table></div>`;
}

function panel(title, body, action = "") {
    return `<section class="panel">
        <div class="panel-header">
            <h2 class="h5 mb-0">${escapeHtml(title)}</h2>
            ${action}
        </div>
        ${body}
    </section>`;
}

function metrics(items) {
    return `<div class="metric-grid">${items.map(([label, value]) => `
        <div class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>
    `).join("")}</div>`;
}

function studentName(item) {
    return item.student?.name || item.name || "Student";
}

async function safe(action) {
    try {
        await action();
    } catch (error) {
        showAlert(error.message, "danger");
    }
}

function installNav() {
    nav.innerHTML = state[user.role].map(([key, label]) =>
        `<button class="nav-link text-start" data-key="${key}">${label}</button>`
    ).join("");
    nav.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => render(button.dataset.key));
    });
}

async function render(key) {
    setActive(key);
    await safe(async () => {
        if (user.role === "ADMIN") await renderAdmin(key);
        if (user.role === "WARDEN") await renderWarden(key);
        if (user.role === "STUDENT") await renderStudent(key);
    });
}

async function renderStudent(key) {
    if (key === "dashboard") {
        setTitle("Student Dashboard");
        const [apps, attendance, complaints, bills] = await Promise.all([
            Api.get(`/api/student/${user.id}/applications`),
            Api.get(`/api/student/${user.id}/attendance`),
            Api.get(`/api/student/${user.id}/complaints`),
            Api.get(`/api/student/${user.id}/bills`)
        ]);
        content.innerHTML = metrics([
            ["Applications", apps.length],
            ["Attendance Records", attendance.length],
            ["Complaints", complaints.length],
            ["Unpaid Bills", bills.filter((bill) => bill.status === "UNPAID").length]
        ]) + panel("Quick Actions", `<div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary" id="applyBtn">Apply Hostel</button>
            <button class="btn btn-outline-primary" data-jump="leave">Request Leave</button>
            <button class="btn btn-outline-primary" data-jump="complaints">Raise Complaint</button>
            <button class="btn btn-outline-primary" data-jump="bills">Pay Fees</button>
        </div>`);
        document.getElementById("applyBtn").addEventListener("click", () => safe(async () => {
            await Api.post(`/api/student/${user.id}/applications`);
            showAlert("Hostel application submitted");
            await render("applications");
        }));
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "applications") {
        setTitle("My Applications");
        const apps = await Api.get(`/api/student/${user.id}/applications`);
        content.innerHTML = panel("Applications", table(["ID", "Status", "Submitted"], apps.map((app) =>
            `<tr><td>${app.id}</td><td>${statusBadge(app.status)}</td><td>${formatDate(app.createdAt)}</td></tr>`)));
        return;
    }
    if (key === "attendance") {
        setTitle("My Attendance");
        const rows = await Api.get(`/api/student/${user.id}/attendance`);
        content.innerHTML = panel("Attendance", table(["Date", "Status"], rows.map((row) =>
            `<tr><td>${formatDate(row.attendanceDate)}</td><td>${statusBadge(row.status)}</td></tr>`)));
        return;
    }
    if (key === "leave") {
        setTitle("Leave Requests");
        const rows = await Api.get(`/api/student/${user.id}/leave-requests`);
        content.innerHTML = panel("Request Leave", `<form id="leaveForm" class="row g-3">
            <div class="col-md-9"><input class="form-control" id="leaveReason" placeholder="Reason for leave" required></div>
            <div class="col-md-3"><button class="btn btn-primary w-100">Submit</button></div>
        </form>`) + panel("My Leave Requests", table(["Reason", "Status", "Created"], rows.map((row) =>
            `<tr><td>${escapeHtml(row.reason)}</td><td>${statusBadge(row.status)}</td><td>${formatDate(row.createdAt)}</td></tr>`)));
        document.getElementById("leaveForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post(`/api/student/${user.id}/leave-requests`, {value: document.getElementById("leaveReason").value});
            showAlert("Leave request submitted");
            await render("leave");
        }));
        return;
    }
    if (key === "complaints") {
        setTitle("Complaints");
        const rows = await Api.get(`/api/student/${user.id}/complaints`);
        content.innerHTML = panel("Raise Complaint", `<form id="complaintForm" class="row g-3">
            <div class="col-md-9"><input class="form-control" id="complaintText" placeholder="Describe the issue" required></div>
            <div class="col-md-3"><button class="btn btn-primary w-100">Submit</button></div>
        </form>`) + panel("My Complaints", table(["Issue", "Status", "Created"], rows.map((row) =>
            `<tr><td>${escapeHtml(row.description)}</td><td>${statusBadge(row.status)}</td><td>${formatDate(row.createdAt)}</td></tr>`)));
        document.getElementById("complaintForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post(`/api/student/${user.id}/complaints`, {value: document.getElementById("complaintText").value});
            showAlert("Complaint raised");
            await render("complaints");
        }));
        return;
    }
    if (key === "bills") {
        setTitle("Fees");
        const [bills, payments] = await Promise.all([
            Api.get(`/api/student/${user.id}/bills`),
            Api.get(`/api/student/${user.id}/payments`)
        ]);
        content.innerHTML = panel("Bills", table(["Bill", "Amount", "Status", "Action"], bills.map((bill) =>
            `<tr>
                <td>#${bill.id}</td>
                <td>₹${bill.amount}</td>
                <td>${statusBadge(bill.status)}</td>
                <td>${bill.status === "UNPAID" ? `<button class="btn btn-sm btn-success" data-pay="${bill.id}">Pay</button>` : ""}</td>
            </tr>`))) + panel("Payment History", table(["Payment", "Bill", "Amount", "Paid At"], payments.map((payment) =>
            `<tr><td>#${payment.id}</td><td>#${payment.bill.id}</td><td>₹${payment.amount}</td><td>${formatDate(payment.paidAt)}</td></tr>`)));
        content.querySelectorAll("[data-pay]").forEach((button) => button.addEventListener("click", () => safe(async () => {
            await Api.post(`/api/student/${user.id}/bills/${button.dataset.pay}/pay`);
            showAlert("Payment recorded");
            await render("bills");
        })));
    }
}

async function renderWarden(key) {
    if (key === "dashboard") {
        setTitle("Warden Dashboard");
        const [apps, leave, complaints, attendance] = await Promise.all([
            Api.get("/api/warden/applications"),
            Api.get("/api/warden/leave-requests"),
            Api.get("/api/warden/complaints"),
            Api.get("/api/warden/attendance")
        ]);
        content.innerHTML = metrics([
            ["Pending Applications", apps.filter((row) => row.status === "PENDING").length],
            ["Pending Leave", leave.filter((row) => row.status === "PENDING").length],
            ["Open Complaints", complaints.filter((row) => row.status !== "RESOLVED").length],
            ["Attendance Records", attendance.length]
        ]) + panel("Work Queue", `<div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary" data-jump="applications">Review Applications</button>
            <button class="btn btn-outline-primary" data-jump="attendance">Mark Attendance</button>
            <button class="btn btn-outline-primary" data-jump="complaints">Resolve Complaints</button>
        </div>`);
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "applications") {
        setTitle("Applications");
        const apps = await Api.get("/api/warden/applications");
        content.innerHTML = panel("Student Applications", table(["Student", "Email", "Status", "Submitted", "Action"], apps.map((app) =>
            `<tr>
                <td>${escapeHtml(studentName(app))}</td>
                <td>${escapeHtml(app.student.email)}</td>
                <td>${statusBadge(app.status)}</td>
                <td>${formatDate(app.createdAt)}</td>
                <td>${app.status === "PENDING" ? `
                    <button class="btn btn-sm btn-success" data-approve-app="${app.id}">Approve</button>
                    <button class="btn btn-sm btn-outline-danger" data-reject-app="${app.id}">Reject</button>` : ""}
                </td>
            </tr>`)));
        bindAction("[data-approve-app]", async (id) => Api.put(`/api/warden/applications/${id}/approve`), "Application approved", "applications");
        bindAction("[data-reject-app]", async (id) => Api.put(`/api/warden/applications/${id}/reject`), "Application rejected", "applications");
        return;
    }
    if (key === "allocations") {
        setTitle("Room Allocations");
        const [students, rooms, allocations] = await Promise.all([
            Api.get("/api/warden/students"),
            Api.get("/api/warden/rooms/available"),
            Api.get("/api/warden/allocations")
        ]);
        content.innerHTML = panel("Allocate Room", `<form id="allocationForm" class="row g-3">
            <div class="col-md-5">${select("allocationStudent", students, "Select student", (row) => row.name)}</div>
            <div class="col-md-5">${select("allocationRoom", rooms, "Select room", (row) => `${row.roomNumber} (${row.capacity} beds)`)}</div>
            <div class="col-md-2"><button class="btn btn-primary w-100">Allocate</button></div>
        </form>`) + panel("Allocations", table(["Student", "Room", "Allocated At"], allocations.map((row) =>
            `<tr><td>${escapeHtml(row.student.name)}</td><td>${escapeHtml(row.room.roomNumber)}</td><td>${formatDate(row.allocatedAt)}</td></tr>`)));
        document.getElementById("allocationForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/warden/allocations", {
                studentId: Number(document.getElementById("allocationStudent").value),
                roomId: Number(document.getElementById("allocationRoom").value)
            });
            showAlert("Room allocated");
            await render("allocations");
        }));
        return;
    }
    if (key === "attendance") {
        setTitle("Attendance");
        const [students, rows] = await Promise.all([Api.get("/api/warden/students"), Api.get("/api/warden/attendance")]);
        content.innerHTML = panel("Mark Attendance", `<form id="attendanceForm" class="row g-3">
            <div class="col-md-4">${select("attendanceStudent", students, "Select student", (row) => row.name)}</div>
            <div class="col-md-3"><input id="attendanceDate" type="date" class="form-control" value="${new Date().toISOString().slice(0, 10)}"></div>
            <div class="col-md-3"><select id="attendanceStatus" class="form-select"><option>PRESENT</option><option>ABSENT</option></select></div>
            <div class="col-md-2"><button class="btn btn-primary w-100">Mark</button></div>
        </form>`) + panel("Attendance Records", table(["Student", "Date", "Status"], rows.map((row) =>
            `<tr><td>${escapeHtml(row.student.name)}</td><td>${formatDate(row.attendanceDate)}</td><td>${statusBadge(row.status)}</td></tr>`)));
        document.getElementById("attendanceForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/warden/attendance", {
                studentId: Number(document.getElementById("attendanceStudent").value),
                date: document.getElementById("attendanceDate").value,
                status: document.getElementById("attendanceStatus").value
            });
            showAlert("Attendance marked");
            await render("attendance");
        }));
        return;
    }
    if (key === "leave") {
        setTitle("Leave Requests");
        const rows = await Api.get("/api/warden/leave-requests");
        content.innerHTML = panel("Leave Requests", table(["Student", "Reason", "Status", "Action"], rows.map((row) =>
            `<tr>
                <td>${escapeHtml(row.student.name)}</td>
                <td>${escapeHtml(row.reason)}</td>
                <td>${statusBadge(row.status)}</td>
                <td>${row.status === "PENDING" ? `
                    <button class="btn btn-sm btn-success" data-approve-leave="${row.id}">Approve</button>
                    <button class="btn btn-sm btn-outline-danger" data-reject-leave="${row.id}">Reject</button>` : ""}
                </td>
            </tr>`)));
        bindAction("[data-approve-leave]", async (id) => Api.put(`/api/warden/leave-requests/${id}/approve`), "Leave approved", "leave");
        bindAction("[data-reject-leave]", async (id) => Api.put(`/api/warden/leave-requests/${id}/reject`), "Leave rejected", "leave");
        return;
    }
    if (key === "complaints") {
        setTitle("Complaints");
        const rows = await Api.get("/api/warden/complaints");
        content.innerHTML = panel("Complaints", table(["Student", "Issue", "Status", "Action"], rows.map((row) =>
            `<tr>
                <td>${escapeHtml(row.student.name)}</td>
                <td>${escapeHtml(row.description)}</td>
                <td>${statusBadge(row.status)}</td>
                <td>${row.status !== "RESOLVED" ? `<button class="btn btn-sm btn-success" data-resolve="${row.id}">Resolve</button>` : ""}</td>
            </tr>`)));
        bindAction("[data-resolve]", async (id) => Api.put(`/api/warden/complaints/${id}/resolve`), "Complaint resolved", "complaints");
    }
}

async function renderAdmin(key) {
    if (key === "dashboard") {
        setTitle("Admin Dashboard");
        const report = await Api.get("/api/admin/reports");
        content.innerHTML = metrics(Object.entries(report)) + panel("Admin Actions", `<div class="d-flex flex-wrap gap-2">
            <button class="btn btn-primary" data-jump="rooms">Manage Rooms</button>
            <button class="btn btn-outline-primary" data-jump="bills">Generate Bills</button>
            <button class="btn btn-outline-primary" data-jump="reports">View Reports</button>
        </div>`);
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "rooms") {
        setTitle("Rooms");
        const rooms = await Api.get("/api/admin/rooms");
        content.innerHTML = panel("Add Room", `<form id="roomForm" class="row g-3">
            <input type="hidden" id="roomId">
            <div class="col-md-3"><input id="roomNumber" class="form-control" placeholder="Room number" required></div>
            <div class="col-md-3"><input id="roomCapacity" type="number" min="1" class="form-control" placeholder="Capacity" required></div>
            <div class="col-md-3"><select id="roomStatus" class="form-select"><option>AVAILABLE</option><option>OCCUPIED</option><option>MAINTENANCE</option></select></div>
            <div class="col-md-3"><button class="btn btn-primary w-100" id="roomSubmit">Save Room</button></div>
        </form>`) + panel("Rooms", table(["Room", "Capacity", "Status", "Action"], rooms.map((room) =>
            `<tr>
                <td>${escapeHtml(room.roomNumber)}</td>
                <td>${room.capacity}</td>
                <td>${statusBadge(room.status)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-edit-room='${JSON.stringify(room)}'>Edit</button>
                    <button class="btn btn-sm btn-outline-danger" data-delete-room="${room.id}">Delete</button>
                </td>
            </tr>`)));
        document.getElementById("roomForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            const roomId = document.getElementById("roomId").value;
            const payload = {
                roomNumber: document.getElementById("roomNumber").value,
                capacity: Number(document.getElementById("roomCapacity").value),
                status: document.getElementById("roomStatus").value
            };
            if (roomId) {
                await Api.put(`/api/admin/rooms/${roomId}`, payload);
                showAlert("Room updated");
            } else {
                await Api.post("/api/admin/rooms", payload);
                showAlert("Room created");
            }
            await render("rooms");
        }));
        content.querySelectorAll("[data-edit-room]").forEach((button) => button.addEventListener("click", () => {
            const room = JSON.parse(button.dataset.editRoom);
            document.getElementById("roomId").value = room.id;
            document.getElementById("roomNumber").value = room.roomNumber;
            document.getElementById("roomCapacity").value = room.capacity;
            document.getElementById("roomStatus").value = room.status;
            document.getElementById("roomSubmit").textContent = "Update Room";
            window.scrollTo({top: 0, behavior: "smooth"});
        }));
        bindAction("[data-delete-room]", async (id) => Api.delete(`/api/admin/rooms/${id}`), "Room deleted", "rooms");
        return;
    }
    if (key === "bills") {
        setTitle("Bills");
        const [students, bills] = await Promise.all([Api.get("/api/admin/students"), Api.get("/api/admin/bills")]);
        content.innerHTML = panel("Generate Bill", `<form id="billForm" class="row g-3">
            <div class="col-md-5">${select("billStudent", students, "Select student", (row) => row.name)}</div>
            <div class="col-md-4"><input id="billAmount" type="number" min="1" step="0.01" class="form-control" placeholder="Amount" required></div>
            <div class="col-md-3"><button class="btn btn-primary w-100">Generate</button></div>
        </form>`) + panel("Bills", table(["Student", "Amount", "Status", "Created"], bills.map((bill) =>
            `<tr><td>${escapeHtml(bill.student.name)}</td><td>₹${bill.amount}</td><td>${statusBadge(bill.status)}</td><td>${formatDate(bill.createdAt)}</td></tr>`)));
        document.getElementById("billForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/admin/bills", {
                studentId: Number(document.getElementById("billStudent").value),
                amount: Number(document.getElementById("billAmount").value)
            });
            showAlert("Bill generated");
            await render("bills");
        }));
        return;
    }
    if (key === "reports") {
        setTitle("Reports");
        const report = await Api.get("/api/admin/reports");
        content.innerHTML = metrics(Object.entries(report)) + panel("Report Table", table(["Metric", "Value"], Object.entries(report).map(([label, value]) =>
            `<tr><td>${escapeHtml(label)}</td><td>${value}</td></tr>`)));
    }
}

function select(id, rows, placeholder, label) {
    const options = rows.map((row) => `<option value="${row.id}">${escapeHtml(label(row))}</option>`).join("");
    return `<select id="${id}" class="form-select" required>
        <option value="" disabled selected>${escapeHtml(placeholder)}</option>${options}
    </select>`;
}

function bindAction(selector, action, message, rerenderKey) {
    content.querySelectorAll(selector).forEach((button) => {
        button.addEventListener("click", () => safe(async () => {
            const id = Object.values(button.dataset)[0];
            await action(id);
            showAlert(message);
            await render(rerenderKey);
        }));
    });
}

function formatDate(value) {
    if (!value) return "";
    return String(value).replace("T", " ").slice(0, 16);
}

installNav();
render("dashboard");
