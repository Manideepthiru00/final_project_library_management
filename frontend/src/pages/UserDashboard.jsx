import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  User, 
  Settings, 
  HelpCircle, 
  Bell, 
  Clock, 
  LogOut, 
  ArchiveX, 
  Library, 
  Clock3
} from 'lucide-react';
import NotificationArea from "../components/NotificationArea";
import api from '../api';

const SidebarItem = ({ icon, text, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center px-6 py-3 cursor-pointer transition-colors ${active ? 'bg-[#EFECE1] border-l-4 border-[#8c6b22] text-[#0B132B] font-bold' : 'border-l-4 border-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900'}`}
  >
    <span className={`mr-4 ${active ? 'text-[#0B132B]' : 'text-gray-400'}`}>{icon}</span>
    <span className="text-sm tracking-wide">{text}</span>
  </div>
);

const BookCard = ({ image, category, status, title, author, score, actionText, actionDisabled, onAction }) => (
  <div className="bg-[#EBE9DF] rounded-xl p-4 border border-gray-200/50 shadow-sm flex flex-col group relative">
     {/* Image Container */}
     <div className="bg-[#FDFCF8] rounded-lg p-2 flex items-center justify-center mb-4 min-h-[220px] relative overflow-hidden group-hover:shadow-md transition-shadow">
        
        {/* Category Tag */}
        <div className="absolute top-3 left-0 w-full flex justify-center z-10">
           <span className="text-[8px] font-bold tracking-[0.2em] text-[#A37B2C] uppercase drop-shadow-md">{category}</span>
        </div>
        
        {/* Status Pill */}
        <div className="absolute top-8 right-3 z-10 flex flex-col items-end gap-1">
           <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full flex items-center shadow-sm ${status === 'AVAILABLE' || status === 'DIGITAL ONLY' ? 'bg-[#F2F0E6] text-gray-800' : status === 'YOU HAVE THIS' ? 'bg-[#0B132B] text-yellow-500 ring-2 ring-yellow-500/50 blink-slow' : 'bg-[#E3D9C8] text-[#A37B2C]'}`}>
             {(status === 'AVAILABLE' || status === 'DIGITAL ONLY') && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>}
             {status}
           </span>
        </div>

        {/* Cover */}
        {image ? (
           <img src={image} alt={title} className="max-h-[190px] drop-shadow-xl z-0 group-hover:scale-105 transition-transform duration-500" />
        ) : (
           <div className="w-32 h-44 bg-[#1C2331] rounded shadow-lg border-l-2 border-orange-400 flex flex-col items-center justify-center p-3 text-center text-white z-0">
             <span className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-2">Ref</span>
             <span className="text-sm font-serif italic text-orange-200">{title}</span>
           </div>
        )}
     </div>

     {/* Info */}
     <div className="flex-1 flex flex-col justify-between">
       <div>
         <h4 className="font-['Playfair_Display'] font-bold text-gray-900 text-lg leading-tight mb-1">{title}</h4>
         <p className="text-[11px] text-gray-500 mb-3">{author}</p>
         
         {/* Rating */}
         <div className="flex items-center space-x-1 mb-4">
           {Array(5).fill(0).map((_, i) => (
             <span key={i} className="text-[#8c6b22] text-[10px]">★</span>
           ))}
           <span className="text-[9px] text-gray-400 font-bold ml-2">({score})</span>
         </div>

         {actionText && (
            <button
              onClick={(e) => { e.stopPropagation(); onAction && onAction(); }}
              disabled={actionDisabled}
              className={`w-full mt-2 text-[10px] font-bold tracking-[0.1em] uppercase py-2 rounded transition-colors flex items-center justify-center ${actionDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#0B132B] hover:bg-[#1a233a] text-white shadow-sm'}`}
            >
              {actionText}
            </button>
         )}
       </div>
     </div>
  </div>
);

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [activeTab, setActiveTab] = useState('Catalog');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [agendaTasks, setAgendaTasks] = useState([
    { id: 1, text: "Return Dante's Divine Comedy", done: true },
    { id: 2, text: "Collect Borrowd manuscript", done: false },
    { id: 3, text: "Update research proposal", done: false }
  ]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [yearFilter, setYearFilter] = useState(1850);
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('userAgenda');
    if (saved) setAgendaTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('userAgenda', JSON.stringify(agendaTasks));
  }, [agendaTasks]);

  const toggleTask = (id) => {
    setAgendaTasks(agendaTasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      setAgendaTasks([...agendaTasks, { id: Date.now(), text: newTaskText, done: false }]);
      setNewTaskText("");
      setIsAddingTask(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const res = await api.get('/auth/me');
      const userData = res.data.user || res.data;
      if (userData.role === 'Admin' || userData.role === 'Librarian') {
        navigate('/admin');
        return;
      } else {
        setUser(userData);
      }

        const [booksRes, borrowsRes, resRes] = await Promise.all([
           api.get('/books/all'),
           api.get('/borrows/my-borrows'),
           api.get('/books/reservations/all').catch(() => ({ data: { reservations: [] } }))
        ]);

        setBooks(booksRes.data.books || booksRes.data || []);
        if (borrowsRes.data && borrowsRes.data.borrows) {
           setBorrows(borrowsRes.data.borrows);
        }
        setReservations(resRes.data?.reservations || []);
      } catch (err) {
        console.error("Dashboard synchronization error:", err);
        // Do not alert 404 if it is just a background sync issue
      }
    };

  const handleBorrow = async (bookId, currentAvail) => {
     if (currentAvail < 1) {
        alert("This record is currently Out of Stock. Librarian mediated issue only.");
        return;
     }
     
     try {
        const res = await api.post('/borrows/submit-request', { bookId });
        if (res.data.success) {
           alert("Borrow request sent! Visit the librarian desk for physical verification.");
           fetchData();
        }
     } catch (err) {
        alert(err.response?.data?.message || err.message);
     }
  };

  const handleRequestReturn = async (borrowId) => {
     try {
        const res = await api.post('/borrows/request-return', { borrowId });
        if (res.data.success) {
           alert("Success! Return requested. Please connect with the librarian to update data.");
           fetchData(); // Reload the list
        }
     } catch (err) {
        alert(err.response?.data?.message || err.message);
     }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]"><p className="text-xl font-semibold text-gray-600">Loading Digital Archives...</p></div>;
  }

  return (
    <div className="min-h-screen bg-[#F5F4EF] flex font-['Inter'] text-gray-800">
      
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#FDFCF8] border-r border-gray-200 hidden lg:flex flex-col shrink-0 shadow-[inset_-4px_0_10px_rgba(0,0,0,0.01)] h-screen overflow-y-auto">
        <div>
          <div className="p-8 pb-4">
            <h1 className="font-['Playfair_Display'] font-bold text-xl text-[#0B132B]">The Modern Library</h1>
            <p className="text-[9px] tracking-[0.2em] font-bold text-gray-400 uppercase mt-1">Digital Curator System</p>
          </div>

          <nav className="flex-1 mt-6 space-y-1">
            <SidebarItem icon={<LayoutDashboard size={20} />} text="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
            <SidebarItem icon={<Search size={20} />} text="Catalog" active={activeTab === 'Catalog'} onClick={() => setActiveTab('Catalog')} />
            <SidebarItem icon={<User size={20} />} text="My Account" active={activeTab === 'My Account'} onClick={() => setActiveTab('My Account')} />
          </nav>
        </div>

        {/* New Arrival Widget */}
        {books.length > 0 && (
          <div className="px-6 mt-8 mb-4">
             <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm relative">
               <div className="flex items-center mb-3">
                 <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                 <span className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">New Arrival</span>
               </div>
               <div className="flex items-center mb-4">
                 {books[0].coverImage?.url ? (
                    <img src={books[0].coverImage.url} alt="cover" className="w-8 h-12 rounded shadow-sm mr-3 flex-shrink-0 object-cover" />
                 ) : (
                    <div className="w-8 h-12 bg-gray-800 rounded shadow-sm mr-3 flex-shrink-0 border-l border-orange-400"></div>
                 )}
                 <div className="min-w-0 pr-2">
                    <h5 className="text-xs font-bold text-gray-900 font-['Playfair_Display'] leading-tight truncate" title={books[0].title}>{books[0].title}</h5>
                    <p className="text-[9px] text-gray-400 mt-0.5 truncate">{books[0].author}</p>
                 </div>
               </div>
               <button onClick={() => setActiveTab('Catalog')} className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white py-2 rounded text-[9px] font-bold tracking-[0.1em] uppercase transition-colors shadow-sm">
                 Explore Catalog
               </button>
             </div>
          </div>
        )}

        <div className="p-6 space-y-4 mt-auto border-t border-gray-100">
          <div onClick={() => setActiveTab('Settings')} className={`flex items-center cursor-pointer text-sm font-medium transition-colors ${activeTab === 'Settings' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            <Settings size={20} className="mr-4" /> Settings
          </div>
          <div onClick={() => setActiveTab('Support')} className={`flex items-center cursor-pointer text-sm font-medium transition-colors ${activeTab === 'Support' ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}>
            <HelpCircle size={20} className="mr-4" /> Support
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 border-b border-gray-200 bg-[#FDFCF8] flex items-center justify-between px-8 shrink-0">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                 <Search size={16} />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the library collections..." 
                className="w-full bg-[#F5F4EF] rounded-md py-2.5 pl-10 pr-4 text-xs tracking-wide focus:outline-none focus:ring-1 focus:ring-gray-300 transition-shadow"
              />
            </div>
            <nav className="hidden md:flex ml-8 space-x-6 text-sm text-gray-500 font-medium tracking-wide">
              <span onClick={() => setActiveTab('Recent')} className={`cursor-pointer hover:text-gray-900 ${activeTab === 'Recent' ? 'text-gray-900 font-bold' : ''}`}>Recent</span>
              <span onClick={() => setActiveTab('Reservations')} className={`cursor-pointer hover:text-gray-900 ${activeTab === 'Reservations' ? 'text-gray-900 font-bold' : ''}`}>Reservations</span>
              <span onClick={() => setActiveTab('Overdue')} className={`cursor-pointer hover:text-gray-900 ${activeTab === 'Overdue' ? 'text-gray-900 font-bold' : ''}`}>Overdue</span>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationArea />
            <div className="cursor-pointer text-gray-500 hover:text-gray-900">
              <Clock3 size={22} />
            </div>
            <div className="relative">
              <div 
                className="w-9 h-9 bg-gray-300 rounded-full overflow-hidden border border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-all hover:scale-105 shrink-0" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B132B&color=FDFCF8&bold=true&rounded=true`} alt={user.name} className="w-full h-full object-cover" />
              </div>
              
              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)}></div>
                  
                  <div className="absolute top-14 right-0 w-72 bg-[#FDFCF8] border border-gray-200/80 shadow-2xl rounded-xl overflow-hidden z-50 transform origin-top-right transition-all">
                    
                    <div className="p-5 border-b border-gray-100 bg-[#F5F4EF]">
                       <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white shrink-0">
                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B132B&color=FDFCF8&bold=true&rounded=true`} alt={user.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                             <p className="font-['Playfair_Display'] font-bold text-gray-900 text-xl leading-tight">{user.name}</p>
                             <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                          </div>
                       </div>
                       <div className="flex items-center justify-between mt-4">
                          <div>
                             <p className="text-[8px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase">Library ID</p>
                             <p className="text-[10px] font-mono text-gray-600 mt-0.5">{user._id.substring(0,8).toUpperCase()}</p>
                          </div>
                          <span className="text-[8px] font-bold tracking-[0.1em] text-green-700 bg-green-100 px-2 py-1 rounded uppercase">
                             Active Member
                          </span>
                       </div>
                    </div>
                    
                    <div className="p-2 space-y-1 bg-white">
                       <button onClick={() => { setActiveTab('My Account'); setProfileDropdownOpen(false); }} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#F5F4EF] hover:text-[#8c6b22] rounded-lg font-medium transition-colors">
                          <User size={18} className="mr-3 text-gray-400" /> View Full Profile
                       </button>
                       <button onClick={() => { setActiveTab('Settings'); setProfileDropdownOpen(false); }} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#F5F4EF] hover:text-[#8c6b22] rounded-lg font-medium transition-colors">
                          <Settings size={18} className="mr-3 text-gray-400" /> Suite Settings
                       </button>
                    </div>
                    
                      <div className="p-2 border-t border-gray-100 bg-[#FCFBF8]">
                        <button 
                          onClick={() => {
                            localStorage.removeItem('token');
                            api.get('/auth/logout').then(() => navigate('/'));
                          }} 
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg font-bold transition-colors"
                        >
                          <LogOut size={18} className="mr-3" /> Secure Logout
                        </button>
                      </div>

                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Body - Render based on tab */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {activeTab === 'Catalog' && (
            <div className="flex flex-col lg:flex-row lg:space-x-10 max-w-7xl mx-auto">
               
               {/* Fixed Filters Sidebar */}
               <div className="w-full lg:w-56 shrink-0 mb-8 lg:mb-0 space-y-10">
                  {/* Category */}
                  <div>
                     <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase mb-4">Category</h4>
                     <div className="space-y-3">
                        {["All", ...new Set(books.map(b => b.genre).filter(Boolean))].map(cat => (
                           <label key={cat} className="flex items-center cursor-pointer group">
                             <input type="radio" name="category" checked={selectedCategory === cat} onChange={() => { setSelectedCategory(cat); setCurrentPage(1); }} className="w-3.5 h-3.5 border-gray-300 text-[#8c6b22] focus:ring-[#8c6b22] rounded-sm bg-transparent transition-colors cursor-pointer" />
                             <span className="ml-3 text-[13px] text-gray-600 group-hover:text-gray-900">{cat}</span>
                           </label>
                        ))}
                     </div>
                  </div>

                  {/* Publication Year */}
                  <div>
                     <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase mb-4">Publication Year</h4>
                     <div className="relative pt-1">
                        <input type="range" min="1850" max="2024" value={yearFilter} onChange={(e) => { setYearFilter(Number(e.target.value)); setCurrentPage(1); }} className="w-full h-1 bg-gray-300 rounded-full appearance-none cursor-pointer accent-[#8c6b22]" />
                        <div className="flex justify-between mt-3 text-[9px] text-gray-400 font-bold tracking-widest">
                           <span>1850</span>
                           <span className="text-[#8c6b22]">{yearFilter}</span>
                           <span>2024</span>
                        </div>
                     </div>
                  </div>

                  {/* Availability */}
                  <div>
                     <h4 className="text-[10px] font-bold tracking-[0.2em] text-gray-900 uppercase mb-4">Availability</h4>
                     <div className="flex flex-wrap gap-2">
                        <span onClick={() => { setAvailabilityFilter(availabilityFilter === "AVAILABLE" ? "All" : "AVAILABLE"); setCurrentPage(1); }} className={`text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors ${availabilityFilter === "AVAILABLE" ? "text-[#8c6b22] bg-[#F2F0E6]" : "text-gray-500 bg-gray-200/50 hover:bg-gray-200"}`}>AVAILABLE</span>
                        <span onClick={() => { setAvailabilityFilter(availabilityFilter === "Digital Only" ? "All" : "Digital Only"); setCurrentPage(1); }} className={`text-[11px] font-bold px-3 py-1.5 rounded-full cursor-pointer transition-colors ${availabilityFilter === "Digital Only" ? "text-[#8c6b22] bg-[#F2F0E6]" : "text-gray-500 bg-gray-200/50 hover:bg-gray-200"}`}>Digital Only</span>
                     </div>
                  </div>

                  <button onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setYearFilter(1850); setAvailabilityFilter("All"); setCurrentPage(1); }} className="w-full bg-[#EBE9DF] hover:bg-[#e2dfd3] text-gray-600 text-[10px] font-bold tracking-[0.1em] uppercase py-3 rounded transition-colors shadow-sm">
                     Reset All Filters
                  </button>
               </div>

               {/* Right Main Content */}
               <div className="flex-1">
                  
                  {/* Recommended For You */}
                  <div className="mb-12">
                     <div className="flex items-center mb-6">
                        <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mr-4">Recommended For You</h3>
                        <span className="text-[8px] font-bold tracking-[0.2em] text-[#A37B2C] bg-[#F2F0E6] px-2 py-1 rounded uppercase">Based on reading history</span>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {books.slice(new Date().getDate() % books.length, (new Date().getDate() % books.length) + 2).map((b, idx) => (
                           <div key={b._id} onClick={() => handleBorrow(b._id, b.availableCopies)} className="bg-[#EBE9DF] rounded-xl p-4 flex items-center border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <div className="w-16 h-20 bg-[#1C2331] rounded flex-shrink-0 flex items-center justify-center border-l-2 overflow-hidden border-[#A37B2C]">
                                {b.coverImage?.url ? <img src={b.coverImage.url} alt="cover" className="w-full h-full object-cover"/> : <span className="text-[8px] tracking-widest uppercase font-bold text-white opacity-50">Cover</span>}
                              </div>
                              <div className="ml-5 flex-1">
                                 <h4 className="font-['Playfair_Display'] font-bold text-gray-900 text-lg leading-tight truncate pr-2">{b.title}</h4>
                                 <p className="text-[11px] text-gray-500 mb-2 truncate">{b.author}</p>
                                 <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-[#8c6b22] border-b border-[#8c6b22] pb-0.5 uppercase tracking-wide">Borrow Now</span>
                                    <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">★ {(4.5 + idx * 0.4).toFixed(1)} Match</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Main Grid Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-gray-200">
                     <div className="max-w-md mb-4 sm:mb-0">
                        <h2 className="font-['Playfair_Display'] text-4xl text-gray-900 mb-2">Member Catalog</h2>
                        <p className="text-sm text-gray-500 font-light leading-relaxed">Discover curated manuscripts and rare editions within our archival preservation system.</p>
                     </div>
                     <div className="flex items-center bg-[#EBE9DF] rounded px-3 py-2 cursor-pointer">
                        <span className="text-[9px] tracking-widest text-gray-500 font-bold uppercase mr-3">Sort By:</span>
                        <span className="text-xs font-bold text-gray-900">Latest Acquisitions</span>
                        <span className="ml-2 text-gray-400 text-xs">▼</span>
                     </div>
                  </div>

                  {/* Book Grid connected to Live DB */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {(() => {
                        const filtered = books.filter(b => {
                           const matchSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase());
                           const matchCat = selectedCategory === "All" || b.genre === selectedCategory;
                           const matchYear = (b.publicationYear || 1850) >= yearFilter;
                           const matchAvail = availabilityFilter === "All" || (availabilityFilter === "AVAILABLE" ? b.availableCopies > 0 : b.availableCopies === 0);
                           return matchSearch && matchCat && matchYear && matchAvail;
                        });
                        const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
                        return paginated.length > 0 ? (
                           <>
                              {paginated.map((book) => {
                                 const userBorrow = (Array.isArray(borrows) ? borrows : []).find(b => (b.book?._id === book._id || b.book === book._id) && (b.status === 'Borrowed' || b.status === "Return Requested" || b.status === "Requested"));
                                 const statusStr = userBorrow ? "YOU HAVE THIS" : (book.availableCopies > 0 ? "AVAILABLE" : "LENT");
                                 let actionText = null;
                                 let actionDisabled = false;
                                 let onAction = null;
                                 
                                 if (userBorrow) {
                                     if (userBorrow.status === "Return Requested") {
                                         actionText = "Return Requested";
                                         actionDisabled = true;
                                     } else if (userBorrow.status === "Borrowed") {
                                         actionText = "Return Book";
                                         onAction = () => handleRequestReturn(userBorrow._id);
                                     } else {
                                         actionText = "Requested";
                                         actionDisabled = true;
                                     }
                                 } else {
                                     actionText = book.availableCopies > 0 ? "Borrow Book" : "Out of Stock";
                                     actionDisabled = book.availableCopies <= 0;
                                     onAction = () => handleBorrow(book._id, book.availableCopies);
                                 }

                                 return (
                                     <BookCard 
                                        key={book._id}
                                        category={book.genre || "Collection"} 
                                        status={statusStr} 
                                        title={book.title} 
                                        author={book.author} 
                                        score={(Math.random() * (5 - 4) + 4).toFixed(1)} 
                                        image={book.coverImage?.url}
                                        actionText={actionText}
                                        actionDisabled={actionDisabled}
                                        onAction={onAction}
                                     />
                                 );
                              })}
                           </>
                        ) : (
                           <p className="text-gray-500 italic mt-4 col-span-full">Synchronizing archival data... No matches found.</p>
                        );
                     })()}
                  </div>

                  {/* Pagination */}
                  <div className="mt-12 flex justify-center items-center space-x-2">
                     <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors">&lt;</button>
                     <button className="w-8 h-8 flex items-center justify-center text-white bg-[#0B132B] rounded font-bold text-xs">{currentPage}</button>
                     <button onClick={() => setCurrentPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors">&gt;</button>
                  </div>

               </div>
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'Dashboard' && (
             <div className="max-w-7xl mx-auto space-y-12">
               
               {/* Hero Section */}
               <div className="flex flex-col md:flex-row md:items-end justify-between">
                 <div className="max-w-2xl">
                    <h2 className="font-['Playfair_Display'] text-5xl text-gray-900 mb-4 tracking-tight">
                      Good morning,<br/>Reader {user?.name?.split(' ')[0] || 'Vane'}
                    </h2>
                    <p className="text-[#8c6b22] text-sm tracking-wide">
                      The archive is silent and the systems are optimal today.
                    </p>
                 </div>
                 <div className="flex items-center mt-6 md:mt-0 space-x-3 bg-[#EBE9DF] p-1.5 rounded-full border border-gray-200 shadow-sm">
                    <div className="flex -space-x-2">
                       <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-[#FDFCF8] overflow-hidden">
                         <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0B132B&color=white`} alt="user" />
                       </div>
                    </div>
                    <div className="flex flex-col pr-4 pl-1">
                      <span className="text-[10px] font-bold text-gray-900 leading-none">{user?.name}</span>
                      <span className="text-[8px] font-bold tracking-[0.1em] text-[#8c6b22] uppercase mt-0.5">ID: {user?._id?.substring(0,8)}</span>
                    </div>
                 </div>
               </div>

               {/* KPI Grid */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                 {[
                    { icon: <Library size={24} />, label: 'Total Collection', value: books.length },
                    { icon: <ArchiveX size={24} />, label: 'Active Borrowings', value: borrows.filter(b => b.status === "LENT").length },
                    { icon: <LayoutDashboard size={24} />, label: 'Returned Items', value: borrows.filter(b => b.status === "Returned").length, color: 'text-green-600' },
                    { icon: <Clock size={24} />, label: 'Pending Reservations', value: '0' }
                 ].map((kpi, i) => (
                    <div key={i} className="bg-[#EBE9DF] rounded-xl p-6 border border-gray-200/50 shadow-sm flex flex-col justify-between h-36 border-t-2 hover:border-t-[#8c6b22] transition-all">
                       <span className="text-[#8c6b22] mb-4">{kpi.icon}</span>
                       <div>
                         <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">{kpi.label}</p>
                         <h3 className={`font-['Playfair_Display'] text-3xl font-bold ${kpi.color || 'text-gray-900'}`}>{kpi.value}</h3>
                       </div>
                    </div>
                 ))}
               </div>

               {/* Middle Layout */}
               <div className="flex flex-col xl:flex-row gap-8">
                 
                 {/* Live Circulation Stream */}
                 <div className="flex-1">
                   <div className="flex items-center justify-between mb-6">
                     <h3 className="font-['Playfair_Display'] text-2xl text-gray-900">Live Circulation Stream</h3>
                     <span className="text-[8px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase bg-[#EBE9DF] px-3 py-1.5 rounded-full flex items-center">
                       <span className="w-1.5 h-1.5 bg-[#8c6b22] rounded-full mr-2"></span> Real-Time Data
                     </span>
                   </div>
                   
                   <div className="bg-[#EBE9DF] rounded-xl overflow-hidden border border-gray-200/50 shadow-sm">
                     <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200/50 text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                        <div className="col-span-2">Action</div>
                        <div className="col-span-5">Item Title</div>
                        <div className="col-span-3">Due Date</div>
                        <div className="col-span-2 text-right">Timestamp</div>
                     </div>
                     
                     {borrows.slice(0, 4).map((row) => (
                        <div key={row._id} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-gray-200/30 last:border-0 hover:bg-white/40 transition-colors items-center">
                           <div className="col-span-2">
                             <span className={`text-[8px] font-bold tracking-widest uppercase px-2 py-1 rounded ${row.status === 'LENT' ? 'bg-[#FCEAB3] text-[#A67E14] border border-[#E9D698]' : 'bg-blue-100 text-blue-800'}`}>
                               {row.status}
                             </span>
                           </div>
                           <div className="col-span-5 text-sm font-serif text-gray-900 truncate pr-4">{row.book?.title}</div>
                           <div className="col-span-3 text-xs text-gray-600">{new Date(row.dueDate).toLocaleDateString()}</div>
                           <div className="col-span-2 text-[10px] italic text-gray-400 text-right w-full truncate">{new Date(row.createdAt).toLocaleDateString()}</div>
                        </div>
                     ))}
                     {borrows.length === 0 && <p className="py-8 text-center text-xs italic text-gray-500">No circulation data for your profile yet.</p>}

                     <div className="px-6 py-4 bg-white/30 text-center cursor-pointer hover:bg-white/50 transition-colors" onClick={() => setActiveTab('My Account')}>
                       <span className="text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase">View Historical Log</span>
                     </div>
                   </div>
                 </div>

                 {/* Right Widgets */}
                 <div className="w-full xl:w-80 space-y-6 shrink-0">
                    
                    {/* System Health */}
                    <div className="bg-[#0B132B] rounded-xl p-8 text-white relative overflow-hidden shadow-lg">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                       <h4 className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-8">System Health</h4>
                       
                       <div className="space-y-6 mb-8">
                         <div className="flex justify-between items-end border-b border-gray-700/50 pb-2">
                            <span className="text-gray-300 text-sm font-light">Integrity</span>
                            <span className="font-bold text-xl">99.8%</span>
                         </div>
                         <div className="flex justify-between items-end border-b border-gray-700/50 pb-2">
                            <span className="text-gray-300 text-sm font-light">Status</span>
                            <span className="text-[9px] font-bold tracking-[0.2em] text-green-400 uppercase flex items-center">
                              <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 shadow-[0_0_8px_rgba(74,222,128,0.8)]"></span> Live
                            </span>
                         </div>
                         <div className="flex justify-between items-end border-b border-gray-700/50 pb-2">
                            <span className="text-gray-300 text-sm font-light">Last Backup</span>
                            <span className="text-xs">04:03 AM Today</span>
                         </div>
                       </div>
                       
                       <button className="w-full bg-[#1a233a] hover:bg-[#25304a] text-xs font-bold tracking-widest uppercase py-3.5 rounded transition-colors shadow-sm">
                         Network Diagnostics
                       </button>
                    </div>

                    {/* Agenda */}
                    <div className="bg-[#EBE9DF] rounded-xl p-6 border border-gray-200/50 shadow-sm">
                       <div className="flex justify-between items-center mb-6 border-b border-gray-300/50 pb-4">
                         <h4 className="font-['Playfair_Display'] text-lg text-gray-900">Reader's Agenda</h4>
                         <span className="text-[8px] font-bold tracking-widest text-[#8c6b22] uppercase">{agendaTasks.filter(t=>t.done).length}/{agendaTasks.length} Done</span>
                       </div>
                       <div className="space-y-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                         {agendaTasks.map(task => (
                           <label key={task.id} className="flex items-start cursor-pointer group">
                             <input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)} className="mt-0.5 w-4 h-4 rounded-sm border-gray-300 text-[#8c6b22] focus:ring-[#8c6b22] bg-transparent" />
                             <span className={`ml-3 text-xs flex-1 transition-colors ${task.done ? 'text-gray-400 line-through' : 'text-gray-700 group-hover:text-gray-900'}`}>{task.text}</span>
                             <button onClick={(e) => { e.preventDefault(); setAgendaTasks(agendaTasks.filter(t => t.id !== task.id)); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 text-xs px-2 transition-opacity">✕</button>
                           </label>
                         ))}
                         {agendaTasks.length === 0 && <p className="text-xs text-gray-500 italic">No tasks scheduled.</p>}
                         
                         {isAddingTask && (
                           <div className="flex items-center space-x-2 mt-4">
                             <input autoFocus type="text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="New task..." className="text-xs flex-1 bg-transparent border-b border-[#8c6b22] px-2 py-1 focus:outline-none" />
                             <button onClick={addTask} className="text-[10px] text-white bg-[#0B132B] hover:bg-[#1a233a] px-3 py-1 rounded">Add</button>
                             <button onClick={() => setIsAddingTask(false)} className="text-[10px] text-gray-500 hover:text-gray-700">Cancel</button>
                           </div>
                         )}
                       </div>
                       {!isAddingTask && (
                         <button onClick={() => setIsAddingTask(true)} className="mt-6 text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] hover:text-[#6a5119] uppercase w-full text-left">
                           + Add Custom Task
                         </button>
                       )}
                    </div>

                 </div>
               </div>

               {/* Dynamic Highlight Block */}
               {books.length > 0 && (
                 <div className="bg-[#EBE9DF] rounded-xl p-8 border border-gray-200/50 shadow-sm flex flex-col md:flex-row items-center gap-12 mt-12 transition-all">
                   <div className="w-56 h-72 bg-[#1C2819] rounded-lg shadow-2xl flex-shrink-0 border-l-4 border-[#3D4D3A] flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform duration-500">
                      {books[0].coverImage?.url ? (
                        <img src={books[0].coverImage.url} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-x-0 h-px bg-yellow-600/30 top-12"></div>
                          <div className="absolute inset-x-0 h-px bg-yellow-600/30 bottom-12"></div>
                          <div className="text-center px-4 z-10">
                             <h3 className="font-serif text-yellow-600/80 text-xl tracking-widest uppercase mb-4 opacity-70 truncate">{books[0].title}</h3>
                             <p className="text-yellow-600/60 text-[8px] tracking-[0.3em] uppercase opacity-50">{books[0].genre || 'Collection'}</p>
                          </div>
                        </>
                      )}
                      
                      {/* Overlay active info */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                         <span className="text-white text-[10px] font-bold uppercase tracking-widest">{books[0].availableCopies} Copies Available</span>
                      </div>
                   </div>
                   <div className="flex-1">
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase mb-2">Featured Acquisition</p>
                      <h3 className="font-['Playfair_Display'] text-4xl text-gray-900 mb-2">{books[0].title}</h3>
                      <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic mb-6">By {books[0].author} • {books[0].genre || 'Archival Edition'}</p>
                      <p className="text-sm text-gray-600 leading-relaxed max-w-2xl mb-8">
                        {books[0].description || `This seminal work by ${books[0].author} stands as a cornerstone of our ${books[0].genre || 'archival'} collection. Digitally cataloged and actively circulating in the system. Check it out now to automatically update your personal circulation string.`}
                      </p>
                      <div className="flex space-x-4">
                        <button onClick={() => handleBorrow(books[0]._id, books[0].availableCopies)} className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[10px] font-bold tracking-[0.1em] uppercase px-8 py-3.5 rounded shadow-sm transition-colors">
                          {books[0].availableCopies > 0 ? "Borrow Document" : "Join Out of Stock"}
                        </button>
                        <button onClick={() => setActiveTab('Catalog')} className="bg-transparent border border-gray-400 hover:border-gray-900 text-gray-700 hover:text-gray-900 text-[10px] font-bold tracking-[0.1em] uppercase px-8 py-3.5 rounded transition-colors">
                          View Catalog Relatives
                        </button>
                      </div>
                   </div>
                 </div>
               )}
              </div>
          )}

                     {/* My Account Tab */}
           {activeTab === 'My Account' && (
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="bg-[#0B132B] rounded-2xl p-8 text-white relative shadow-xl border border-[#1a233a] flex flex-col md:flex-row items-center gap-8">
                  <div className="w-24 h-24 rounded-full border-4 border-[#8c6b22] overflow-hidden shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=FDFCF8&color=0B132B&bold=true`} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-2 text-white">{user?.name}</h2>
                    <p className="text-gray-400 text-sm mb-4">Library ID: <span className="font-mono text-gray-300">{user?._id}</span></p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                       <span className="bg-[#1a233a] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-gray-700 text-yellow-500">Patron</span>
                       <span className="bg-[#1a233a] px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase border border-gray-700 text-gray-300">Active Member</span>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-6 md:mt-0 text-center">
                     <div className="bg-[#1a233a] px-6 py-4 rounded-xl border border-gray-700 min-w-[120px]">
                        <h3 className="font-['Playfair_Display'] font-bold text-3xl text-[#8c6b22] mb-1">{borrows.filter(b => b.status === "LENT").length}</h3>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Total Loans</p>
                     </div>
                     <div className="bg-[#1a233a] px-6 py-4 rounded-xl border border-gray-700 min-w-[120px]">
                        <h3 className="font-['Playfair_Display'] font-bold text-3xl text-white mb-1">0</h3>
                        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">Fines Due</p>
                     </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                  <div className="flex-1 space-y-8">
                    <section>
                       <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-6">Currently Reading</h3>
                       <div className="space-y-4">
                         {borrows.filter(b => b.status === "LENT").length > 0 ? borrows.filter(b => b.status === "LENT").map((br) => (
                              <div key={br._id} className="bg-[#EBE9DF] rounded-xl p-5 border border-gray-200/50 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-start">
                                 <div className="w-20 h-28 bg-[#0B132B] rounded border-l-2 border-[#8c6b22] shrink-0 flex items-center justify-center shadow-md overflow-hidden relative">
                                   {br.book?.coverImage?.url ? <img src={br.book.coverImage.url} alt="cover" className="w-full h-full object-cover" /> : <span className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest opacity-50">Cover</span>}
                                 </div>
                                 <div className="flex-1 pt-1">
                                    <h4 className="font-['Playfair_Display'] font-bold text-gray-900 text-xl mb-1">{br.book?.title}</h4>
                                    <p className="text-xs text-gray-500 italic mb-4">by {br.book?.author}</p>
                                    <div className="flex items-center space-x-6 mb-4">
                                       <span className={`text-[10px] font-bold tracking-widest uppercase flex items-center px-2 py-1 rounded ${new Date(br.dueDate) < new Date() ? 'text-red-600 bg-red-100' : 'text-gray-700 bg-gray-200'}`}>
                                          {new Date(br.dueDate) < new Date() ? 'Overdue!' : `Due ${new Date(br.dueDate).toLocaleDateString()}`}
                                       </span>
                                    </div>
                                    <div className="flex space-x-3">
                                       <button onClick={() => window.location.reload()} className="bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700 text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 rounded shadow-sm transition-colors">
                                          Renew Event
                                       </button>
                                       <button onClick={() => handleRequestReturn(br._id)} className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-2.5 rounded shadow-sm transition-colors">
                                          Request Return
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           )) : (
                              <p className="text-gray-500 italic text-sm mt-4 p-6 bg-white/50 rounded border border-gray-200 border-dashed">You have no active loans. Visit the Catalog to explore!</p>
                           )}
                       </div>
                    </section>
                  </div>

                  <div className="w-full xl:w-96 space-y-8 shrink-0">
                    <div className="bg-[#EBE9DF] rounded-xl p-6 border border-gray-200/50 shadow-sm relative">
                       <h4 className="font-['Playfair_Display'] text-xl text-gray-900 mb-6">Historical Log</h4>
                       <div className="space-y-6 relative ml-2">
                          <div className="absolute left-[3px] top-2 bottom-2 w-px bg-gray-300"></div>
                          {borrows.slice(0, 7).map((log, i) => (
                             <div key={log._id} className="flex relative items-start">
                                <div className={`w-2 h-2 rounded-full mt-1.5 mr-4 relative z-10 ${i === 0 ? 'bg-[#8c6b22] ring-4 ring-[#8c6b22]/20' : 'bg-gray-400'}`}></div>
                                <div>
                                   <p className="text-sm font-bold text-gray-900 font-serif leading-tight">{log.book?.title}</p>
                                   <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                                      {log.status === 'LENT' ? 'LENT' : 'Returned'} • {new Date(log.createdAt).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                           ))}
                           {borrows.length === 0 && <p className="text-gray-500 italic text-sm ml-6">No historical data found.</p>}
                       </div>
                    </div>
                  </div>
                </div>
              </div>
           )}

           {/* Recent Tab */}
           {activeTab === 'Recent' && (
              <div className="max-w-7xl mx-auto space-y-6">
                 <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-gray-900">Recently Added</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                       {books.slice(0, 8).map((book) => (
                            <BookCard 
                               key={book._id}
                               category={book.genre || "Collection"} 
                               status={book.availableCopies > 0 ? "AVAILABLE" : "LENT"} 
                               title={book.title} 
                               author={book.author} 
                               score={(Math.random() * (5 - 4) + 4).toFixed(1)} 
                               image={book.coverImage?.url}
                               actionText="View in Catalog"
                               onAction={() => setActiveTab('Catalog')}
                            />
                         ))}
                 </div>
              </div>
           )}

           {/* Reservations Tab */}
           {activeTab === 'Reservations' && (
              <div className="max-w-7xl mx-auto space-y-6">
                 <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-gray-900">My Reservations</h2>
                 {reservations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {reservations.map(res => (
                          <div key={res._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                             <h4 className="font-bold text-lg mb-2">{res.book?.title}</h4>
                             <p className="text-sm text-gray-500 mb-4">Status: {res.status}</p>
                             <p className="text-xs text-gray-400">Reserved on: {new Date(res.createdAt).toLocaleDateString()}</p>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                       <p className="text-gray-500">You have no active reservations.</p>
                    </div>
                 )}
              </div>
           )}

           {/* Overdue Tab */}
           {activeTab === 'Overdue' && (
              <div className="max-w-7xl mx-auto space-y-6">
                 <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-red-700">Overdue Items</h2>
                 {borrows.filter(b => b.status === "LENT" && new Date(b.dueDate) < new Date()).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {borrows.filter(b => b.status === "LENT" && new Date(b.dueDate) < new Date()).map(br => (
                          <div key={br._id} className="bg-red-50 p-6 rounded-xl shadow-sm border border-red-200">
                             <h4 className="font-bold text-lg mb-2 text-red-900">{br.book?.title}</h4>
                             <p className="text-sm text-red-600 mb-4 font-bold">Due Date: {new Date(br.dueDate).toLocaleDateString()}</p>
                             <button onClick={() => handleRequestReturn(br._id)} className="w-full bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold tracking-[0.1em] uppercase px-5 py-3 rounded shadow-sm transition-colors">
                                Request Return Now
                             </button>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="p-8 text-center bg-green-50 rounded-xl border border-green-200 shadow-sm">
                       <p className="text-green-700 font-bold text-lg">Great job! You have no overdue items.</p>
                    </div>
                 )}
              </div>
           )}

           {/* Settings Tab */}
           {activeTab === 'Settings' && (
              <div className="max-w-4xl mx-auto space-y-8">
                 <h2 className="font-['Playfair_Display'] text-4xl font-bold mb-6 text-gray-900">Preferences & Settings</h2>
                 
                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8">
                    <div>
                        <h4 className="text-sm font-bold tracking-widest text-[#8c6b22] uppercase mb-4">Account Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Display Name</label>
                              <input type="text" readOnly value={user?.name || ""} className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700" />
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-gray-500 mb-2">Email Address</label>
                              <input type="email" readOnly value={user?.email || ""} className="w-full bg-gray-50 border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700" />
                           </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <h4 className="text-sm font-bold tracking-widest text-[#8c6b22] uppercase mb-4">Notification Preferences</h4>
                        <div className="space-y-4">
                           <label className="flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8c6b22] border-gray-300 rounded focus:ring-[#8c6b22]" />
                              <span className="ml-3 text-sm text-gray-700">Email me when a reserved book is available</span>
                           </label>
                           <label className="flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="w-4 h-4 text-[#8c6b22] border-gray-300 rounded focus:ring-[#8c6b22]" />
                              <span className="ml-3 text-sm text-gray-700">Send reminder emails for overdue items</span>
                           </label>
                           <label className="flex items-center cursor-pointer">
                              <input type="checkbox" className="w-4 h-4 text-[#8c6b22] border-gray-300 rounded focus:ring-[#8c6b22]" />
                              <span className="ml-3 text-sm text-gray-700">Subscribe to monthly library newsletter</span>
                           </label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-xs font-bold tracking-widest uppercase px-6 py-3 rounded shadow-sm transition-colors">
                           Save Changes
                        </button>
                    </div>
                 </div>
              </div>
           )}

           {/* Support Tab */}
           {activeTab === 'Support' && (
              <div className="max-w-4xl mx-auto space-y-8">
                 <div className="mb-8">
                    <h2 className="font-['Playfair_Display'] text-4xl font-bold text-gray-900 mb-2">Help & Support</h2>
                    <p className="text-gray-500">Having trouble? The library support team is here to help.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#EFECE1] rounded-xl p-8 border border-gray-200/50 flex flex-col justify-center items-center text-center shadow-sm">
                       <HelpCircle size={48} className="text-[#8c6b22] mb-4" />
                       <h3 className="font-serif text-xl font-bold mb-2">FAQ & Guides</h3>
                       <p className="text-sm text-gray-600 mb-6 px-4">Browse our digital knowledge base for answers to common questions about borrowing and returning.</p>
                       <button className="bg-white border border-[#8c6b22] text-[#8c6b22] hover:bg-[#8c6b22] hover:text-white transition-colors text-xs font-bold uppercase tracking-widest px-6 py-3 rounded">
                          Browse Knowledge Base
                       </button>
                    </div>

                    <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                       <h3 className="font-serif text-xl font-bold mb-4">Contact a Librarian</h3>
                       <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent to Librarian Desk.'); }}>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Subject</label>
                             <select className="w-full bg-gray-50 border border-gray-200 rounded py-2 px-3 text-sm text-gray-700 outline-none focus:border-gray-300">
                                <option>Issue with a borrowed item</option>
                                <option>Lost or damaged book</option>
                                <option>Account access</option>
                                <option>Other inquiry</option>
                             </select>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-gray-500 mb-1 tracking-wider uppercase">Message</label>
                             <textarea rows="4" className="w-full bg-gray-50 border border-gray-200 rounded py-2 px-3 text-sm text-gray-700 outline-none focus:border-gray-300" placeholder="Describe your issue..."></textarea>
                          </div>
                          <button type="submit" className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors shadow-sm">
                             Send Message
                          </button>
                       </form>
                    </div>
                 </div>
              </div>
           )}

           {/* Fallback for other tabs */}
           {!['Catalog', 'Dashboard', 'My Account', 'Recent', 'Reservations', 'Overdue', 'Settings', 'Support'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                 <ArchiveX size={64} className="mb-4 text-gray-300" />
                 <h2 className="font-['Playfair_Display'] text-3xl mb-2 text-gray-800">Under Construction</h2>
                 <p className="text-gray-500">The <b>{activeTab}</b> view is currently being digitized in the archives.</p>
                 <button onClick={() => setActiveTab('Dashboard')} className="mt-6 px-6 py-2 border border-gray-300 text-gray-600 text-xs font-bold uppercase tracking-widest rounded hover:bg-gray-200 transition-colors">Return to Dashboard</button>
              </div>
           )}

        </div>
      </main>
    </div>
  );
}
