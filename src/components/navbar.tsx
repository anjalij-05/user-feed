import { Link } from "react-router-dom";
import Logo from "@/assets/logo.webp";

export default function Navbar() {
  return (
    <div>
      <nav className="w-full flex justify-between items-center text-sm">
        <Link to="/">
          <img
            width={152}
            height={69}
            src={Logo}
            alt="logo"
            className="w-24 sm:w-32 md:w-38 h-auto"
          />{" "}
        </Link>
      </nav>
    </div>
  );
}
