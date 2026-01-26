import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import ErrorBox from "../components/ErrorBox";
import { projectsApi } from "../api/projects";

const emptyForm = {
  title: "",
  description: "",
  domain: "",
  owner: "", // ResearcherId
  collaborators: "", // comma-separated ids
};

export default function ProjectsPage() {
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
      const data = await projectsApi.list();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.error?.message ||
          e.message ||
          "Failed to load projects",
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
        description: form.description.trim(),
        domain: form.domain.trim(),
        owner: form.owner.trim(),
        collaborators: form.collaborators.trim()
          ? form.collaborators
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      };

      if (!payload.title) throw new Error("Title is required");
      if (!payload.owner) throw new Error("Owner (ResearcherId) is required");

      if (editId) {
        await projectsApi.update(editId, payload);
      } else {
        await projectsApi.create(payload);
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
    setForm({
      title: p.title || "",
      description: p.description || "",
      domain: p.domain || "",
      owner:
        p.owner && typeof p.owner === "object" ? p.owner._id : p.owner || "",
      collaborators: Array.isArray(p.collaborators)
        ? p.collaborators
            .map((c) => (typeof c === "object" ? c._id : c))
            .join(", ")
        : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this project?")) return;
    try {
      setErr("");
      setBusy(true);
      await projectsApi.remove(id);
      await load();
      if (editId === id) resetForm();
    } catch (e) {
      setErr(e?.response?.data?.error?.message || e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader text="Loading projects..." />;

  return (
    <div style={{ padding: 12 }}>
      <h2>Projects (CRUD)</h2>
      <ErrorBox message={err} />

      {/* Form */}
      <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd" }}>
        <h3 style={{ marginTop: 0 }}>
          {editId ? "Update Project" : "Add Project"}
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
              Description
              <textarea
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
                style={{ width: "100%" }}
                rows={3}
              />
            </label>

            <label>
              Domain
              <input
                value={form.domain}
                onChange={(e) => onChange("domain", e.target.value)}
                style={{ width: "100%" }}
              />
            </label>

            <label>
              Owner (ResearcherId) *
              <input
                value={form.owner}
                onChange={(e) => onChange("owner", e.target.value)}
                style={{ width: "100%" }}
                placeholder="MongoDB Researcher _id"
              />
            </label>

            <label>
              Collaborators (comma separated ResearcherIds)
              <input
                value={form.collaborators}
                onChange={(e) => onChange("collaborators", e.target.value)}
                style={{ width: "100%" }}
                placeholder="id1, id2, id3"
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
            <th>Domain</th>
            <th>Owner</th>
            <th>Collaborators</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p._id}>
              <td>{p.title}</td>
              <td>{p.domain || "-"}</td>
              <td>
                {p.owner && typeof p.owner === "object"
                  ? p.owner.name || p.owner._id
                  : p.owner || "-"}
              </td>
              <td>
                {Array.isArray(p.collaborators) ? p.collaborators.length : 0}
              </td>
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
              <td colSpan="5">No projects found.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
