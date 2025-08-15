# Traffic violation tracker app

## Project Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/XianghaoKong/sdlapps.git
cd sdlapps
cd backend
cp .env.example .env  
npm ci --omit=dev
cd ../frontend
npm ci
npm run build
cd backend
npm start
cd frontend
npm start

Public URL of the Project:
Frontend :
http://13.55.126.110

Backend API:
http://13.55.126.110/api

# The admin key is <123456> if you want to register as an admin, also specified in .env.example

#Jira URL: https://chesterkong77.atlassian.net/jira

