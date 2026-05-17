# AI-Powered Examination Portal (MERN)

A full-stack examination portal with JWT authentication, role-based access (Student, Teacher, Admin), and **Groq AI** evaluation for theory answers.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS, Context API, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Auth | JWT + bcrypt |
| AI | Groq API |

## Project Structure

```
examinationportal-master/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/          # User, Exam, Question, Result, Feedback
│   ├── routes/
│   ├── services/groqService.js
│   ├── scripts/seedAdmin.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/axios.js
│       ├── context/     # Auth, Theme
│       ├── components/common/
│       └── pages/       # student, teacher, admin
└── README.md
```

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Groq API key from [console.groq.com](https://console.groq.com)

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # Edit with your keys
npm run seed           # Creates admin@portal.com / admin123
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

- Frontend: http://localhost:3000
- API: http://localhost:5000

## Default Admin Login

| Email | Password |
|-------|----------|
| admin@portal.com | admin123 |

Register as **Student** or **Teacher** from the signup page.

## API Endpoints

| Method | Endpoint | Role |
|--------|----------|------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/exams` | All (filtered by role) |
| POST | `/api/exams` | Teacher |
| POST | `/api/results/start/:examId` | Student |
| POST | `/api/results/:id/submit` | Student (triggers AI) |
| GET | `/api/admin/analytics` | Admin |

## Features

- JWT auth with bcrypt password hashing
- Role-based dashboards and protected routes
- MCQ auto-grading + Groq AI theory evaluation
- Exam timer with auto-submit
- Tab-switch detection during exams
- Teacher manual mark/feedback override
- Admin user management & feedback approval
- Pagination, search, dark mode

## Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/examinationportal
JWT_SECRET=your_secret
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile
```

**frontend/.env**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Note

Never commit `.env` files or share API keys publicly. Rotate your Groq key if it was exposed.
