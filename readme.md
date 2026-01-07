# Student Management System - Setup Guide

This guide is designed for anyone to set up and run this project from scratch, even without a technical background.

## 1. Prerequisites (Install these first)

Before running the project, you need to install the following software on your computer:

1.  **Java JDK 17+**: [Download Here](https://www.oracle.com/java/technologies/downloads/)
    *   *Check*: Open terminal/command prompt and type `java -version`.
2.  **Node.js (LTS Version)**: [Download Here](https://nodejs.org/en/)
    *   *Check*: Type `node -v` in terminal.
3.  **MySQL Server**: [Download Here](https://dev.mysql.com/downloads/installer/)
    *   During installation, set the **root password** to `rootxxxx` (or remember whatever you choose).
    *   *Check*: You should be able to open "MySQL Workbench" or "MySQL Command Line Client".

---

## 2. Database Setup

1.  Open **MySQL Workbench** (or your preferred database tool).
2.  Connect to your local server (usually localhost:3306).
3.  Run the following SQL command to create the database:
    ```sql
    CREATE DATABASE studentdb;
    ```
4.  That's it! The application will create all the tables for you automatically.

---

## 3. Configuration

Open the file `src/main/resources/application.properties` in any text editor (Notepad, TextEdit, VS Code).

1.  **Database Password**:
    *   Find the line: `spring.datasource.password=${DB_PASSWORD:root1234}`
    *   If you set a password other than `root1234` during MySQL installation, change `root1234` to your password.

2.  **Stripe Payment (Optional)**:
    *   If you want the payment system to work, you need a Stripe account.
    *   Find `stripe.api.key` and replace `sk_test_placeholder` with your **Stripe Secret Key**.
    *   Open `frontend/.env` and replace `pk_test_placeholder` with your **Stripe Publishable Key**.

---

## 4. Running the Project

You need to run two separate parts: the Backend (Server) and the Frontend (Website). Open **two separate terminal windows**.

### Terminal 1: Backend (Server)

1.  Navigate to the project folder:
    ```bash
    cd /path/to/Student
    ```
2.  Run the server:
    *   **Mac/Linux**:
        ```bash
        ./mvnw spring-boot:run
        ```
        *(If `./mvnw` doesn't work, ensure Maven is installed or use `mvn spring-boot:run`)*
    *   **Windows**:
        ```bash
        mvnw spring-boot:run
        ```
3.  Wait until you see: `Started StudentManagementApplication in ... seconds`.
4.  The server is now running at `http://localhost:8081`.

### Terminal 2: Frontend (Website)

1.  Navigate to the frontend folder:
    ```bash
    cd /path/to/Student/frontend
    ```
2.  Install dependencies (only need to do this once):
    ```bash
    npm install
    ```
3.  Start the website:
    ```bash
    npm run dev
    ```
4.  You will see a link, usually `http://localhost:5173`. Open this in your browser.

---

## 5. Using the Application

1.  **Sign Up**: Go to the "Sign Up" page to create a new account (Student, Teacher, or Admin).
2.  **Login**: Use your email and password to log in.

**Troubleshooting:**
*   **Port already in use**: If you see an error about port 8081 or 5173 being busy, make sure you don't have the app running in another window.
*   **Database connection error**: Double-check your MySQL password in `application.properties` and ensure MySQL server is running.
