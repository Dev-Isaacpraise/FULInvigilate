# Technical Stack Recommendation & Trade-off Analysis
## Federal University Lokoja (FUL) — Automated Examination Invigilator Allocation System

**Project Type**: University Final-Year Group Project  
**Target Institution**: Federal University Lokoja, Kogi State, Nigeria  
**Objective**: Clear, maintainable, demo-friendly automated invigilator allocation suggestion engine with human-in-the-loop review.

---

### Option Evaluation & Trade-offs

| Criterion | Option A: Node.js (Express + TypeScript) + Relational/SQLite + React (SELECTED) | Option B: Python (Django / FastAPI) + PostgreSQL + React | Option C: Java (Spring Boot) + MySQL + Thymeleaf/Angular |
| :--- | :--- | :--- | :--- |
| **Setup Speed & Portability** | **Highest (10/10)**: Zero daemon installation required for demo. Portable across Windows/Mac/Linux with `npm install && npm run dev`. | **Medium (7/10)**: Requires Python virtualenv, pip packages, and local PostgreSQL database service running. | **Lower (5/10)**: Requires JDK 21, Maven/Gradle, MySQL server running on port 3306, and configuration properties. |
| **Relational Integrity** | **High**: Complete ANSI SQL DDL schema provided (`db/schema.sql`), strict foreign key relations, unique constraints, and ACID persistence. | **Very High**: Django ORM / SQLAlchemy provides native relational schemas and migrations. | **Very High**: JPA / Hibernate handles relational mapping and constraint validation. |
| **Presentation & Live Demo Reliability** | **Exceptional**: Instant UI updates, embedded calendar/timetable, visual conflict detection, no connection-refused surprises on external DB ports. | **Good**: Fast rendering, but local PostgreSQL socket errors can break student demos on campus laptops. | **Moderate**: Heavier memory footprint, longer boot times during viva defense. |
| **Algorithm Implementation** | **Very High**: TypeScript provides static typing, functional array operations (sort, filter, reduce), and deterministic execution for the greedy fairness allocation engine. | **Very High**: Python lists and dicts make algorithm development straightforward. | **Moderate**: More boilerplate for models, services, and repositories. |
| **Learning Curve for Group Members** | **Low-Medium**: Single language (TypeScript/JavaScript) across both backend and frontend. | **Medium**: Need proficiency in both Python backend and JavaScript frontend. | **High**: Steep learning curve for students unfamiliar with Spring framework internals. |

---

### Final Recommendation for Final-Year Project Defense:
**Option A (Node.js/Express + Relational Schema + React 19 + TypeScript + Tailwind CSS)**:
1. **Unified Language**: Team members only need TypeScript/JavaScript, minimizing coordination friction.
2. **Zero-Friction Defense Demo**: Works out-of-the-box on any external presentation laptop or projector without configuring external DB users or firewall permissions.
3. **Enterprise Relational Representation**: We provide standard SQL schemas (`db/schema.sql`) and migrations for MySQL/PostgreSQL so the written project report (Chapters 3 & 4) has full database ERDs, data dictionaries, and SQL scripts ready.
