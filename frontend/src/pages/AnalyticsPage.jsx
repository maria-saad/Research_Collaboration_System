import { useEffect, useState } from "react";
import { api } from "../api/client";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { Link } from "react-router-dom";

export default function AnalyticsPage() {
  const [limit, setLimit] = useState(5);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async (l) => {
    try {
      setErr("");
      setLoading(true);
      const res = await api.get(`/analytics/top-researchers?limit=${l}`);
      setData(res.data);
    } catch (e) {
      setErr(
        e?.response?.data?.error?.message ||
          e.message ||
          "Failed to load analytics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(limit);
    // نحمّل مرة واحدة عند فتح الصفحة
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <h2>Analytics — Top Researchers</h2>

      <div style={{ marginBottom: 12 }}>
        <Link to="/researchers">← Back to Researchers</Link>
      </div>

      <ErrorBox message={err} />

      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
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
            style={{ width: 80 }}
          />
        </label>

        <button onClick={() => load(limit)}>Refresh</button>

        {data && "source" in data && (
          <div style={{ marginLeft: "auto" }}>
            <strong>Source:</strong> {data.source}
          </div>
        )}
      </div>

      {loading ? <Loader text="Loading analytics..." /> : null}

      {!loading && data ? (
        <>
          {(data.topResearchers || []).length === 0 ? (
            <div style={{ marginTop: 12 }}>No analytics results found.</div>
          ) : (
            <table
              border="1"
              cellPadding="8"
              style={{
                borderCollapse: "collapse",
                marginTop: 12,
                width: "100%",
              }}
            >
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Collaborations Count</th>
                </tr>
              </thead>
              <tbody>
                {data.topResearchers.map((r, idx) => (
                  <tr key={r.id || r.email || r.name || idx}>
                    <td>{idx + 1}</td>
                    <td>{r.name || "-"}</td>
                    <td>{r.email || "-"}</td>
                    <td>{r.collaborationsCount ?? "-"}</td>
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
