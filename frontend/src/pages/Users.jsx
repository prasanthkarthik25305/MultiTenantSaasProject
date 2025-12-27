import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    apiFetch("/users").then(setUsers);
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>{u.email} ({u.role})</li>
        ))}
      </ul>
    </div>
  );
}
