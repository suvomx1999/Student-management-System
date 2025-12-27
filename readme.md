
## Deployment (Web)

This project is configured for **Unified Deployment** using Docker. This means the Frontend (React) and Backend (Spring Boot) are bundled into a single application.

### Prerequisites
1. Push this code to a GitHub repository.
2. Sign up for a hosting provider like **Railway** or **Render**.

### Option 1: Deploy on Railway (Recommended)
1. **New Project** -> **Deploy from GitHub repo**.
2. Select this repository.
3. **Add a Database**:
   - Right-click the project canvas -> New -> Database -> MySQL.
4. **Configure Variables**:
   - Go to your App Service -> Variables.
   - Add `JDBC_URL`: Copy the "JDBC URL" from the MySQL service (Connect tab).
   - Add `DB_USERNAME`: `root` (or from MySQL service variables).
   - Add `DB_PASSWORD`: (from MySQL service variables).
   - Add `PORT`: `8080`.

### Option 2: Deploy on Render
1. **New Web Service** -> Connect GitHub repo.
2. **Runtime**: Select "Docker".
3. **Environment Variables**:
   - Create a separate MySQL database on Render (or use an external one).
   - `JDBC_URL`: `jdbc:mysql://<host>:<port>/<database>`
   - `DB_USERNAME`: `...`
   - `DB_PASSWORD`: `...`

### Docker Build Process
The included `Dockerfile` automatically:
1. Builds the React Frontend.
2. Copies it into the Spring Boot JAR.
3. Builds the Java Backend.
4. Runs the unified app.
