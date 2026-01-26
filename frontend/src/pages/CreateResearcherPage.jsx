import { useState } from "react";
import { api } from "../api/client";
import ErrorBox from "../components/ErrorBox";

export default function CreateResearcherPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [interests, setInterests] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    try {
      const payload = {
        name,
        email,
        affiliation,
        interests: interests
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await api.post("/researchers", payload);
      setMsg(`Created researcher with id: ${res.data._id}`);
      setName("");
      setEmail("");
      setAffiliation("");
      setInterests("");
    } catch (e2) {
      setErr(
        e2?.response?.data?.error?.message || e2.message || "Create failed",
      );
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <h2>Create Researcher</h2>
      <ErrorBox message={err} />
      {msg ? (
        <div
          style={{
            padding: 10,
            background: "#eef9ee",
            border: "1px solid #b7e3b7",
          }}
        >
          {msg}
        </div>
      ) : null}

      <form onSubmit={submit} style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <label>Name</label>
          <br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: 380 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <br />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: 380 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Affiliation</label>
          <br />
          <input
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
            style={{ width: 380 }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Interests (comma-separated)</label>
          <br />
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            style={{ width: 380 }}
          />
        </div>

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
