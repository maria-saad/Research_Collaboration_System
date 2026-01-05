import { Link, NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  marginRight: 12,
  textDecoration: "none",
  fontWeight: isActive ? "700" : "400",
});

export default function NavBar() {
  return (
    <div style={{ padding: 12, borderBottom: "1px solid #ddd", marginBottom: 16 }}>
      <Link to="/" style={{ marginRight: 18, textDecoration: "none" }}>
        <strong>RCS</strong>
      </Link>

      <NavLink to="/researchers" style={linkStyle}>Researchers</NavLink>
      <NavLink to="/analytics" style={linkStyle}>Analytics</NavLink>
      <NavLink to="/create" style={linkStyle}>Create</NavLink>
    </div>
  );
}
