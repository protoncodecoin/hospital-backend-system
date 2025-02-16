# Hospital Backend System - API Documentation & Design Justification

## 1. Overview

The **Hospital Backend System** is designed to manage doctor-patient interactions, facilitate appointment scheduling, generate actionable steps from doctor notes using LLM, and implement automated reminders for patient adherence.

## 2. API Endpoints

### **Authentication**

- **POST /api/v1/users/signup** → Register a user (Doctor/Patient)
- **POST /api/v1/users/login** → Authenticate user & return JWT token
- **POST /api/v1/users?userRole=[role]** → Get user based on assigned role [doctor||patient]

### **Doctor Operations**

- **GET /api/v1/doctors/my-patients** → Get list of patients assigned to the doctor
- **POST /api/v1/doctors/notes** → Submit a doctor’s note for a patient
- **GET /api/v1/doctors/notes** → Retrieve all doctor notes for a patient

### **Patient Operations**

- **POST /api/v1/patients/check-in** → Mark a reminder as completed
- **POST /api/v1/patients/notes** → Retrieve all doctor notes for patient
- **POST /api/v1/patients/doctor-selection/:id** → Patient select doctor to be assigned

---

## 3. **Design Justification**

### **3.1 DATABASE QUERY & ERROR HANDLING**

- **A Custom class** was created to handling most of database queries (Repository style)
- **Async errors** were handled with closures. A custom class was created to mark and check error types before sending the response to the client. This is done to prevent sending sensitive data to the client in production stage. Error details and error stack is sent to developer when in development mode
- **Creation of a user** automatically creates the related profile for the user: that is either doctor or patient. If the user select's doctor role, the specialization role is enforced

### **3.2 Authentication & Security**

- **JWT Authentication**: Ensures secure API access.
- **Password Hashing (bcrypt)**: Protects user credentials.
- **Role-Based Access Control (RBAC)**: Limits access (e.g., doctors cannot modify patient records).

### **3.3 Data Storage & Database Design**

- **MongoDB** (NoSQL): Chosen for its flexibility in handling patient records and doctor notes.
- **Schemas**:
  - **User Schema** (Doctors, Patients) → Stores authentication details.
  - **DoctorNotes Schema** → Stores medical notes with actionable steps.
  - **Patient Schema** → Tracks Doctor records.
  - **Doctor Schema** → Tracks Doctor records.
  - **Reminder Schema** → Tracks patient reminders.

### **3.4 Large Language Model (LLM) Integration**

- **LLM (Google Gemini Flash)** extracts **actionable steps** from doctor notes:
  - **Checklist** → Immediate, one-time tasks (e.g., take medication).
  - **Plan** → Recurring reminders (e.g., take antibiotics daily for 7 days).

### **3.5 Scheduling Strategy**

- **Node-cron**: Runs scheduled tasks every minute to check pending reminders.
- **Dynamic Scheduling**:
  - Reminders repeat until a patient checks in.
  - If a dose is missed, the schedule extends accordingly.
  - A new doctor’s note **cancels existing reminders** to avoid conflicts.

### **3.6 API Documentation Approach**

- **Postman Collection** available for testing all endpoints.

---

## 5. Conclusion

The system balances **scalability, security, and automation**, making it efficient for real-world hospital operations. By using **JWT authentication, LLM integration, and a dynamic scheduling approach**, we ensure accurate reminders, data integrity, and an improved patient experience.
