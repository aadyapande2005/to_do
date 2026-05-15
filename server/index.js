import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import Todo from './models/Todo.js';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');

app.use(express.json());

app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch todos' });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const title = (req.body.title || '').trim();

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const todo = await Todo.create({ title });
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create todo' });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (typeof req.body.completed === 'boolean') {
      todo.completed = req.body.completed;
    }

    if (typeof req.body.title === 'string') {
      const nextTitle = req.body.title.trim();
      if (nextTitle) {
        todo.title = nextTitle;
      }
    }

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update todo' });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    res.json({ message: 'Todo deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete todo' });
  }
});

if (process.env.SERVE_CLIENT !== 'false' && existsSync(path.join(publicDir, 'index.html'))) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

async function bootstrap() {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

bootstrap();
