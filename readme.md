pkill -f "java"

mvn clean compile
mvn spring-boot:run

lsof -i :8081

App runs at http://localhost:8081 
H2 console: http://localhost:8081/h2-console

JBDC url: jdbc:h2:file:./data/studentsdb
Username: sa
Password: 

For UI

Open a new Terminal 

cd frontend

npm install
npm run dev 

App runs at http://localhost:5173
