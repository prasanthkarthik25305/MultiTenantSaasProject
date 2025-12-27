import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    apiFetch("/tasks").then(setTasks);
  }, []);

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {tasks.map(t => (
          <li key={t.id}>{t.title} ({t.status})</li>
        ))}
      </ul>
    </div>
  );
}
