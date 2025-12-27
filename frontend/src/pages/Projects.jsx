import { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    apiFetch("/projects").then(setProjects);
  }, []);

  return (
    <div>
      <h2>Projects</h2>
      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
    </div>
  );
}
