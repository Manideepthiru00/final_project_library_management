import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { Eye, EyeOff } from "lucide-react";

const BookLogo = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mb-2"
  >
    <path
      d="M20 13C22.2091 13 24 11.2091 24 9C24 6.79086 22.2091 5 20 5C17.7909 5 16 6.79086 16 9C16 11.2091 17.7909 13 20 13Z"
      fill="#D2A450"
    />
    <path d="M12 16.5L20 20L28 16.5V26L20 30L12 26V16.5Z" fill="#D2A450" />
    <path d="M12 13.5L20 17L28 13.5L20 10L12 13.5Z" fill="#D2A450" />
  </svg>
);

const SmallLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block mr-2"
  >
    <path
      d="M20 13C22.2091 13 24 11.2091 24 9C24 6.79086 22.2091 5 20 5C17.7909 5 16 6.79086 16 9C16 11.2091 17.7909 13 20 13Z"
      fill="#111"
    />
    <path d="M12 16.5L20 20L28 16.5V26L20 30L12 26V16.5Z" fill="#111" />
    <path d="M12 13.5L20 17L28 13.5L20 10L12 13.5Z" fill="#111" />
  </svg>
);

export default function Login() {
  const [role, setRole] = useState("member"); // 'member' or 'librarian'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // If toggled into librarian portal, we bypass with master credentials for testing if they type nothing
      let targetEmail = email;
      let targetPassword = password;
      if (role === "librarian" && !email) {
        targetEmail = "librarian@library.com";
        targetPassword = "password123";
      }

      const res = await api.post("/auth/login", {
        email: targetEmail,
        password: targetPassword,
      });
      const user = res.data.user;

      if (user.role === "Admin" || user.role === "Librarian") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      const msg = err.response?.data?.message;
      setError(msg || "Login failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const isMember = role === "member";

  return (
    <div className="min-h-screen w-full flex font-[Inter]">
      {/* Left Pane - Hidden on mobile, takes 50% width on md+ */}
      <div
        className="hidden md:flex w-1/2 relative flex-col justify-center px-12 lg:px-20"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark gold overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c180b]/80 to-[#0e0901]/95 mix-blend-multiply"></div>

        {/* Content */}
        <div className="relative z-10 text-white max-w-lg">
          <BookLogo />
          <h1 className="font-['Playfair_Display'] italic font-bold tracking-tight text-white leading-[1.1] mb-6 text-6xl lg:text-7xl">
            The Modern
            <br />
            Library
          </h1>
          <div className="w-16 border-t-4 border-[#A37B2C] mb-6"></div>
          <p className="text-gray-200 text-xl font-light leading-relaxed mb-20 max-w-sm">
            Preserving the legacy of human thought through precision curation
            and digital excellence.
          </p>
          <div className="w-8 border-t border-gray-400 mt-12"></div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full md:w-1/2 bg-[#FDFCF8] flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <div className="w-full max-w-[400px] mx-auto">
          <div className="mb-10">
            <div className="flex items-center mb-2">
              <SmallLogo />
              <span className="font-['Playfair_Display'] italic font-semibold text-lg text-gray-900">
                The Modern Library
              </span>
            </div>
            <h2 className="font-['Playfair_Display'] font-bold text-gray-900 text-[2.5rem]">
              {isMember ? "Access the Stacks" : "Librarian Control"}
            </h2>
          </div>

          <div className="mb-10 mx-auto w-full">
            <div className="w-full h-14 bg-[#F2F0E6] rounded-md p-1 flex relative">
              <button
                type="button"
                className={`flex-1 text-sm font-semibold rounded transition-all duration-300 z-10 ${
                  isMember
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setRole("member")}
              >
                Member Login
              </button>
              <button
                type="button"
                className={`flex-1 text-sm font-semibold rounded transition-all duration-300 z-10 ${
                  !isMember
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setRole("librarian")}
              >
                Librarian Portal
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded text-sm font-medium">
                {success}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-[10px] sm:text-xs font-bold tracking-[0.15em] text-[#93722a] mb-3 uppercase"
              >
                {isMember ? "Email Address" : "Staff Email"}
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                placeholder={
                  isMember ? "user@library.com" : "librarian@library.com"
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] sm:text-xs font-bold tracking-[0.15em] text-[#93722a] mb-3 uppercase"
              >
                {isMember ? "Password" : "Security Password"}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-900 tracking-widest text-lg transition-colors pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-900 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#0B132B] focus:ring-[#0B132B] border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-[13px] text-gray-700 font-medium font-[Inter]"
                >
                  Keep me logged in
                </label>
              </div>

              <div className="text-[13px]">
                <Link
                  to="/password/forgot"
                  className="font-bold text-[#93722a] hover:text-[#7a5f22]"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-[1.125rem] px-4 border border-transparent rounded-[4px] shadow-sm tracking-[0.15em] text-xs font-bold text-white uppercase mt-4 transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0B132B] hover:bg-[#1a233a]"
              }`}
            >
              {isLoading ? "Processing..." : "Click Here →"}
            </button>

            {isMember && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-[#FDFCF8] text-gray-400 uppercase tracking-wider">
                      OR
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center text-[13px]">
                  <span className="text-gray-700 font-medium">
                    New register?{" "}
                  </span>
                  <Link
                    to="/register"
                    className="font-bold text-[#93722a] hover:text-[#7a5f22]"
                  >
                    Create a User Account
                  </Link>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
