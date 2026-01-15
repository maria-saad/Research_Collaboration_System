import { useEffect, useState } from "react";
import { api } from "../api/client";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";

export default function RecentPublicationsPage() {
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState(null); // { source, limit, publications }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/publications/recent?limit=${limit}`);
      setData(res.data);
    } catch (e) {
      setErr(
        e?.response?.data?.error?.message ||
        e.message ||
        "Failed to load recent publications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loader text="Loading recent publications..." />;

  return (
    <div style={{ padding: 12 }}>
      <h2>Recent Publications</h2>
      <ErrorBox message={err} />

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginTop: 10,
          marginBottom: 10
        }}
      >
        <label>
          Limit:&nbsp;
          <input
            type="number"
            min="1"
            max="50"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{ width: 90 }}
          />
        </label>

        <button onClick={load}>Reload</button>

        {data && "source" in data && (
          <div style={{ marginLeft: "auto" }}>
            <strong>Source:</strong> {data.source}
          </div>
        )}
      </div>

      {!data ? null : (
        <>
          {(data.publications || []).length === 0 ? (
            <div>No publications found.</div>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{ borderCollapse: "collapse", width: "100%" }}
            >
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Year</th>
                  <th>Authors</th>
                </tr>
              </thead>
              <tbody>
                {data.publications.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.year || "-"}</td>
                    <td>
                      {(p.authors || [])
                        .map((a) => a?.name || a?.email || "Unknown")
                        .join(", ") || "-"}
                    </td>
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
