import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div>
      <Link to="/todos">
        <button>todo 페이지</button>
      </Link>
    </div>
  );
}
