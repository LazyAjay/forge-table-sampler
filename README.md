# ⚙️ Forge Table Sampler

**Forge Table Sampler** is a fully functional showcase repository featuring **ForgeTable**, a generic, high-performance, virtualized data table framework. This project demonstrates how the framework handles large datasets with zero lag by linking a **Next.js 15+ (React 19)** frontend with a **Spring Boot JPA** backend.

It includes sample datasets for **Products**, **Customers**, **Orders**, **Employees**, and **System Logs**, with full support for:
- **Spacer-Row Virtualization** (retaining scroll position and handles 10,000+ rows seamlessly)
- **Dynamic Multi-Sort and Sorting Chaining**
- **Flexible Search Query & Multi-Select Filters**
- **Server-Side Pagination & Ellipsis Navigators**
- **PII Field Masking** based on User Roles (e.g., hiding/masking columns for `USER` role vs showing for `ADMIN`)

---

## 🛠 Repository Architecture

The repository is structured as a monorepo for quick local setups and easy inspection of how the frontend and backend interact:

```text
forge-table-sampler/
├── backend/                  # Spring Boot JPA Backend Application (port 8080)
│   ├── src/main/java/...     # Java code containing the table specification engine
│   │   ├── framework/        # Generic reusable specification engine & controllers
│   │   └── product/          # Sample entities, config, repos, and seed data (Products)
│   └── build.gradle          # Gradle build dependencies
│
└── frontend/                 # Next.js 15 Tailwind UI Application (port 3000)
    ├── src/app/              # Dashboard pages (products, customers, logs, etc.)
    └── src/components/ui/    # The core 'forge-table' React components
```

---

## 🚀 Getting Started

To get the sampler application running locally, clone this repository and follow the startup instructions for both components:

### 1. Spring Boot Backend Setup

The backend runs on an in-memory H2 database. It automatically seeds thousands of dummy products, customers, and log rows upon boot.

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```
2. **Build and Run the Application**:
   Using the Gradle wrapper:
   - On Windows:
     ```powershell
     .\gradlew.bat bootRun
     ```
   - On macOS/Linux:
     ```bash
     chmod +x gradlew
     ./gradlew bootRun
     ```
3. **Verification**:
   Open [http://localhost:8080/h2-console](http://localhost:8080/h2-console) in your browser to inspect database tables.
   - **JDBC URL**: `jdbc:h2:mem:tabledb`
   - **Username**: `sa`
   - **Password**: `password`

### 2. Next.js Frontend Setup

The frontend connects to the Spring Boot REST API for server-side fetching, sorting, filtering, and paginating.

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Run the Development Server**:
   ```bash
   npm run dev
   ```
4. **Verification**:
   Open [http://localhost:3000/products](http://localhost:3000/products) in your browser. You will see a live grid loading data directly from the Spring Boot API!

---

## 💡 How it Works

1. **Virtualized List Rendering**:
   The table utilizes `ResizeObserver` to determine client height and renders only visible items plus a small offscreen buffer. This prevents browser rendering bottlenecks even on thousands of items.
2. **Generic Table Specification Engine**:
   The backend framework receives a `TableFetchRequest` containing filters, search fields, sorting parameters, and page ranges. It uses reflection to match the repository bean based on the `targetEntity` name, compiles JPA criteria dynamically, and returns a paginated JSON response.
3. ** PI Masking Layer**:
   Entities implementing `Maskable` (e.g., `Employee.java`) dynamically mask sensitive information depending on the client header role (sent as `X-User-Role: USER` or `ADMIN`).

---

## 🌎 Deployment Guidelines

### Backend (Spring Boot)
- Build the production jar:
  ```bash
  ./gradlew bootJar
  ```
- Deploy the resulting jar in `backend/build/libs/` to any Cloud VPS, AWS EC2, or package it inside a Docker container.

### Frontend (Next.js)
- Build the production static or standalone bundle:
  ```bash
  npm run build
  ```
- Deploy to platforms like **Vercel**, **Netlify**, or **AWS Amplify** by connecting the GitHub repository. Ensure you configure the CORS endpoints properly in `WebConfig.java` to point to your frontend domain.

---

Designed and created by **LazyAjay** and **lazyinventor**.
