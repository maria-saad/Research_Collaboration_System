import { useEffect, useState } from "react";
import { api } from "../api/client";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";

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
      setErr(e?.response?.data?.error?.message || e.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(limit); }, []);

  return (
    <div style={{ padding: 12 }}>
      <h2>Analytics — Top Researchers</h2>
      <ErrorBox message={err} />

      <div style={{ marginTop: 10 }}>
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
        <button style={{ marginLeft: 10 }} onClick={() => load(limit)}>
          Refresh
        </button>
      </div>

      {loading ? <Loader text="Loading analytics..." /> : null}

      {!loading && data ? (
        <>
          <div style={{ marginTop: 10 }}><strong>Source:</strong> {data.source}</div>

          <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", marginTop: 12, width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Collaborations Count</th>
              </tr>
            </thead>
            <tbody>
              {(data.topResearchers || []).map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.email}</td>
                  <td>{r.collaborationsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}
    </div>
  );
}
