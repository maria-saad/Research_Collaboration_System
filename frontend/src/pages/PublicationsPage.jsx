import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { publicationsApi } from "../api/publications";

const emptyForm = {
  title: "",
  year: "",
  venue: "",
  keywords: "",
  authors: "", // comma-separated researcher ids
  project: "", // optional project id
};

export default function PublicationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    try {
      setErr("");
      setLoading(true);
      const data = await publicationsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.error?.message ||
          e.message ||
          "Failed to load publications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      setBusy(true);

      const payload = {
        title: form.title.trim(),
        year: Number(form.year),
        venue: form.venue.trim(),
        keywords: form.keywords.trim()
          ? form.keywords
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        authors: form.authors.trim()
          ? form.authors
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        ...(form.project.trim() ? { project: form.project.trim() } : {}),
      };

      if (!payload.title) throw new Error("Title is required");
      if (!payload.year || Number.isNaN(payload.year))
        throw new Error("Year must be a number");
      if (!payload.authors.length)
        throw new Error("At least one author is required");

      if (editId) {
        await publicationsApi.update(editId, payload);
      } else {
        await publicationsApi.create(payload);
      }

      await load();
      resetForm();
    } catch (e2) {
      setErr(e2?.response?.data?.error?.message || e2.message || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p) => {
    setErr("");
    setEditId(p._id);

    const authorsStr = Array.isArray(p.authors)
      ? p.authors.map((a) => (typeof a === "object" ? a._id : a)).join(", ")
      : "";

    setForm({
      title: p.title || "",
      year: String(p.year || ""),
      venue: p.venue || "",
      keywords: Array.isArray(p.keywords) ? p.keywords.join(", ") : "",
      authors: authorsStr,
      project:
        p.project && typeof p.project === "object"
          ? p.project._id
          : p.project || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this publication?")) return;
    try {
      setErr("");
      setBusy(true);
      await publicationsApi.remove(id);
      await load();
      if (editId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader text="Loading publications..." />;

  return (
    <div style={{ padding: 12 }}>
      <h2>Publications (CRUD)</h2>
      <ErrorBox message={err} />

      {/* Form */}
      <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd" }}>
        <h3 style={{ marginTop: 0 }}>
          {editId ? "Update Publication" : "Add Publication"}
        </h3>

        <form onSubmit={submit}>
          <div style={{ display: "grid", gap: 8 }}>
            <label>
              Title *
              <input
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Year *
              <input
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={(e) => onChange("year", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Venue
              <input
                value={form.venue}
                onChange={(e) => onChange("venue", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Keywords (comma separated)
              <input
                value={form.keywords}
                onChange={(e) => onChange("keywords", e.target.value)}
                style={{ width: "100%" }}
                placeholder="Graph, NoSQL, Analytics"
              />
            </label>

            <label>
              Authors (comma separated ResearcherIds) *
              <input
                value={form.authors}
                onChange={(e) => onChange("authors", e.target.value)}
                style={{ width: "100%" }}
                placeholder="id1, id2"
              />
            </label>

            <label>
              Project (optional ProjectId)
              <input
                value={form.project}
                onChange={(e) => onChange("project", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={busy} type="submit">
                {busy ? "Saving..." : editId ? "Update" : "Create"}
              </button>
              <button disabled={busy} type="button" onClick={resetForm}>
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table */}
      <table
        border="1"
        cellPadding="8"
        style={{ borderCollapse: "collapse", marginTop: 12, width: "100%" }}
      >
        <thead>
          <tr>
            <th>Title</th>
            <th>Year</th>
            <th>Venue</th>
            <th>#Authors</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.year}</td>
              <td>{p.venue || "-"}</td>
              <td>{Array.isArray(p.authors) ? p.authors.length : 0}</td>
              <td style={{ whiteSpace: "nowrap" }}>
                <button disabled={busy} onClick={() => startEdit(p)}>
                  Edit
                </button>
                <button
                  disabled={busy}
                  onClick={() => remove(p._id)}
                  style={{ marginLeft: 8 }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 ? (
            <tr>
              <td colSpan="5">No publications found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
