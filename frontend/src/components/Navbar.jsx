import { useAuth } from "../auth/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="role-badge">{user.role}</span>

        <a href="/dashboard">Dashboard</a>

        {user.role === "tenant_admin" && (
          <a href="/users">Users</a>
        )}

        <a href="/projects">Projects</a>
        <a href="/tasks">Tasks</a>
      </div>

      <div className="navbar-right">
        <button className="btn btn-logout" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
