# Stage 1: Build the Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Copy the built frontend assets to the Spring Boot static resources directory
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
# Package the application (skip tests to speed up)
RUN mvn clean package -DskipTests

# Stage 3: Run the Application
FROM eclipse-temurin:17-jre
WORKDIR /app
# Copy the JAR from the build stage
COPY --from=backend-build /app/target/student-management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
# Use exec form for CMD to handle signals correctly
ENTRYPOINT ["java", "-jar", "app.jar"]
