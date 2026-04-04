# 📚 Library Management System

### 🔑 Default Librarian Credentials
- **Email:** `librarian@library.com`
- **Password:** `password123`

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Atlas or Local)

### 2. Backend Setup
1. Open a terminal and navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file in `Backend/config/config.env` (copy from `config.env` if needed).
4. Seed the librarian account (optional):
   ```bash
   node seedLibrarian.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

---

## ☁️ How to Push to GitHub

If you haven't initialized your repository yet, follow these steps:

1. **Initialize Git (if not already done):**
   ```bash
   git init
   ```

2. **Stage all changes:**
   ```bash
   git add .
   ```

3. **Commit your changes:**
   ```bash
   git commit -m "feat: setup library management system"
   ```

4. **Add your remote repository:**
   *(Replace `<YOUR_REPO_URL>` with your actual GitHub repository URL)*
   ```bash
   git remote add origin <YOUR_REPO_URL>
   ```

5. **Rename your branch (optional):**
   ```bash
   git branch -M main
   ```

6. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Others:** JWT, Cloudinary (for images), Nodemailer (for emails)
