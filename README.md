# Full-Stack Developer Training Plan (Python + Angular + Docker + Postgres + Okta + AWS)

This repository contains a **2-month structured training plan** (15 hours per week) designed to prepare a computer science student for their first full-stack development job in Canada (Vancouver or Toronto).  
The training culminates in a **capstone project: Notes App**, a production-ready, full-stack note-taking application.

---

## 📆 2-Month Study Plan

### Week 1 – Python Backend Foundations (15h)
- Learn Flask or FastAPI basics (routing, request/response).
- Build simple REST APIs (CRUD endpoints).
- **Deliverable:** Notes API with in-memory storage.

### Week 2 – PostgreSQL & ORM Integration (15h)
- Install and use PostgreSQL.
- Learn SQL essentials (CREATE, SELECT, JOIN).
- Integrate Flask/FastAPI with Postgres using SQLAlchemy.
- Implement migrations with Alembic.
- **Deliverable:** Notes API extended to store notes in Postgres.

### Week 3 – Angular Basics (15h)
- Learn Angular fundamentals (components, services, dependency injection).
- Fetch data from an API with HTTP Client.
- **Deliverable:** Notes App frontend that displays and adds notes.

### Week 4 – Full-Stack Integration (15h)
- Connect Angular frontend to Flask backend.
- Handle CORS, API calls, and JSON responses.
- **Deliverable:** Full-stack Notes App (Angular + Flask + Postgres).

### Week 5 – Authentication with Okta (15h)
- Learn authentication & OAuth2 basics.
- Integrate Okta for login/logout.
- Secure backend routes with JWT validation.
- Secure Angular frontend with Okta SDK.
- **Deliverable:** Notes App with user authentication.

### Week 6 – Docker & Deployment Prep (15h)
- Learn Docker basics (Dockerfile, docker-compose).
- Containerize:
  - Flask backend
  - Angular frontend
  - Postgres DB
- **Deliverable:** Full app running in Docker Compose.

### Week 7 – AWS Deployment (15h)
- Learn AWS basics: EC2, RDS, S3, Elastic Beanstalk/Amplify.
- Deploy:
  - Backend → AWS EC2/Elastic Beanstalk
  - Database → AWS RDS (Postgres)
  - Frontend → S3 + CloudFront (or Amplify)
- **Deliverable:** Notes App live on AWS.

### Week 8 – Final Project & Resume Packaging (15h)
- Add advanced features:
  - Tags, search, categories
  - User profiles
  - Basic analytics (# of notes per user)
- Write a professional README.md with setup instructions and screenshots.
- **Deliverable:** Production-ready Notes App deployed on AWS with Docker, secured by Okta.

---

## 📝 Capstone Project: Notes App

A **full-stack note-taking application** that demonstrates backend, frontend, database, authentication, containerization, and cloud deployment skills.

### Features
- **Authentication (Okta):** Users must log in to access notes.
- **CRUD Operations:** Create, read, update, and delete notes.
- **Database (Postgres):** Notes stored securely with user ownership.
- **Frontend (Angular):** UI for managing notes with forms and lists.
- **Backend (Flask/FastAPI):** REST API endpoints for managing notes.
- **Docker:** Containerized deployment for backend, frontend, and database.
- **AWS Deployment:** Full app deployed to AWS (EC2/RDS/S3/CloudFront).

### Tech Stack
- **Backend:** Python (Flask/FastAPI), SQLAlchemy, Alembic
- **Frontend:** Angular, HTTP Client, Angular Material (optional styling)
- **Database:** PostgreSQL
- **Authentication:** Okta (OAuth2/JWT)
- **Deployment:** Docker, AWS (EC2, RDS, S3, CloudFront/Amplify)

---

## 🔄 User Flow
1. User logs in via **Okta**.  
2. Angular frontend fetches user's notes from the Flask backend.  
3. User can **create, edit, or delete** notes through the UI.  
4. Backend validates JWT, processes requests, and interacts with Postgres.  
5. Notes are securely stored in **Postgres** and linked to the user.  
6. Application runs inside **Docker containers**.  
7. Final deployment on **AWS** for real-world accessibility.  

---

## 📂 Portfolio Deliverables
By the end of this training program, the student will have:

- **Backend Notes API** (Flask/FastAPI + Postgres).  
- **Full-Stack Notes App** (Angular + Flask + Postgres).  
- **Capstone Project**: Secure, containerized, AWS-deployed Notes App with Okta authentication.  
- **GitHub Repository** with:
  - Codebase
  - Architecture diagram
  - Setup instructions
  - Screenshots or demo video
- **Resume-Ready Project** to showcase for job applications.  

---

## ⏱ Weekly Time Allocation
- **Concepts/Tutorials:** 5h
- **Coding/Practice:** 7h
- **Project Building:** 3h

---

## 📌 Next Steps
- Fork this repo and follow the week-by-week plan.
- Push project code to GitHub with clear commits.
- Document features, setup, and deployment steps in the README.
- Add screenshots or a demo video link for visibility.

---
