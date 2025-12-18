pkill -f "java"

mvn clean compile
mvn spring-boot:run

lsof -i :8081

App runs at http://localhost:8081 

For UI

Open a new Terminal 

cd frontend

npm install
npm run dev 

App runs at http://localhost:5173
