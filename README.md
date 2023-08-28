# Simple User Manager

## Setup

A very basic user manager. You can add permissions, roles that have permissions and then users that have roles. 

### Backend

#### Database

```
cd api
cp .env.example .env
```

- Create a database named and import schema.sql
- Add database credentials to .env file.
- (opt) Define port if necessary.


#### Server
```
npm install
npm run start
```
The API Server should be running now under http://localhost:3000.

### Frontend
```
npm install
npm run dev
```



