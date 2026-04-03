import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRecover = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/password/forgot', { email });
      setMessage(res.data.message || 'Recovery process initiated. Check your email (or automatic redirection).');
      // For local testing without SMTP, our backend returns the redirect token!
      if (res.data.resetToken) {
         setTimeout(() => {
            navigate(`/password/reset/${res.data.resetToken}`);
         }, 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate recovery.');
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
          <h1 className="font-['Playfair_Display'] font-bold text-2xl tracking-wide flex items-center">
            The Modern Archivist
          </h1>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-['Playfair_Display'] text-4xl leading-snug font-medium mb-6">
            "The archive is not a quiet tomb, but a living dialogue between what was and what will be."
          </h2>
          <div className="flex items-center text-[10px] font-bold tracking-[0.2em] text-[#93722a] uppercase">
            <span className="w-8 h-px border-t border-[#93722a] mr-4"></span>
            Institutional Mandate 1892
          </div>
        </div>

        <div className="relative z-10 flex items-center text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase">
          <span className="mr-2 text-indigo-400">🛡</span> Encrypted Scholarly Access
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex-1 flex flex-col pt-12 p-8 lg:p-24 relative bg-[#F5F4EF]">
        <Link 
          to="/" 
          className="absolute top-8 right-8 text-sm font-semibold tracking-wide text-gray-600 hover:text-gray-900 flex items-center"
        >
          <span className="mr-2">←</span> Return to Login
        </Link>

        <div className="my-auto max-w-md w-full mx-auto">
          <h2 className="font-['Playfair_Display'] text-5xl font-bold text-[#0B132B] mb-4">
            Recover Access
          </h2>
          <p className="text-gray-500 mb-8 font-light text-sm leading-relaxed max-w-sm">
            Enter your institutional email to begin the archival recovery process.
          </p>

          <form onSubmit={handleRecover} className="space-y-6">
            <div>
              <label 
                htmlFor="email" 
                className="block text-[10px] font-bold tracking-[0.15em] text-gray-900 mb-2 uppercase"
              >
                Institutional Email / Librarian ID
              </label>
              <div className="relative border border-gray-200 bg-[#EFECE3] rounded-md flex items-center transition-colors focus-within:border-gray-500">
                <span className="pl-4 text-gray-500 text-lg">@</span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-4 px-4 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
                  placeholder="librarian.name@institution.org"
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-bold bg-red-100 p-3 rounded">{error}</div>}
            {message && <div className="text-green-600 text-xs font-bold bg-green-100 p-3 rounded">{message}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#050B14] hover:bg-[#1a233a] disabled:bg-gray-400 text-white font-bold tracking-[0.2em] text-[10px] uppercase py-4 rounded transition-colors flex items-center justify-center shadow-lg"
            >
              {loading ? 'Processing...' : 'Begin Recovery'}
              <span className="ml-3 text-yellow-500">⇲</span>
            </button>
          </form>

          {/* Assistance Box */}
          <div className="mt-12 bg-[#EBE9Df] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center border border-gray-200">
            <div className="w-10 h-10 bg-[#E0DCCF] rounded-full flex items-center justify-center text-[#8c6b22] text-xl shrink-0 mb-4 sm:mb-0 sm:mr-4 border border-gray-300">
              ☖
            </div>
            <div>
              <h4 className="text-[10px] font-bold tracking-widest text-gray-900 uppercase mb-1">Need Further Assistance?</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                If you cannot access your institutional email, please <span className="font-bold text-[#8c6b22] cursor-pointer hover:underline">Contact the High Archivist</span> directly for identity verification.
              </p>
            </div>
          </div>

          <div className="mt-12 flex justify-center space-x-6 text-[8px] font-bold tracking-[0.2em] text-gray-400 uppercase">
             <span className="flex items-center"><span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-2"></span> Systems Nominal</span>
             <span>•</span>
             <span>v4.2.0-Archival</span>
          </div>

        </div>
      </div>
    </div>
  );
}
