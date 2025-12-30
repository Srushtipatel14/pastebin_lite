import { useState } from "react";
import { createPaste } from "../api/pastes";
import { useNavigate } from "react-router-dom";
import "../css/createPaste.css";

export default function CreatePaste() {
  const [content, setContent] = useState("");
  const [ttl, setTtl] = useState("");
  const [views, setViews] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate=useNavigate();

  const submit = async () => {
    try {
      setError("");
      const res = await createPaste({
        content,
        ttl_seconds: ttl ? Number(ttl) : undefined,
        max_views: views ? Number(views) : undefined
      });
      setContent("")
      setTtl("")
      setViews("")
      navigate(`/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || "Failed");
    }
  };

  return (
    <div className="paste-container">
      <h2 className="paste-title">Create Paste</h2>

      <textarea
        className="paste-textarea"
        rows={10}
        placeholder="Paste text here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="paste-input-row">
        <input
          className="paste-input"
          placeholder="TTL (seconds)"
          value={ttl}
          onChange={(e) => setTtl(e.target.value)}
        />
        <input
          className="paste-input"
          placeholder="Max Views"
          value={views}
          onChange={(e) => setViews(e.target.value)}
        />
      </div>

      <button className="paste-button" onClick={submit}>
        Create Paste
      </button>

      {result && error==="" && (
        <div className="paste-result">
          <p className="paste-success">🎉 Paste created 🎉</p>
          <a
            href={result.url}
            target="_blank"
            rel="noreferrer"
            className="paste-link"
          >
            {result.url}
          </a>
        </div>
      )}

      {error && <p className="paste-error">{error}</p>}
    </div>
  );
}
