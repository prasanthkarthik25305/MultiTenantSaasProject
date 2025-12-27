import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { apiFetch } from "../api/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    tasks: 0,
    users: 0,
    completedTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projects, tasks, users] = await Promise.all([
          apiFetch("/projects"),
          apiFetch("/tasks"),
          user?.role === "tenant_admin" ? apiFetch("/users") : Promise.resolve([])
        ]);

        const completedTasks = tasks.filter(t => t.status === "completed").length;

        setStats({
          projects: projects.length,
          tasks: tasks.length,
          users: users.length,
          completedTasks
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="welcome-section">
        <h2>Welcome, {user?.fullName}!</h2>
        <p>Role: <strong>{user?.role}</strong></p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Projects</h3>
          <p className="stat-number">{stats.projects}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p className="stat-number">{stats.tasks}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number">{stats.completedTasks}</p>
        </div>
        {user?.role === "tenant_admin" && (
          <div className="stat-card">
            <h3>Users</h3>
            <p className="stat-number">{stats.users}</p>
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <a href="/projects" className="btn btn-primary">View Projects</a>
          <a href="/tasks" className="btn btn-primary">View Tasks</a>
          {user?.role === "tenant_admin" && (
            <a href="/users" className="btn btn-primary">Manage Users</a>
          )}
        </div>
      </div>
    </div>
  );
}