import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";

export default function ProfilePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErr("");
        setLoading(true);
        const res = await api.get(`/researchers/${id}/profile`);
        if (mounted) setData(res.data);
      } catch (e) {
        setErr(
          e?.response?.data?.error?.message ||
          e.message ||
          "Failed to load profile"
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <div style={{ padding: 12 }}>
      <h2>Researcher Profile</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/researchers">← Back to Researchers</Link>
      </div>

      <ErrorBox message={err} />

      {!data ? null : (
        <>
          <div
            style={{
              marginTop: 10,
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 6
            }}
          >
            {"source" in data && (
              <div>
                <strong>Source:</strong> {data.source}
              </div>
            )}

            <div>
              <strong>Name:</strong> {data.researcher?.name}
            </div>

            <div>
              <strong>Email:</strong> {data.researcher?.email}
            </div>

            <div>
              <strong>Affiliation:</strong>{" "}
              {data.researcher?.affiliation || "-"}
            </div>

            <div>
              <strong>Interests:</strong>{" "}
              {(data.researcher?.interests || []).join(", ") || "-"}
            </div>
          </div>

          <h3 style={{ marginTop: 16 }}>Collaborators</h3>

          {(data.collaborators || []).length === 0 ? (
            <div>No collaborators found in Neo4j for this researcher.</div>
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
                  <th>Neo4j / Mongo Id</th>
                </tr>
              </thead>
              <tbody>
                {data.collaborators.map((c) => (
                  <tr key={c.id || `${c.email}-${c.name}`}>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
