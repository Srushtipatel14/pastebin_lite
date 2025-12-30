import { useEffect, useState } from "react";
import { useParams,useNavigate} from "react-router-dom";
import { getPaste } from "../api/pastes";
import "../css/viewPaste.css";
import { backbaseURL } from "../api/pastes";


export default function ViewPaste() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState("");
  const navigate=useNavigate()

  useEffect(() => {
    getPaste(id)
      .then((res) => setPaste(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Not found")
      );
  }, [id]);

  if (error) return <p className="vp-error">{error}</p>;
  if (!paste) return <p className="vp-loading">Loading...</p>;

  return (
    <div className="vp-container">
      <h2 className="vp-title">Paste Content</h2>

      <pre className="vp-content">{paste.content}</pre>

      <p className="vp-meta">
        Remaining Views:{" "}
        {paste.remaining_views === null ? "Unlimited" : paste.remaining_views}
      </p>
       <div className="paste-result">
          <p className="paste-success">Copy Link</p>
          <p>{`${backbaseURL}/p/${id}`}</p>
        </div>
        <div style={{display:"flex",justifyContent:"center"}}><button onClick={()=>navigate("/")} style={{padding:"5px 10px",marginTop:"5px"}}>Back</button></div>
    </div>
  );
}
