const user = JSON.parse(localStorage.getItem("hostelUser") || "null");
const content = document.getElementById("content");
const nav = document.getElementById("sidebarNav");
const pageTitle = document.getElementById("pageTitle");
const alertHost = document.getElementById("alertHost");
const toastHost = document.getElementById("toastHost");

if (!user) {
    window.location.href = "/";
}

const menu = {
    ADMIN: [["dashboard", "Dashboard", "layout-dashboard"], ["rooms", "Rooms", "building-2"], ["bills", "Billing", "receipt"], ["reports", "Reports", "bar-chart-3"]],
    WARDEN: [["dashboard", "Dashboard", "layout-dashboard"], ["applications", "Applications", "clipboard-check"], ["allocations", "Allocations", "bed"], ["attendance", "Attendance", "calendar-check"], ["leave", "Leave", "plane"], ["complaints", "Complaints", "message-square-warning"]],
    STUDENT: [["dashboard", "Dashboard", "layout-dashboard"], ["applications", "Applications", "file-plus"], ["attendance", "Attendance", "calendar-days"], ["leave", "Leave", "plane"], ["complaints", "Complaints", "message-square"], ["bills", "Fees", "wallet"]]
};

let tableId = 0;
document.documentElement.dataset.theme = localStorage.getItem("hostelTheme") || "light";
document.getElementById("activeUser").textContent = `${user.name} (${user.role})`;
document.getElementById("roleLabel").textContent = `${user.role.toLowerCase()} portal`;
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("hostelUser");
    window.location.href = "/";
});
document.getElementById("sidebarToggle").addEventListener("click", () => {
    document.body.classList.toggle("sidebar-collapsed");
    drawIcons();
});
document.getElementById("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("hostelTheme", next);
    document.getElementById("themeToggle").innerHTML = `<i data-lucide="${next === "dark" ? "sun" : "moon"}"></i>`;
    drawIcons();
});

function drawIcons() {
    if (window.lucide) window.lucide.createIcons();
}

function toast(message, type = "success") {
    const id = `toast-${Date.now()}`;
    toastHost.insertAdjacentHTML("beforeend", `<div id="${id}" class="toast align-items-center text-bg-${type === "danger" ? "danger" : "success"} border-0" role="alert"><div class="d-flex"><div class="toast-body">${escapeHtml(message)}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div></div>`);
    const element = document.getElementById(id);
    const instance = new bootstrap.Toast(element, {delay: 2800});
    instance.show();
    element.addEventListener("hidden.bs.toast", () => element.remove());
}

function showAlert(message, type = "danger") {
    alertHost.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${escapeHtml(message)}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}

function showLoading() {
    content.innerHTML = `<div class="loading-state"><div class="text-center"><div class="spinner-border text-primary mb-3"></div><div class="fw-bold">Loading workspace...</div></div></div>`;
}

async function safe(action) {
    try {
        alertHost.innerHTML = "";
        await action();
    } catch (error) {
        showAlert(error.message);
        toast(error.message, "danger");
    } finally {
        drawIcons();
    }
}

function installNav() {
    nav.innerHTML = menu[user.role].map(([key, label, icon]) => `<button class="nav-link text-start" data-key="${key}"><i data-lucide="${icon}"></i><span class="nav-text">${label}</span></button>`).join("");
    nav.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => render(button.dataset.key)));
    drawIcons();
}

async function render(key) {
    setActive(key);
    showLoading();
    await safe(async () => {
        if (user.role === "ADMIN") await renderAdmin(key);
        if (user.role === "WARDEN") await renderWarden(key);
        if (user.role === "STUDENT") await renderStudent(key);
        content.classList.remove("content-transition");
        void content.offsetWidth;
        content.classList.add("content-transition");
        enhanceTables();
        animateCounters();
        bindAfterRender();
    });
}

function setActive(key) {
    document.querySelectorAll(".sidebar .nav-link").forEach((link) => link.classList.toggle("active", link.dataset.key === key));
}

function setTitle(title) {
    pageTitle.textContent = title;
}

function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function statusBadge(status) {
    const color = {APPROVED: "success", PRESENT: "success", PAID: "success", RESOLVED: "success", REJECTED: "danger", ABSENT: "danger", UNPAID: "warning", PENDING: "secondary", OPEN: "primary", IN_PROGRESS: "info", AVAILABLE: "success", OCCUPIED: "secondary", MAINTENANCE: "warning"}[status] || "secondary";
    return `<span class="badge text-bg-${color}">${escapeHtml(status)}</span>`;
}

function metrics(items) {
    return `<div class="metric-grid">${items.map(([label, value]) => `<div class="metric-card"><span>${escapeHtml(label)}</span><strong class="counter" data-count="${Number(value) || 0}">0</strong></div>`).join("")}</div>`;
}

function panel(title, body, action = "") {
    return `<section class="panel"><div class="panel-header"><h2 class="h5 mb-0">${escapeHtml(title)}</h2>${action}</div>${body}</section>`;
}

function table(headers, rows) {
    const id = `table-${++tableId}`;
    const headerHtml = headers.map((header, index) => `<th data-sort-index="${index}">${escapeHtml(header)} <i data-lucide="chevrons-up-down"></i></th>`).join("");
    const rowHtml = rows.length ? rows.join("") : `<tr><td colspan="${headers.length}" class="text-center text-muted py-4">No records found</td></tr>`;
    return `<div class="table-shell" data-table-shell="${id}"><div class="table-toolbar"><input class="form-control table-search" placeholder="Search records..." data-table-search="${id}"><div class="small text-muted" data-table-info="${id}"></div></div><div class="table-responsive"><table id="${id}" class="table align-middle data-table"><thead><tr>${headerHtml}</tr></thead><tbody>${rowHtml}</tbody></table></div><nav class="mt-3"><ul class="pagination pagination-sm justify-content-end mb-0" data-table-pages="${id}"></ul></nav></div>`;
}

function enhanceTables() {
    document.querySelectorAll(".data-table").forEach((dataTable) => {
        const pageSize = 8;
        let page = 1;
        let sortIndex = null;
        let sortDirection = 1;
        const rows = Array.from(dataTable.querySelectorAll("tbody tr"));
        const search = document.querySelector(`[data-table-search="${dataTable.id}"]`);
        const pager = document.querySelector(`[data-table-pages="${dataTable.id}"]`);
        const info = document.querySelector(`[data-table-info="${dataTable.id}"]`);
        function filteredRows() {
            const query = (search?.value || "").toLowerCase();
            let visible = rows.filter((row) => row.innerText.toLowerCase().includes(query));
            if (sortIndex !== null) {
                visible = visible.sort((a, b) => {
                    const av = a.children[sortIndex]?.innerText || "";
                    const bv = b.children[sortIndex]?.innerText || "";
                    return av.localeCompare(bv, undefined, {numeric: true}) * sortDirection;
                });
            }
            return visible;
        }
        function draw() {
            const visible = filteredRows();
            const pages = Math.max(1, Math.ceil(visible.length / pageSize));
            page = Math.min(page, pages);
            rows.forEach((row) => row.style.display = "none");
            visible.slice((page - 1) * pageSize, page * pageSize).forEach((row) => {
                dataTable.querySelector("tbody").appendChild(row);
                row.style.display = "";
            });
            if (info) info.textContent = `${visible.length} record${visible.length === 1 ? "" : "s"}`;
            if (pager) {
                pager.innerHTML = Array.from({length: pages}, (_, index) => `<li class="page-item ${page === index + 1 ? "active" : ""}"><button class="page-link" data-page="${index + 1}">${index + 1}</button></li>`).join("");
                pager.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
                    page = Number(button.dataset.page);
                    draw();
                }));
            }
        }
        search?.addEventListener("input", () => {
            page = 1;
            draw();
        });
        dataTable.querySelectorAll("th[data-sort-index]").forEach((th) => th.addEventListener("click", () => {
            const next = Number(th.dataset.sortIndex);
            sortDirection = sortIndex === next ? sortDirection * -1 : 1;
            sortIndex = next;
            draw();
        }));
        draw();
    });
}

function animateCounters() {
    document.querySelectorAll(".counter").forEach((counter) => {
        const target = Number(counter.dataset.count || 0);
        const start = performance.now();
        function tick(now) {
            const progress = Math.min((now - start) / 650, 1);
            counter.textContent = Math.round(target * progress);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

function bindAction(selector, action, message, rerenderKey) {
    content.querySelectorAll(selector).forEach((button) => {
        button.addEventListener("click", () => safe(async () => {
            const id = Object.values(button.dataset)[0];
            await action(id);
            toast(message);
            await render(rerenderKey);
        }));
    });
}

function select(id, rows, placeholder, label) {
    const options = rows.map((row) => `<option value="${row.id}">${escapeHtml(label(row))}</option>`).join("");
    return `<select id="${id}" class="form-select" required><option value="" disabled selected>${escapeHtml(placeholder)}</option>${options}</select>`;
}

function actions(buttons) {
    return `<div class="table-actions">${buttons.filter(Boolean).join("")}</div>`;
}

function viewButton(payload) {
    return `<button class="btn btn-sm btn-outline-primary" data-view='${escapeHtml(JSON.stringify(payload))}'><i data-lucide="eye"></i> View</button>`;
}

function bindAfterRender() {
    content.querySelectorAll("[data-view]").forEach((button) => {
        button.addEventListener("click", () => showDetails(JSON.parse(button.dataset.view)));
    });
    content.querySelectorAll("[data-receipt]").forEach((button) => {
        button.addEventListener("click", () => downloadReceipt(button.dataset.receipt));
    });
    drawIcons();
}

function showDetails(payload) {
    const id = `modal-${Date.now()}`;
    document.body.insertAdjacentHTML("beforeend", `<div class="modal fade" id="${id}" tabindex="-1"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">${escapeHtml(payload.title || "Details")}</h5><button type="button" class="btn-close" data-bs-dismiss="modal"></button></div><div class="modal-body">${Object.entries(payload).filter(([key]) => key !== "title").map(([key, value]) => `<div class="d-flex justify-content-between border-bottom py-2"><span class="text-muted">${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div></div></div></div>`);
    const element = document.getElementById(id);
    const modal = new bootstrap.Modal(element);
    modal.show();
    element.addEventListener("hidden.bs.modal", () => element.remove());
}

async function downloadReceipt(paymentId) {
    try {
        const response = await fetch(`/receipt/${paymentId}`);
        if (!response.ok) {
            const body = await response.json();
            throw new Error(body.message || "Could not download receipt");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt-${paymentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        toast("Receipt downloaded");
    } catch (error) {
        showAlert(error.message);
        toast(error.message, "danger");
    }
}

function formatDate(value) {
    if (!value) return "";
    return String(value).replace("T", " ").slice(0, 16);
}

function attendanceSummaryBlock(summary) {
    return metrics([["Present", summary.presentDays], ["Absent", summary.absentDays], ["Attendance %", summary.percentage]]) +
        panel("Attendance Progress", `<div class="progress" style="height: 16px;"><div class="progress-bar bg-success" role="progressbar" style="width: ${summary.percentage}%">${summary.percentage}%</div></div><p class="text-muted mt-2 mb-0">Based on ${summary.totalDays} marked day${summary.totalDays === 1 ? "" : "s"}.</p>`);
}

function leaveDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
    return Math.floor((end - start) / 86400000) + 1;
}

async function renderStudent(key) {
    if (key === "dashboard") {
        setTitle("Student Dashboard");
        const [apps, attendance, complaints, bills, summary] = await Promise.all([
            Api.get(`/api/student/${user.id}/applications`),
            Api.get(`/api/student/${user.id}/attendance`),
            Api.get(`/api/student/${user.id}/complaints`),
            Api.get(`/api/student/${user.id}/bills`),
            Api.get(`/attendance/summary/${user.id}`)
        ]);
        const alreadyApplied = apps.length > 0;
        content.innerHTML = metrics([["Applications", apps.length], ["Attendance %", summary.percentage], ["Complaints", complaints.length], ["Unpaid Bills", bills.filter((bill) => bill.status === "UNPAID").length]]) +
            panel("Quick Actions", `<div class="d-flex flex-wrap gap-2"><button class="btn btn-primary" id="applyBtn" ${alreadyApplied ? "disabled title=\"You have already applied\"" : ""}><i data-lucide="file-plus"></i> ${alreadyApplied ? "You have already applied" : "Apply Hostel"}</button><button class="btn btn-outline-primary" data-jump="leave">Request Leave</button><button class="btn btn-outline-primary" data-jump="complaints">Raise Complaint</button><button class="btn btn-outline-primary" data-jump="bills">Pay Fees</button></div>`);
        if (!alreadyApplied) {
            document.getElementById("applyBtn").addEventListener("click", () => safe(async () => {
                await Api.post(`/api/student/${user.id}/applications`);
                toast("Hostel application submitted");
                await render("applications");
            }));
        }
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "applications") {
        setTitle("My Applications");
        const apps = await Api.get(`/api/student/${user.id}/applications`);
        content.innerHTML = panel("Applications", table(["ID", "Status", "Submitted", "Action"], apps.map((app) => `<tr><td>#${app.id}</td><td>${statusBadge(app.status)}</td><td>${formatDate(app.createdAt)}</td><td>${viewButton({title: "Application", ID: `#${app.id}`, Status: app.status, Submitted: formatDate(app.createdAt)})}</td></tr>`)));
        return;
    }
    if (key === "attendance") {
        setTitle("My Attendance");
        const [rows, summary] = await Promise.all([
            Api.get(`/api/student/${user.id}/attendance`),
            Api.get(`/attendance/summary/${user.id}`)
        ]);
        content.innerHTML = attendanceSummaryBlock(summary) + panel("Attendance", table(["Date", "Status"], rows.map((row) => `<tr class="${row.status === "PRESENT" ? "attendance-present" : "attendance-absent"}" title="${row.status} on ${formatDate(row.attendanceDate)}"><td>${formatDate(row.attendanceDate)}</td><td>${statusBadge(row.status)}</td></tr>`)));
        return;
    }
    if (key === "leave") {
        setTitle("Leave Requests");
        const rows = await Api.get(`/api/student/${user.id}/leave-requests`);
        content.innerHTML = panel("Request Leave", `<form id="leaveForm" class="row g-3"><div class="col-md-4"><input class="form-control" id="leaveReason" placeholder="Reason for leave" required></div><div class="col-md-2"><input id="leaveStart" type="date" class="form-control" required></div><div class="col-md-2"><input id="leaveEnd" type="date" class="form-control" required></div><div class="col-md-2"><div class="form-control bg-transparent" id="leaveDays">0 days</div></div><div class="col-md-2"><button class="btn btn-primary w-100">Submit</button></div></form>`) +
            panel("My Leave Requests", table(["Reason", "From", "To", "Days", "Status", "Action"], rows.map((row) => `<tr><td>${escapeHtml(row.reason)}</td><td>${formatDate(row.startDate)}</td><td>${formatDate(row.endDate)}</td><td>${row.totalDays}</td><td>${statusBadge(row.status)}</td><td>${viewButton({title: "Leave Request", Reason: row.reason, From: formatDate(row.startDate), To: formatDate(row.endDate), Days: row.totalDays, Status: row.status})}</td></tr>`)));
        const updateDays = () => {
            const days = leaveDays(document.getElementById("leaveStart").value, document.getElementById("leaveEnd").value);
            document.getElementById("leaveDays").textContent = days ? `${days} day${days === 1 ? "" : "s"}` : "Invalid range";
        };
        document.getElementById("leaveStart").addEventListener("change", updateDays);
        document.getElementById("leaveEnd").addEventListener("change", updateDays);
        document.getElementById("leaveForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            const startDate = document.getElementById("leaveStart").value;
            const endDate = document.getElementById("leaveEnd").value;
            if (!leaveDays(startDate, endDate)) throw new Error("Please select a valid leave date range");
            await Api.post(`/api/student/${user.id}/leave-requests`, {reason: document.getElementById("leaveReason").value, startDate, endDate});
            toast("Leave request submitted");
            await render("leave");
        }));
        return;
    }
    if (key === "complaints") {
        setTitle("Complaints");
        const rows = await Api.get(`/api/student/${user.id}/complaints`);
        content.innerHTML = panel("Raise Complaint", `<form id="complaintForm" class="row g-3"><div class="col-md-9"><input class="form-control" id="complaintText" placeholder="Describe the issue" required></div><div class="col-md-3"><button class="btn btn-primary w-100">Submit</button></div></form>`) +
            panel("My Complaints", table(["Issue", "Status", "Created", "Action"], rows.map((row) => `<tr><td>${escapeHtml(row.description)}</td><td>${statusBadge(row.status)}</td><td>${formatDate(row.createdAt)}</td><td>${viewButton({title: "Complaint", Issue: row.description, Status: row.status, Created: formatDate(row.createdAt)})}</td></tr>`)));
        document.getElementById("complaintForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post(`/api/student/${user.id}/complaints`, {value: document.getElementById("complaintText").value});
            toast("Complaint raised");
            await render("complaints");
        }));
        return;
    }
    if (key === "bills") {
        setTitle("Fees");
        const [bills, payments] = await Promise.all([Api.get(`/api/student/${user.id}/bills`), Api.get(`/api/student/${user.id}/payments`)]);
        content.innerHTML = panel("Bills", table(["Bill", "Amount", "Status", "Action"], bills.map((bill) => `<tr><td>#${bill.id}</td><td>INR ${bill.amount}</td><td>${statusBadge(bill.status)}</td><td>${actions([viewButton({title: "Bill", Bill: `#${bill.id}`, Amount: `INR ${bill.amount}`, Status: bill.status}), bill.status === "UNPAID" ? `<button class="btn btn-sm btn-success" data-pay="${bill.id}"><i data-lucide="credit-card"></i> Pay</button>` : ""])}</td></tr>`))) +
            panel("Payment History", table(["Payment", "Bill", "Amount", "Paid At", "Action"], payments.map((payment) => `<tr><td>#${payment.id}</td><td>#${payment.bill.id}</td><td>INR ${payment.amount}</td><td>${formatDate(payment.paidAt)}</td><td>${actions([viewButton({title: "Payment", Payment: `#${payment.id}`, Bill: `#${payment.bill.id}`, Amount: `INR ${payment.amount}`, Date: formatDate(payment.paidAt), Status: payment.bill.status}), `<button class="btn btn-sm btn-outline-primary" data-receipt="${payment.id}"><i data-lucide="download"></i> Download</button>`])}</td></tr>`)));
        content.querySelectorAll("[data-pay]").forEach((button) => button.addEventListener("click", () => safe(async () => {
            await Api.post(`/api/student/${user.id}/bills/${button.dataset.pay}/pay`);
            toast("Payment recorded");
            await render("bills");
        })));
    }
}

async function renderWarden(key) {
    if (key === "dashboard") {
        setTitle("Warden Dashboard");
        const [apps, leave, complaints, attendance] = await Promise.all([Api.get("/api/warden/applications"), Api.get("/api/warden/leave-requests"), Api.get("/api/warden/complaints"), Api.get("/api/warden/attendance")]);
        content.innerHTML = metrics([["Pending Applications", apps.filter((row) => row.status === "PENDING").length], ["Pending Leave", leave.filter((row) => row.status === "PENDING").length], ["Open Complaints", complaints.filter((row) => row.status !== "RESOLVED").length], ["Attendance Records", attendance.length]]) +
            panel("Work Queue", `<div class="d-flex flex-wrap gap-2"><button class="btn btn-primary" data-jump="applications">Review Applications</button><button class="btn btn-outline-primary" data-jump="attendance">Mark Attendance</button><button class="btn btn-outline-primary" data-jump="complaints">Resolve Complaints</button></div>`);
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "applications") {
        setTitle("Applications");
        const apps = await Api.get("/api/warden/applications");
        content.innerHTML = panel("Student Applications", table(["Student", "Email", "Status", "Submitted", "Action"], apps.map((app) => `<tr><td>${escapeHtml(app.student.name)}</td><td>${escapeHtml(app.student.email)}</td><td>${statusBadge(app.status)}</td><td>${formatDate(app.createdAt)}</td><td>${actions([viewButton({title: "Application", Student: app.student.name, Email: app.student.email, Status: app.status, Submitted: formatDate(app.createdAt)}), app.status === "PENDING" ? `<button class="btn btn-sm btn-success" data-approve-app="${app.id}">Approve</button>` : "", app.status === "PENDING" ? `<button class="btn btn-sm btn-outline-danger" data-reject-app="${app.id}">Reject</button>` : ""])}</td></tr>`)));
        bindAction("[data-approve-app]", async (id) => Api.put(`/api/warden/applications/${id}/approve`), "Application approved", "applications");
        bindAction("[data-reject-app]", async (id) => Api.put(`/api/warden/applications/${id}/reject`), "Application rejected", "applications");
        return;
    }
    if (key === "allocations") {
        setTitle("Room Allocations");
        const [students, rooms, allocations] = await Promise.all([Api.get("/api/warden/students"), Api.get("/api/warden/rooms/available"), Api.get("/api/warden/allocations")]);
        content.innerHTML = panel("Allocate Room", `<form id="allocationForm" class="row g-3"><div class="col-md-5">${select("allocationStudent", students, "Select student", (row) => row.name)}</div><div class="col-md-5">${select("allocationRoom", rooms, "Select room", (row) => `${row.roomNumber} (${row.capacity} beds)`)}</div><div class="col-md-2"><button class="btn btn-primary w-100">Allocate</button></div></form>`) +
            panel("Allocations", table(["Student", "Room", "Allocated At", "Action"], allocations.map((row) => `<tr><td>${escapeHtml(row.student.name)}</td><td>${escapeHtml(row.room.roomNumber)}</td><td>${formatDate(row.allocatedAt)}</td><td>${viewButton({title: "Allocation", Student: row.student.name, Room: row.room.roomNumber, Date: formatDate(row.allocatedAt)})}</td></tr>`)));
        document.getElementById("allocationForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/warden/allocations", {studentId: Number(document.getElementById("allocationStudent").value), roomId: Number(document.getElementById("allocationRoom").value)});
            toast("Room allocated");
            await render("allocations");
        }));
        return;
    }
    if (key === "attendance") {
        setTitle("Attendance");
        const today = new Date().toISOString().slice(0, 10);
        const [students, rows] = await Promise.all([Api.get("/api/warden/students"), Api.get(`/api/warden/attendance?date=${today}`)]);
        const attendanceRows = (items) => table(["Student", "Date", "Status"], items.map((row) => `<tr class="${row.status === "PRESENT" ? "attendance-present" : "attendance-absent"}" title="${row.student.name} was ${row.status} on ${formatDate(row.attendanceDate)}"><td>${escapeHtml(row.student.name)}</td><td>${formatDate(row.attendanceDate)}</td><td>${statusBadge(row.status)}</td></tr>`));
        content.innerHTML = panel("Mark Attendance", `<form id="attendanceForm" class="row g-3"><div class="col-md-4">${select("attendanceStudent", students, "Select student", (row) => row.name)}</div><div class="col-md-3"><input id="attendanceDate" type="date" class="form-control" value="${today}"></div><div class="col-md-3"><select id="attendanceStatus" class="form-select" required><option value="" disabled selected>Select status</option><option>PRESENT</option><option>ABSENT</option></select></div><div class="col-md-2"><button class="btn btn-primary w-100">Mark</button></div></form>`) +
            panel("Attendance Records", `<div id="attendanceTableHost">${attendanceRows(rows)}</div>`);
        const reloadDateAttendance = async () => {
            const date = document.getElementById("attendanceDate").value;
            document.getElementById("attendanceStudent").selectedIndex = 0;
            document.getElementById("attendanceStatus").selectedIndex = 0;
            const records = await Api.get(`/api/warden/attendance?date=${date}`);
            document.getElementById("attendanceTableHost").innerHTML = attendanceRows(records);
            enhanceTables();
            drawIcons();
        };
        document.getElementById("attendanceDate").addEventListener("change", () => safe(reloadDateAttendance));
        document.getElementById("attendanceForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/warden/attendance", {studentId: Number(document.getElementById("attendanceStudent").value), date: document.getElementById("attendanceDate").value, status: document.getElementById("attendanceStatus").value});
            toast("Attendance marked");
            await reloadDateAttendance();
        }));
        return;
    }
    if (key === "leave") {
        setTitle("Leave Requests");
        const rows = await Api.get("/api/warden/leave-requests");
        content.innerHTML = panel("Leave Requests", table(["Student", "Reason", "From", "To", "Days", "Status", "Action"], rows.map((row) => `<tr><td>${escapeHtml(row.student.name)}</td><td>${escapeHtml(row.reason)}</td><td>${formatDate(row.startDate)}</td><td>${formatDate(row.endDate)}</td><td>${row.totalDays}</td><td>${statusBadge(row.status)}</td><td>${actions([viewButton({title: "Leave Request", Student: row.student.name, Reason: row.reason, From: formatDate(row.startDate), To: formatDate(row.endDate), Days: row.totalDays, Status: row.status}), row.status === "PENDING" ? `<button class="btn btn-sm btn-success" data-approve-leave="${row.id}">Approve</button>` : "", row.status === "PENDING" ? `<button class="btn btn-sm btn-outline-danger" data-reject-leave="${row.id}">Reject</button>` : ""])}</td></tr>`)));
        bindAction("[data-approve-leave]", async (id) => Api.put(`/api/warden/leave-requests/${id}/approve`), "Leave approved", "leave");
        bindAction("[data-reject-leave]", async (id) => Api.put(`/api/warden/leave-requests/${id}/reject`), "Leave rejected", "leave");
        return;
    }
    if (key === "complaints") {
        setTitle("Complaints");
        const rows = await Api.get("/api/warden/complaints");
        content.innerHTML = panel("Complaints", table(["Student", "Issue", "Status", "Action"], rows.map((row) => `<tr><td>${escapeHtml(row.student.name)}</td><td>${escapeHtml(row.description)}</td><td>${statusBadge(row.status)}</td><td>${actions([viewButton({title: "Complaint", Student: row.student.name, Issue: row.description, Status: row.status}), row.status !== "RESOLVED" ? `<button class="btn btn-sm btn-success" data-resolve="${row.id}">Resolve</button>` : ""])}</td></tr>`)));
        bindAction("[data-resolve]", async (id) => Api.put(`/api/warden/complaints/${id}/resolve`), "Complaint resolved", "complaints");
    }
}

async function renderAdmin(key) {
    if (key === "dashboard") {
        setTitle("Admin Dashboard");
        const report = await Api.get("/api/admin/reports");
        content.innerHTML = metrics(Object.entries(report)) + panel("Admin Actions", `<div class="d-flex flex-wrap gap-2"><button class="btn btn-primary" data-jump="rooms">Manage Rooms</button><button class="btn btn-outline-primary" data-jump="bills">Generate Bills</button><button class="btn btn-outline-primary" data-jump="reports">View Reports</button></div>`);
        content.querySelectorAll("[data-jump]").forEach((button) => button.addEventListener("click", () => render(button.dataset.jump)));
        return;
    }
    if (key === "rooms") {
        setTitle("Rooms");
        const rooms = await Api.get("/api/admin/rooms");
        content.innerHTML = panel("Add Room", `<form id="roomForm" class="row g-3"><input type="hidden" id="roomId"><div class="col-md-3"><input id="roomNumber" class="form-control" placeholder="Room number" required></div><div class="col-md-3"><input id="roomCapacity" type="number" min="1" class="form-control" placeholder="Capacity" required></div><div class="col-md-3"><select id="roomStatus" class="form-select"><option>AVAILABLE</option><option>OCCUPIED</option><option>MAINTENANCE</option></select></div><div class="col-md-3"><button class="btn btn-primary w-100" id="roomSubmit">Save Room</button></div></form>`) +
            panel("Rooms", table(["Room", "Capacity", "Status", "Action"], rooms.map((room) => `<tr><td>${escapeHtml(room.roomNumber)}</td><td>${room.capacity}</td><td>${statusBadge(room.status)}</td><td>${actions([viewButton({title: "Room", Room: room.roomNumber, Capacity: room.capacity, Status: room.status}), `<button class="btn btn-sm btn-outline-primary" data-edit-id="${room.id}" data-edit-number="${escapeHtml(room.roomNumber)}" data-edit-capacity="${room.capacity}" data-edit-status="${room.status}">Edit</button>`, `<button class="btn btn-sm btn-outline-danger" data-delete-room="${room.id}">Delete</button>`])}</td></tr>`)));
        document.getElementById("roomForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            const roomId = document.getElementById("roomId").value;
            const payload = {roomNumber: document.getElementById("roomNumber").value, capacity: Number(document.getElementById("roomCapacity").value), status: document.getElementById("roomStatus").value};
            if (roomId) {
                await Api.put(`/api/admin/rooms/${roomId}`, payload);
                toast("Room updated");
            } else {
                await Api.post("/api/admin/rooms", payload);
                toast("Room created");
            }
            await render("rooms");
        }));
        content.querySelectorAll("[data-edit-id]").forEach((button) => button.addEventListener("click", () => {
            document.getElementById("roomId").value = button.dataset.editId;
            document.getElementById("roomNumber").value = button.dataset.editNumber;
            document.getElementById("roomCapacity").value = button.dataset.editCapacity;
            document.getElementById("roomStatus").value = button.dataset.editStatus;
            document.getElementById("roomSubmit").textContent = "Update Room";
            window.scrollTo({top: 0, behavior: "smooth"});
        }));
        bindAction("[data-delete-room]", async (id) => Api.delete(`/api/admin/rooms/${id}`), "Room deleted", "rooms");
        return;
    }
    if (key === "bills") {
        setTitle("Billing");
        const [students, bills, payments] = await Promise.all([Api.get("/api/admin/students"), Api.get("/api/admin/bills"), Api.get("/api/admin/payments")]);
        content.innerHTML = panel("Generate Bill", `<form id="billForm" class="row g-3"><div class="col-md-5">${select("billStudent", students, "Select student", (row) => row.name)}</div><div class="col-md-4"><input id="billAmount" type="number" min="1" step="0.01" class="form-control" placeholder="Amount" required></div><div class="col-md-3"><button class="btn btn-primary w-100">Generate</button></div></form>`) +
            panel("Bills", table(["Student", "Amount", "Status", "Created", "Action"], bills.map((bill) => `<tr><td>${escapeHtml(bill.student.name)}</td><td>INR ${bill.amount}</td><td>${statusBadge(bill.status)}</td><td>${formatDate(bill.createdAt)}</td><td>${viewButton({title: "Bill", Student: bill.student.name, Amount: `INR ${bill.amount}`, Status: bill.status, Created: formatDate(bill.createdAt)})}</td></tr>`))) +
            panel("Payments & Receipts", table(["Payment", "Student", "Amount", "Paid At", "Action"], payments.map((payment) => `<tr><td>#${payment.id}</td><td>${escapeHtml(payment.student.name)}</td><td>INR ${payment.amount}</td><td>${formatDate(payment.paidAt)}</td><td>${actions([viewButton({title: "Payment", Payment: `#${payment.id}`, Student: payment.student.name, Amount: `INR ${payment.amount}`, Date: formatDate(payment.paidAt), Status: payment.bill.status}), `<button class="btn btn-sm btn-outline-primary" data-receipt="${payment.id}"><i data-lucide="download"></i> Download</button>`])}</td></tr>`)));
        document.getElementById("billForm").addEventListener("submit", (event) => safe(async () => {
            event.preventDefault();
            await Api.post("/api/admin/bills", {studentId: Number(document.getElementById("billStudent").value), amount: Number(document.getElementById("billAmount").value)});
            toast("Bill generated");
            await render("bills");
        }));
        return;
    }
    if (key === "reports") {
        setTitle("Reports");
        const [report, payments] = await Promise.all([Api.get("/api/admin/reports"), Api.get("/api/admin/payments")]);
        content.innerHTML = metrics(Object.entries(report)) + panel("Report Table", table(["Metric", "Value"], Object.entries(report).map(([label, value]) => `<tr><td>${escapeHtml(label)}</td><td>${value}</td></tr>`))) +
            panel("Receipt Downloads", table(["Payment", "Student", "Amount", "Status", "Action"], payments.map((payment) => `<tr><td>#${payment.id}</td><td>${escapeHtml(payment.student.name)}</td><td>INR ${payment.amount}</td><td>${statusBadge(payment.bill.status)}</td><td><button class="btn btn-sm btn-outline-primary" data-receipt="${payment.id}"><i data-lucide="download"></i> Download Receipt</button></td></tr>`)));
    }
}

installNav();
document.getElementById("themeToggle").innerHTML = `<i data-lucide="${document.documentElement.dataset.theme === "dark" ? "sun" : "moon"}"></i>`;
drawIcons();
render("dashboard");
