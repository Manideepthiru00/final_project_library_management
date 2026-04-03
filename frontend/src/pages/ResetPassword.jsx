import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const res = await api.put(`/auth/password/reset/${token}`, { password });
      setMessage(res.data.message || 'Password reset successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-['Inter'] bg-[#FDFCF8] text-gray-800">
      
      {/* Left Pane - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#06101c] overflow-hidden flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none">
           <img 
            src="https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=2000&auto=format&fit=crop" 
            alt="Old Library" 
            className="w-full h-full object-cover filter brightness-50"
          />
        </div>
        <div className="relative z-10">
          <h1 className="font-['Playfair_Display'] font-bold text-2xl tracking-wide">The Modern Archivist</h1>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="font-['Playfair_Display'] text-4xl leading-snug font-medium mb-6">
            "Rebuilding the foundations of knowledge."
          </h2>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col p-8 lg:p-24 relative bg-[#F5F4EF]">
        <Link 
          to="/" 
          className="absolute top-8 right-8 text-sm font-semibold tracking-wide text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span className="mr-2">←</span> Return to Login
        </Link>

        <div className="my-auto max-w-sm w-full mx-auto">
          <h2 className="font-['Playfair_Display'] text-4xl font-bold text-[#0B132B] mb-4">
            New Cipher
          </h2>
          <p className="text-gray-500 mb-8 font-light text-sm leading-relaxed">
             Establish your new security credentials.
          </p>

          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-900 mb-2 uppercase">
                New Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-900 tracking-widest text-lg"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold tracking-[0.15em] text-gray-900 mb-2 uppercase">
                Confirm Security Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-b border-gray-300 bg-transparent py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-900 tracking-widest text-lg"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="text-red-500 text-xs font-bold bg-red-100 p-3 rounded">{error}</div>}
            {message && <div className="text-green-600 text-xs font-bold bg-green-100 p-3 rounded">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 bg-[#050B14] hover:bg-[#1a233a] disabled:bg-gray-400 text-white font-bold tracking-[0.2em] text-[10px] uppercase py-4 rounded shadow-lg"
            >
              {loading ? 'Securing...' : 'Set New Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
