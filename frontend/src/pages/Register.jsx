import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Eye, EyeOff } from 'lucide-react';

const BookLogoTeal = () => (
  <div className="flex items-center space-x-3 mb-32 md:mb-0">
    <div className="bg-[#D2A450] p-1.5 rounded-md flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M4 4C4 2.89543 4.89543 2 6 2H18C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4ZM12 18H6V4H12V18ZM14 4V18H18V4H14Z" fill="#111111"/>
        <path d="M10 6L8 8V12L10 10V6Z" fill="#111111"/>
      </svg>
    </div>
    <span className="font-['Playfair_Display'] italic text-white text-xl font-medium tracking-wide">
      Modern Archivist
    </span>
  </div>
);

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (!agreed) {
      return setError('You must agree to the Terms of Service & Policy.');
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', { 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      setSuccessMsg(res.data.message || 'Registration successful! Proceed to login.');
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('REGISTER ERROR:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex font-[Inter]">
      
      {/* Left Pane */}
      <div 
        className="hidden md:flex w-5/12 relative flex-col justify-between py-12 px-12 lg:px-16"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
        }}
      >
        <div className="absolute inset-0 bg-linear-to-b from-[#021120]/90 to-[#020e19]/95 mix-blend-multiply z-0"></div>
        <div className="absolute inset-0 bg-[#061e38]/40 mix-blend-color z-0"></div>

        <div className="relative z-10">
          <BookLogoTeal />
        </div>
        
        <div className="relative z-10 text-white mt-auto mb-32 pr-8">
          <h1 className="font-['Playfair_Display'] font-bold tracking-tight text-white leading-tight mb-8 text-5xl xl:text-[3.5rem]">
            Preserving history<br />for the digital age.
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-light leading-relaxed max-w-md opacity-90">
            Join an elite circle of digital curators and researchers. Access the world's most comprehensive collection of digitized manuscripts and artifacts.
          </p>
        </div>

        <div className="relative z-10 mt-auto">
          <p className="text-[#64748B] text-[10px] tracking-[0.2em] uppercase font-semibold">
            © 2024 THE MODERN LIBRARY • ESTABLISHED 1892
          </p>
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full md:w-7/12 bg-[#FDFCF8] flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-12 overflow-y-auto">
        <div className="w-full max-w-[500px]">
          
          <div className="mb-12">
            <h2 className="font-['Playfair_Display'] font-bold text-gray-900 text-4xl sm:text-5xl mb-4 tracking-tight">
              Begin Registration
            </h2>
            <p className="text-gray-600 text-[15px]">
              Create your credentials to access the digital archives.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-3 rounded text-sm font-medium">
                {successMsg} Redirecting...
              </div>
            )}
            
            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#6b6b6b] mb-3 uppercase">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-600 transition-colors"
                placeholder="Johnathan Doe"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#6b6b6b] mb-3 uppercase">
                Institutional Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-600 transition-colors"
                placeholder="curator@modernarchivist.org"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#6b6b6b] mb-3 uppercase">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-600 transition-colors"
                placeholder="j.doe_archivist"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-8 sm:space-y-0 sm:space-x-8">
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#6b6b6b] mb-3 uppercase">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-600 tracking-widest text-lg transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="w-full sm:w-1/2">
                <label className="block text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#6b6b6b] mb-3 uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-gray-300 pb-2 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-gray-600 tracking-widest text-lg transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 bottom-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start mt-8 pt-4">
              <div className="flex items-center h-5">
                <input
                  id="agree"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-[18px] w-[18px] appearance-none border border-gray-400 rounded-full checked:bg-white checked:border-[#D2A450] transition relative after:content-[''] after:hidden checked:after:block after:absolute after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:w-2.5 after:h-2.5 after:bg-[#D2A450] after:rounded-full cursor-pointer"
                />
              </div>
              <div className="ml-3 text-[13.5px]">
                <label htmlFor="agree" className="text-gray-600 cursor-pointer">
                  I agree to the <span className="font-semibold text-[#8c6b22]">Terms of Service</span> and the <span className="font-semibold text-[#8c6b22]">Digital Archival Policy</span>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4.5 px-4 border border-transparent rounded-[4px] shadow-sm tracking-[0.15em] text-xs font-bold text-white uppercase mt-6 transition-colors ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#050B14] hover:bg-[#1a233a]'
              }`}
            >
              {isLoading ? 'Processing...' : 'Create Account →'}
            </button>

            <div className="mt-12 pt-8 text-center text-[13px] border-t border-gray-200">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/" className="font-bold tracking-wide text-[#8c6b22] hover:text-[#7a5f22] ml-1 uppercase text-[12px]">
                Login Here
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
