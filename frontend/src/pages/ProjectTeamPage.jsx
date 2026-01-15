import { useState } from "react";
import { api } from "../api/client";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { Link } from "react-router-dom";

export default function ProjectTeamPage() {
  const [projectId, setProjectId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!projectId) return;
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/projects/${projectId}/team`);
      setData(res.data);
    } catch (e) {
      setErr(
        e?.response?.data?.error?.message ||
        e.message ||
        "Failed to load project team"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Project Team (MongoDB + Neo4j)</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/researchers">← Back to Researchers</Link>
      </div>

      <ErrorBox message={err} />

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Enter Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{ width: 320 }}
        />
        <button onClick={load}>Load Team</button>
      </div>

      {loading ? <Loader text="Loading project team..." /> : null}

      {!loading && data ? (
        <>
          <h3 style={{ marginTop: 16 }}>
            Project: {data.title || data.projectId}
          </h3>

          <h4>Team Members</h4>
          {(data.members || []).length === 0 ? (
            <div>No members found.</div>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Affiliation</th>
                </tr>
              </thead>
              <tbody>
                {data.members.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.affiliation || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <h4 style={{ marginTop: 16 }}>Collaborations (Neo4j)</h4>
          {(data.collaborations || []).length === 0 ? (
            <div>No collaboration relationships found in Neo4j.</div>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>From Researcher ID</th>
                  <th>To Researcher ID</th>
                  <th>Weight</th>
                </tr>
              </thead>
              <tbody>
                {data.collaborations.map((c, idx) => (
                  <tr key={`${c.fromId}-${c.toId}-${idx}`}>
                    <td>{c.fromId}</td>
                    <td>{c.toId}</td>
                    <td>{c.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : null}
    </div>
  );
}
