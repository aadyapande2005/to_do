import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  const [todos, setTodos] = React.useState([]);
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setTodos(data);
    } catch {
      setMessage('Could not load tasks');
    } finally {
      setLoading(false);
    }
  }

  async function addTodo(event) {
    event.preventDefault();
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      setMessage('Enter a task first');
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: cleanTitle })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const newTodo = await response.json();
      setTodos((currentTodos) => [newTodo, ...currentTodos]);
      setTitle('');
      setMessage('');
    } catch {
      setMessage('Could not add task');
    }
  }

  async function toggleTodo(todo) {
    try {
      const response = await fetch(`/api/todos/${todo._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const updatedTodo = await response.json();
      setTodos((currentTodos) =>
        currentTodos.map((item) => (item._id === updatedTodo._id ? updatedTodo : item))
      );
    } catch {
      setMessage('Could not update task');
    }
  }

  async function deleteTodo(id) {
    try {
      const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo._id !== id));
    } catch {
      setMessage('Could not delete task');
    }
  }

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Cloud Computing Practical</p>
        <h1>To-Do List</h1>
        <p className="subtext">A simple MERN app with the frontend served by the backend.</p>

        <form className="form" onSubmit={addTodo}>
          <input
            type="text"
            value={title}
            placeholder="Add a task"
            onChange={(event) => setTitle(event.target.value)}
          />
          <button type="submit">Add</button>
        </form>

        {message ? <p className="message">{message}</p> : null}

        <div className="list">
          {loading ? (
            <p className="empty">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="empty">No tasks yet</p>
          ) : (
            todos.map((todo) => (
              <article key={todo._id} className={`todo ${todo.completed ? 'done' : ''}`}>
                <button className="check" onClick={() => toggleTodo(todo)} type="button">
                  {todo.completed ? 'Done' : 'Open'}
                </button>
                <span>{todo.title}</span>
                <button className="delete" onClick={() => deleteTodo(todo._id)} type="button">
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
