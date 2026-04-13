const http = require('http');


let tasks = [];
let nextId = 1; // Auto-incrementing ID counter



// Find a task by its ID
function findTask(id) {
  return tasks.find(task => task.id === parseInt(id));
}

// Send a JSON response
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// Read the request body (what the user sends us)
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON in request body'));
      }
    });
    req.on('error', reject);
  });
}



// POST /tasks — Create a new task
async function createTask(req, res) {
  const body = await readBody(req);
  const { title, description } = body;

  // Validate: title is required
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return sendJSON(res, 400, { error: 'requires title and must be non empty string' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  sendJSON(res, 201, newTask);
}

// GET /tasks — Get all tasks (with optional filter & sort)
function getAllTasks(req, res, query) {
  let result = [...tasks];

  // Bonus: Filter by status (?status=pending or ?status=done)
  if (query.status) {
    if (!['pending', 'done'].includes(query.status)) {
      return sendJSON(res, 400, { error: 'status filter must be "pending" or "done"' });
    }
    result = result.filter(t => t.status === query.status);
  }

  // Bonus: Sort by createdAt (?sort=createdAt)
  if (query.sort === 'createdAt') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  sendJSON(res, 200, result);
}

// GET /tasks/:id — Get one task by ID
function getTask(req, res, id) {
  const task = findTask(id);
  if (!task) {
    return sendJSON(res, 404, { error: `Task with id ${id} not found` });
  }
  sendJSON(res, 200, task);
}

// PUT /tasks/:id — Update title or description
async function updateTask(req, res, id) {
  const task = findTask(id);
  if (!task) {
    return sendJSON(res, 404, { error: `Task with id ${id} not found` });
  }

  const body = await readBody(req);
  const { title, description } = body;

  if (!title && description === undefined) {
    return sendJSON(res, 400, { error: 'Provide at least one field to update: title or description' });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return sendJSON(res, 400, { error: 'title must be a non-empty string' });
    }
    task.title = title.trim();
  }

  if (description !== undefined) {
    task.description = description.trim();
  }

  sendJSON(res, 200, task);
}

// PATCH /tasks/:id/done — Mark task as completed
function markDone(req, res, id) {
  const task = findTask(id);
  if (!task) {
    return sendJSON(res, 404, { error: `Task with id ${id} not found` });
  }

  task.status = 'done';
  sendJSON(res, 200, task);
}

// DELETE /tasks/:id — Delete a task
function deleteTask(req, res, id) {
  const index = tasks.findIndex(t => t.id === parseInt(id));
  if (index === -1) {
    return sendJSON(res, 404, { error: `Task with id ${id} not found` });
  }

  const deleted = tasks.splice(index, 1)[0];
  sendJSON(res, 200, { message: 'Task deleted successfully', task: deleted });
}


const server = http.createServer(async (req, res) => {
  // Parse the URL and query string
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;
  const query = Object.fromEntries(urlObj.searchParams.entries());

  try {
    // POST /tasks
    if (req.method === 'POST' && pathname === '/tasks') {
      return await createTask(req, res);
    }

    // GET /tasks
    if (req.method === 'GET' && pathname === '/tasks') {
      return getAllTasks(req, res, query);
    }

    // GET /tasks/:id
    const singleTaskMatch = pathname.match(/^\/tasks\/(\d+)$/);
    if (singleTaskMatch) {
      const id = singleTaskMatch[1];
      if (req.method === 'GET') return getTask(req, res, id);
      if (req.method === 'PUT') return await updateTask(req, res, id);
      if (req.method === 'DELETE') return deleteTask(req, res, id);
      // Bonus: 405 for unsupported methods on valid routes
      res.writeHead(405, { Allow: 'GET, PUT, DELETE', 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    // PATCH /tasks/:id/done
    const doneMatch = pathname.match(/^\/tasks\/(\d+)\/done$/);
    if (doneMatch) {
      const id = doneMatch[1];
      if (req.method === 'PATCH') return markDone(req, res, id);
      // Bonus: 405
      res.writeHead(405, { Allow: 'PATCH', 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

    // 404 for unknown routes
    sendJSON(res, 404, { error: 'Route not found' });

  } catch (err) {
    sendJSON(res, 400, { error: err.message });
  }
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Task Manager API is running on http://localhost:${PORT}`);
  console.log('   Press Ctrl+C to stop.\n');
});
