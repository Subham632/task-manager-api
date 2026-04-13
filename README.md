# task-manager-api
A simple REST API for managing tasks
##  How to Run

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/task-manager-api.git

# 2. Go into the project folder
cd task-manager-api

# 3. Start the server (no npm install needed!)
npm start
```

You should see:
✅ Task Manager API is running on http://localhost:3000



##  API Endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| POST | `/tasks` | Create a new task |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a single task by ID |
| PUT | `/tasks/:id` | Update a task's title or description |
| PATCH | `/tasks/:id/done` | Mark a task as completed |
| DELETE | `/tasks/:id` | Delete a task |

> Each task has: `id`, `title`, `description`, `status` (pending / done), `createdAt`

---

##  Example Requests

### Using curl

####  Create a Task
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```
**Response (201):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

####  Get All Tasks
```bash
curl http://localhost:3000/tasks
```
**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

####  Get a Single Task
```bash
curl http://localhost:3000/tasks/1
```
**Response (200):**
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

####  Update a Task
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and fruits", "description": "Milk, eggs, bread, apples"}'
```
**Response (200):**
```json
{
  "id": 1,
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples",
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### Mark a Task as Done
```bash
curl -X PATCH http://localhost:3000/tasks/1/done
```
**Response (200):**
```json
{
  "id": 1,
  "title": "Buy groceries and fruits",
  "description": "Milk, eggs, bread, apples",
  "status": "done",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

---

####  Delete a Task
```bash
curl -X DELETE http://localhost:3000/tasks/1
```
**Response (200):**
```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": 1,
    "title": "Buy groceries and fruits",
    "description": "Milk, eggs, bread, apples",
    "status": "done",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Using Postman

1. Download **Postman** from [postman.com](https://www.postman.com/downloads/)
2. Create a new request
3. Set the **method** (GET / POST / PUT / PATCH / DELETE) from the dropdown
4. Enter the URL e.g. `http://localhost:3000/tasks`
5. For POST and PUT requests:
   - Click the **Body** tab
   - Select **raw** → choose **JSON**
   - Paste your JSON e.g. `{"title": "My Task"}`
6. Click **Send**

---

##  Bonus Features

#### Filter tasks by status
```bash
curl "http://localhost:3000/tasks?status=pending"
curl "http://localhost:3000/tasks?status=done"
```

#### Sort tasks by creation time
```bash
curl "http://localhost:3000/tasks?sort=createdAt"
```

#### Combine filter and sort
```bash
curl "http://localhost:3000/tasks?status=pending&sort=createdAt"
```

---

## Error Responses

| Status Code | When it happens | Example |
|-------------|----------------|---------|
| `400` | Missing or invalid fields | `{"error": "title is required and must be a non-empty string"}` |
| `404` | Task ID doesn't exist | `{"error": "Task with id 99 not found"}` |
| `405` | Unsupported HTTP method on a valid route | `{"error": "Method Not Allowed"}` |

---

##  Project Structure

```
task-manager-api/
├── index.js        # Main server file (all routes and logic)
├── package.json    # Project config and start script
└── README.md       # This file
