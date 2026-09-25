# 🌱 FarmVerse – Agriculture Management Platform

## 🌱 Project Overview

**FarmVerse** is a full-stack agriculture management platform designed to help farmers manage their farming activities efficiently through a centralized web application.

The platform provides features for managing farms, crops, soil information, farmer profiles, agricultural data, fertilizer recommendations, crop disease detection, and AI-powered agricultural assistance.

FarmVerse is built using a modern full-stack web development architecture with a React frontend, Node.js and Express backend, and PostgreSQL database.

---

# 🚀 Features

## 👤 User Authentication

* User registration and login
* Secure password handling
* JWT-based authentication
* User profile management
* Protected application features

## 👨‍🌾 Farmer Management

* Farmer profile management
* View and update farmer information
* Centralized farmer dashboard
* Manage farmer-related agricultural information

## 🌾 Farm Management

* Add new farms
* View existing farms
* Update farm information
* Delete farm records
* Manage multiple farms
* Store farm-related details such as farm name and land information

## 🌱 Crop Management

* Add crops to farms
* View crop information
* Update crop details
* Delete crop records
* Track crop-related information
* Store soil information associated with crops
* Manage crop growth and agricultural data

## 🧪 Soil Information

FarmVerse allows users to maintain important soil information, including:

* Soil pH
* Nitrogen (N)
* Phosphorus (P)
* Potassium (K)
* Other crop and soil-related information

This information can be used to support better crop and fertilizer management.

## 🌿 Fertilizer Management

* Provide fertilizer-related information
* Use crop and soil information for fertilizer guidance
* Help farmers understand fertilizer requirements
* Support better crop management decisions

## 🦠 Crop Disease Detection

FarmVerse provides AI-assisted crop disease detection functionality.

Users can upload crop images and use the application to analyze possible diseases affecting their crops.

The feature is designed to help farmers identify potential crop diseases and obtain useful information for further action.

## 🤖 AI Farming Assistant

FarmVerse includes an AI-powered agricultural assistant.

The assistant can:

* Answer agriculture-related questions
* Provide crop-related information
* Help with farming queries
* Provide agricultural recommendations
* Assist users through natural-language interaction

The AI functionality is integrated with **Google Generative AI**.

## 📊 Dashboard

The dashboard provides a centralized interface for accessing important FarmVerse features.

It allows users to navigate between:

* Farms
* Crops
* Farmer profile
* Soil information
* Fertilizer information
* Disease detection
* AI farming assistant
* Other agricultural features

## 🌐 Multilingual Support

FarmVerse supports multilingual functionality using **i18next**.

This allows the application interface to support multiple languages and makes the platform more accessible to users from different regions.

---

# 🛠️ Technology Stack

| Layer                | Technology           |
| -------------------- | -------------------- |
| Frontend             | React.js             |
| Build Tool           | Vite                 |
| Backend              | Node.js, Express.js  |
| Database             | PostgreSQL           |
| API                  | REST API             |
| Authentication       | JWT, bcrypt          |
| AI                   | Google Generative AI |
| Charts               | Recharts             |
| Internationalization | i18next              |
| File Upload          | Multer               |
| Version Control      | Git & GitHub         |

---

# 🎨 Frontend

The frontend of FarmVerse is developed using **React.js** with **Vite**.

## Frontend Features

* Home Page
* Navigation Bar
* User Registration
* User Login
* Farmer Dashboard
* Farmer Profile
* User Profile
* Farm Management
* Crop Management
* Soil Information
* Fertilizer Information
* Disease Detection
* AI Farming Assistant
* Agricultural data visualization
* Multilingual interface

## Frontend Technologies

* React.js
* JavaScript
* HTML
* CSS
* Vite
* React Router
* i18next
* Recharts

---

# ⚙️ Backend

The backend is developed using **Node.js and Express.js**.

It provides REST APIs and handles communication between the frontend, database, and AI services.

## Backend Responsibilities

* API requests
* User authentication
* User and farmer data
* Farm management operations
* Crop management operations
* Soil-related data
* Fertilizer-related operations
* Disease detection requests
* AI assistant integration
* File uploads
* PostgreSQL database communication

## Backend Technologies

* Node.js
* Express.js
* PostgreSQL
* JWT
* bcrypt
* Multer
* Google Generative AI
* dotenv
* CORS

---

# 🗄️ Database

FarmVerse uses **PostgreSQL** as its relational database.

The database stores and manages information such as:

* User details
* Farmer profiles
* Farm information
* Crop information
* Soil information
* Crop-related agricultural data
* Fertilizer-related information
* Other application data

The database is connected to the backend using the PostgreSQL Node.js driver.

---

# 🤖 AI Integration

FarmVerse integrates AI capabilities to provide intelligent agricultural assistance.

## AI Farming Assistant

The AI assistant allows users to interact with the system using natural language and ask agriculture-related questions.

## Crop Disease Analysis

The application also supports AI-assisted analysis of uploaded crop images to identify possible crop diseases.

The AI functionality uses **Google Generative AI** through the backend.

---

# 🔄 Application Flow

```text
User
  │
  ▼
React Frontend
  │
  │ REST API
  ▼
Node.js + Express Backend
  │
  ├──────────────► PostgreSQL Database
  │
  ├──────────────► Google Generative AI
  │
  └──────────────► Disease Detection / Image Processing
```

---

# 📂 Full Project Structure

```text
FarmVerse/
│
├── database/
│   └── Database-related files and SQL scripts
│
├── public/
│   └── Public assets
│
├── server/
│   │
│   ├── config/
│   │   └── Database and application configuration
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── chatbotController.js
│   │   ├── cropController.js
│   │   ├── farmController.js
│   │   ├── fertilizerController.js
│   │   ├── profileController.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── farmRoutes.js
│   │   ├── chatbotRoutes.js
│   │   ├── profileRoutes.js
│   │   └── ...
│   │
│   ├── uploads/
│   │   └── Uploaded crop images and files
│   │
│   ├── .env
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── src/
│   │
│   ├── assets/
│   │   └── Images and other frontend assets
│   │
│   ├── components/
│   │   ├── Chatbot.jsx
│   │   ├── CropManagement.jsx
│   │   ├── FarmManagement.jsx
│   │   ├── Navbar.jsx
│   │   ├── Profile.jsx
│   │   └── ...
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── FarmerDashboard.jsx
│   │   ├── FarmerProfile.jsx
│   │   └── ...
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── ...
│
├── .gitignore
│
├── Farmverse Precision Agriculture Managment.pdf
│
├── LICENSE
│
├── README.md
│
├── eslint.config.js
│
├── index.html
│
├── package.json
│
├── package-lock.json
│
├── server.zip.zip
│
└── vite.config.js
```

---

# 🔗 Frontend–Backend Communication

The React frontend communicates with the Node.js/Express backend through REST APIs.

The general flow is:

```text
React Component
      │
      ▼
API Request
      │
      ▼
Express Route
      │
      ▼
Controller
      │
      ▼
PostgreSQL / AI Service
      │
      ▼
API Response
      │
      ▼
React Frontend
```

---

# ▶️ Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/Adapa-tejaswini/farmverse_agriculture_management.git
```

## 2. Navigate to the Project

```bash
cd farmverse_agriculture_management
```

## 3. Install Frontend Dependencies

```bash
npm install
```

## 4. Start the Frontend

```bash
npm run dev
```

The frontend will start using the Vite development server.

---

# ⚙️ Backend Setup

Open a new terminal and navigate to the server directory:

```bash
cd server
```

Install backend dependencies:

```bash
npm install
```

Create a `.env` file inside the `server` directory and configure the required environment variables.

Start the backend:

```bash
npm start
```

For development:

```bash
npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
PORT=5000

DB_USER=your_database_user
DB_HOST=localhost
DB_NAME=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_api_key
```

**Important:** Never commit API keys, passwords, or other sensitive environment variables to GitHub.

---

# 👥 Team Members

| S.No | Team Member      |
| ---: | ---------------- |
|    1 | Adapa Tejaswini  |
|    2 | Charitha         |
|    3 | Aasima           |
|    4 | Ashuthosh Mishra |
|    5 | Anshul           |

---

# 🎯 Project Goals

FarmVerse aims to provide a centralized digital platform for managing agricultural activities and providing farmers with useful technology-driven tools.

The major goals are:

* Simplify farm management
* Organize crop information
* Maintain soil and agricultural data
* Provide fertilizer-related guidance
* Assist with crop disease identification
* Provide AI-powered agricultural assistance
* Improve accessibility to agricultural information
* Provide a centralized platform for farmers

---

# 🔮 Future Enhancements

Potential future improvements include:

* Weather API integration
* Real-time weather updates
* Weather-based crop recommendations
* Improved disease detection accuracy
* Advanced AI-based crop recommendations
* Agricultural market price information
* Government agricultural scheme information
* Mobile application support
* Additional regional language support
* Advanced analytics and reports
* Crop yield prediction
* Smart farming recommendations

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.
