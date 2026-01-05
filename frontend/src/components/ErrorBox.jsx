export default function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <div style={{ padding: 12, background: "#ffecec", border: "1px solid #ffb3b3" }}>
      <strong>Error:</strong> {message}
    </div>
  );
}
