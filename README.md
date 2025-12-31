
Project Brief Description

======================================================================================================

Pastebin-Lite is a lightweight web application that allows users to create and share text pastes using a unique, shareable URL. Each paste can optionally expire based on a time-to-live (TTL) or a maximum view limit, after which it becomes unavailable. The application exposes REST APIs for creating and fetching pastes and provides a safe HTML view for reading paste content without allowing script execution. It is built using Node.js, Express, and Redis for persistent storage, ensuring fast access and reliable behavior across requests.

======================================================================================================

1. Clone the Repository
git clone https://github.com/Srushtipatel14/pastebin_lite.git
cd pastebin-lite

2. Backend Setup
cd backend
npm install


Create a .env file inside the backend folder:

<!-- REDIS_URL=https://living-goldfish-21829.upstash.io
REDIS_TOKEN=AVVFAAIncDE0ZDdiN2YyNjg0YmQ0MGI2OGEwYzhiMzBjZDUyMjg4ZXAxMjE4Mjk
TEST_MODE=0
PORT=8000 -->

Start the backend server:

node app.js
# or
nodemon app.js


Backend will run on:

http://localhost:8000

3. Frontend Setup

Open a new terminal:

cd frontend
npm install
npm start


Frontend will run on:

http://localhost:3000

======================================================================================================

Persistence Layer Choice

This application uses Redis (Upstash Redis) as the persistence layer.

Why Redis?

Redis is an in-memory key-value store that provides extremely fast read and write operations. It is well-suited for short-lived data such as pastes with expiration times and view limits. Redis also supports native TTL (time-to-live), which simplifies automatic paste expiration without requiring background jobs or cron tasks.

Pros of Redis:

1.Very fast read/write performance
2.Built-in TTL support for automatic expiry
3.Simple key-value data model, ideal for paste storage
4.Works well in serverless environments (via Upstash)
5.Minimal operational overhead

Cons of Redis:

1.Data is primarily stored in memory
2.Not ideal for complex queries or relationships
3.Less suitable for long-term archival storage


Why Not MongoDB?
MongoDB is a document-based database that is excellent for structured and long-term data storage. However, for this use case:

1.TTL requires additional indexes and cleanup logic
2.View count enforcement would require more complex updates
3.Higher overhead compared to Redis for simple key-value access
4.Less efficient for short-lived, frequently accessed data

Conclusion

Redis was chosen because it naturally fits the application’s requirements for fast access, automatic expiration, and simplicity. For a Pastebin-style application with time-limited and view-limited data, Redis provides a cleaner and more efficient solution than MongoDB.