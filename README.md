# 🍽️ Campus Bites – Smart Canteen Pre-Order & Food Waste Management System

## ⚡ Running on Another System (Pendrive Setup)

### ✅ Prerequisites (Install Once on the New Computer)

| Requirement | Download Link | Minimum Version |
|---|---|---|
| **Node.js** | https://nodejs.org (LTS version) | v18 or above |
| **A Browser** | Chrome / Edge / Firefox | Any modern version |

> **Important:** The database (MongoDB) is hosted on the cloud (Atlas). No local database installation needed.

---

## 🚀 How to Run (3 Steps)

### Step 1 – Copy Project to Computer
Paste the entire `Mini Project` folder from the pendrive to any location on the Desktop or Documents folder.
> ⚠️ **Do NOT run directly from the pendrive.** It will be very slow.

### Step 2 – Double-click `start-project.bat`
Located at the **root of the project folder**.

```
Mini Project/
├── 📄 start-project.bat    ← Double-click this!
├── 📄 stop-project.bat
├── 📁 client/
└── 📁 server/
```

> On first run, it will automatically install all dependencies (this takes ~1–2 minutes only once).  
> After that it opens your browser to **http://localhost:5173/** automatically.

### Step 3 – Use the App
Once both terminal windows appear and the browser opens, the app is running!

---

## 🔐 Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| 👨‍🎓 **Student** | student@canteen.edu | password123 |
| 👨‍💼 **Faculty Staff** | staff@canteen.edu | password123 |
| 👨‍🍳 **Canteen Staff** | canteen@canteen.edu | password123 |

> **Tip:** You can also use the 1-Click demo profile buttons on the Login page.

---

## 🛑 To Stop the App
Double-click **`stop-project.bat`** at the root of the project folder.

---

## 🛠️ Manual Start (If .bat file doesn't work)

Open **two separate terminal/cmd** windows and run:

**Terminal 1 – Backend:**
```bash
cd server
npm install
node server.js
```

**Terminal 2 – Frontend:**
```bash
cd client
npm install
npm run dev
```

Then open **http://localhost:5173/** in your browser.

---

## 📂 Project Structure

```
Mini Project/
├── start-project.bat        # One-click launcher (Windows)
├── stop-project.bat         # One-click stopper (Windows)
│
├── client/                  # React Frontend (Vite + Tailwind CSS)
│   ├── public/
│   │   ├── logo.jpg         # Campus Bites logo
│   │   └── dishes/          # Local food photography
│   └── src/
│       ├── pages/           # All application pages
│       ├── components/      # Navbar, shared components
│       └── context/         # Auth & Cart global state
│
└── server/                  # Node.js + Express Backend
    ├── .env                 # Cloud database credentials (pre-configured)
    ├── server.js            # Main API entry point
    ├── routes/              # REST API endpoints
    ├── models/              # MongoDB schema models
    └── seed.js              # Database seeder script
```

---

## ☁️ Database
- Hosted on **MongoDB Atlas Cloud** — no local setup needed.
- Connection is pre-configured in `server/.env`.
- Internet connection is **required** to access the database.

---

## ❓ Troubleshooting

| Problem | Solution |
|---|---|
| `start-project.bat` doesn't open | Right-click → Run as Administrator |
| "node is not recognized" error | Node.js is not installed. Download from nodejs.org |
| App opens but shows no data | Check internet connection (Atlas requires internet) |
| Port already in use error | Run `stop-project.bat` first, then `start-project.bat` again |
| Slow first load | Normal — dependencies are being installed. Wait 2 minutes. |
