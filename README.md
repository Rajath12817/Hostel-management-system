# Hostel Management System - Spring Boot Web App

A modern web-based Hostel Management System built with Java Spring Boot, REST APIs, JPA/Hibernate, MySQL, Bootstrap 5, HTML, CSS, and JavaScript.

## Project Structure

```text
hostel-management/
├── pom.xml
├── schema.sql
├── README.md
└── src/main/
    ├── java/com/hostelmanagement/
    │   ├── HostelManagementApplication.java
    │   ├── config/
    │   ├── controller/
    │   ├── dto/
    │   ├── model/
    │   ├── repository/
    │   └── service/
    └── resources/
        ├── application.properties
        └── static/
            ├── index.html
            ├── dashboard.html
            ├── css/styles.css
            └── js/
                ├── api.js
                ├── dashboard.js
                └── login.js
```

## Features

- Role-based login for Student, Warden, and Admin
- Professional Bootstrap dashboard with navbar, sidebar, cards, forms, and tables
- No manual ID prompts: users select rows, buttons, and dropdowns
- Student: apply for hostel, request leave, view attendance, raise complaints, pay fees
- Warden: approve/reject applications, allocate rooms, mark attendance, approve/reject leave, resolve complaints
- Admin: room CRUD, bill generation, reports
- Factory Pattern: `UserFactory` creates `Student`, `Warden`, and `Admin`
- Layered backend: Controller, Service, Repository, Model

## Database Setup

Create the MySQL database manually or let Spring Boot create it from the JDBC URL.

Default settings in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hostel_management?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

Update the username/password if your MySQL credentials are different.

Optional manual schema:

```bash
mysql -u root -p < schema.sql
```

The application also seeds demo users and rooms through `DataSeeder`.

## Run

```bash
mvn clean spring-boot:run
```

Open:

```text
http://localhost:8080
```

## Demo Logins

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@hostel.com | admin123 |
| Warden | warden@hostel.com | warden123 |
| Student | student@hostel.com | student123 |

## API Endpoints

Authentication:

```text
POST /api/auth/login
```

Student:

```text
POST /api/student/{studentId}/applications
GET  /api/student/{studentId}/applications
POST /api/student/{studentId}/leave-requests
GET  /api/student/{studentId}/leave-requests
POST /api/student/{studentId}/complaints
GET  /api/student/{studentId}/complaints
GET  /api/student/{studentId}/attendance
GET  /api/student/{studentId}/bills
POST /api/student/{studentId}/bills/{billId}/pay
GET  /api/student/{studentId}/payments
```

Warden:

```text
GET  /api/warden/applications
PUT  /api/warden/applications/{id}/approve
PUT  /api/warden/applications/{id}/reject
POST /api/warden/allocations
GET  /api/warden/allocations
POST /api/warden/attendance
GET  /api/warden/attendance
GET  /api/warden/leave-requests
PUT  /api/warden/leave-requests/{id}/approve
PUT  /api/warden/leave-requests/{id}/reject
GET  /api/warden/complaints
PUT  /api/warden/complaints/{id}/resolve
GET  /api/warden/students
GET  /api/warden/rooms/available
```

Admin:

```text
GET    /api/admin/rooms
POST   /api/admin/rooms
PUT    /api/admin/rooms/{id}
DELETE /api/admin/rooms/{id}
POST   /api/admin/bills
GET    /api/admin/bills
GET    /api/admin/students
GET    /api/admin/reports
```
