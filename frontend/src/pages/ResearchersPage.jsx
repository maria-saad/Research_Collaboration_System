import { useEffect, useState } from "react";
import { researchersApi } from "../api/researchers";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { Link } from "react-router-dom";

export default function ResearchersPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setErr("");
        const data = await researchersApi.list();
        if (mounted) setItems(data);
      } catch (e) {
        setErr(
          e?.response?.data?.error?.message ||
            e.message ||
            "Failed to load researchers",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <Loader text="Loading researchers..." />;
  return (
    <div style={{ padding: 12 }}>
      <h2>Researchers</h2>
      <ErrorBox message={err} />
      <div style={{ marginBottom: 12 }}></div>

      {items.length === 0 ? (
        <div>No researchers found. Create one from Create page.</div>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ borderCollapse: "collapse", marginTop: 12, width: "100%" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Affiliation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r._id}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.affiliation || "-"}</td>
                <td>
                  <Link to={`/profile/${r._id}`}>View Profile</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
