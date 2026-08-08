# Automated Institutional Bonafide & Certificate Portal (Hybrid Workflow) 🎓

A complete **Java Full Stack Web Application** using **Vite + React** for the frontend and **Spring Boot 3 + PostgreSQL** for the backend.

Designed for **3rd-Year Diploma Computer Engineering Internship Project Submission**.

---

## 🌟 Approval Workflows

1. **Bonafide Certificates (1-Step Direct Issue):**
   - HOD approval directly signs, issues, and synthesizes the downloadable PDF certificate with an embedded verification QR code.
2. **Other Documents (Internship NOC, Character Certificate, Fee Structure) (2-Step Approval):**
   - **Step 1:** Student submits ➔ HOD Approves / Rejects (`PENDING_HOD_APPROVAL` ➔ `APPROVED_BY_HOD`).
   - **Step 2:** Central Office Admin Final Seal & PDF Issuance (`APPROVED_BY_HOD` ➔ `ISSUED_BY_ADMIN`).

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router DOM, Lucide Icons, CSS Custom Properties (Glassmorphism design)
- **Backend:** Java 17+, Spring Boot 3.2.4, Spring Security, Spring Data JPA
- **Database:** PostgreSQL (`org.postgresql:postgresql`, Database: `bonafide_db`)
- **Security & Tokens:** JSON Web Tokens (`io.jsonwebtoken:jjwt`)
- **Document Generation:** OpenPDF (`com.github.librepdf:openpdf`), Google ZXing (`com.google.zxing`)

---

## ⚡ Pre-Seeded Demo Test Accounts

| Role | Username / PRN | Password | Department | Approval Role |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `roll101` | `password123` | Computer Engineering | Submits Applications |
| **Department HOD** | `hod_comp` | `password123` | Computer Engineering | Issues **Bonafide (1-Step)** & Approves NOC/Character (Step 1) |
| **Central Admin** | `admin` | `password123` | Central Administration | Issues **NOC / Character / Fee Structure (Step 2)** |

---

## 🚀 How to Run the Application

### Step 1: Ensure PostgreSQL is Running
Make sure PostgreSQL is running on `localhost:5432` with a database named `bonafide_db`:
```sql
CREATE DATABASE bonafide_db;
```

Update `src/main/resources/application.yml` with your PostgreSQL password if different from `postgrespassword`.

### Step 2: Launch the Spring Boot + React Application
```powershell
cd C:\Users\proma\.gemini\antigravity\scratch\bonafide-portal

& "C:\Program Files\JetBrains\IntelliJ IDEA 2025.3.4\plugins\maven\lib\maven3\bin\mvn.cmd" spring-boot:run
```

Open your browser at: **`http://localhost:8080`**
