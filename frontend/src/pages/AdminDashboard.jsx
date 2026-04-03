import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  LayoutDashboard,
  Book,
  ArrowLeftRight,
  Users,
  BarChart2,
  Settings,
  CircleHelp,
  Plus,
  Search,
  Bell,
  SlidersHorizontal,
  UserPlus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Download,
  Filter,
  FileText,
  AlertCircle,
  IndianRupee,
  LogOut
} from "lucide-react";
import NotificationArea from "../components/NotificationArea";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

const SidebarItem = ({ icon, text, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-6 py-4 cursor-pointer transition-colors border-l-4 ${active ? "border-[#0B132B] text-gray-900 font-bold bg-[#E8E6DF]/50" : "border-transparent text-gray-500 hover:bg-[#EBE9DF]/50 hover:text-gray-900"}`}
  >
    <span className={`mr-4 ${active ? "text-[#0B132B]" : "text-gray-400"}`}>
      {icon}
    </span>
    <span className="text-[13px] font-medium tracking-wide">{text}</span>
  </div>
);

// ── Demo / Preview Data (auto-used when database is empty) ─────────────────
const _d  = (ago)  => new Date(Date.now() - ago  * 86400000).toISOString();
const _df = (fwd)  => new Date(Date.now() + fwd  * 86400000).toISOString();

const DEMO_BOOKS = [
  { _id:'db1', title:'The Great Gatsby',        author:'F. Scott Fitzgerald', isbn:'9780743273565', genre:'Fiction',    publishedYear:1925, totalCopies:5, availableCopies:3, price:299, coverImage:{url:'https://covers.openlibrary.org/b/id/8432019-M.jpg'}, createdAt:_d(90), updatedAt:_d(2) },
  { _id:'db2', title:'A Brief History of Time', author:'Stephen Hawking',      isbn:'9780553380163', genre:'Science',    publishedYear:1988, totalCopies:4, availableCopies:1, price:450, coverImage:{url:'https://covers.openlibrary.org/b/id/8739161-M.jpg'}, createdAt:_d(60), updatedAt:_d(5) },
  { _id:'db3', title:'Sapiens',                 author:'Yuval Noah Harari',   isbn:'9780062316097', genre:'History',    publishedYear:2011, totalCopies:6, availableCopies:4, price:550, coverImage:{url:'https://covers.openlibrary.org/b/id/10527843-M.jpg'},createdAt:_d(45), updatedAt:_d(1) },
  { _id:'db4', title:'Thus Spoke Zarathustra',  author:'Friedrich Nietzsche', isbn:'9780140441185', genre:'Philosophy', publishedYear:1883, totalCopies:3, availableCopies:0, price:320, coverImage:{url:'https://covers.openlibrary.org/b/id/8479674-M.jpg'}, createdAt:_d(30), updatedAt:_d(0) },
  { _id:'db5', title:'The Iliad',               author:'Homer',               isbn:'9780140275360', genre:'Classics',   publishedYear:762,  totalCopies:4, availableCopies:2, price:280, coverImage:{url:'https://covers.openlibrary.org/b/id/8091016-M.jpg'}, createdAt:_d(120),updatedAt:_d(3) },
  { _id:'db6', title:'1984',                    author:'George Orwell',       isbn:'9780451524935', genre:'Fiction',    publishedYear:1949, totalCopies:5, availableCopies:3, price:350, coverImage:{url:'https://covers.openlibrary.org/b/id/8575351-M.jpg'}, createdAt:_d(15), updatedAt:_d(1) },
];
const DEMO_MEMBERS = [
  { _id:'dm1', name:'Arjun Mehta',       email:'arjun.mehta@gmail.com',   role:'User',  createdAt:_d(180) },
  { _id:'dm2', name:'Priya Sharma',      email:'priya.sharma@gmail.com',  role:'User',  createdAt:_d(90)  },
  { _id:'dm3', name:'Rahul Nair',        email:'rahul.nair@gmail.com',    role:'User',  createdAt:_d(60)  },
  { _id:'dm4', name:'Sneha Patel',       email:'sneha.patel@gmail.com',   role:'User',  createdAt:_d(30)  },
  { _id:'dm5', name:'Kiran Reddy',       email:'kiran.reddy@gmail.com',   role:'User',  createdAt:_d(10)  },
  { _id:'dm0', name:'Dr. Ananya Krishnan', email:'librarian@archive.in', role:'Admin', createdAt:_d(365) },
];
const _bk = (id,title,author,url) => ({ _id:id, title, author, coverImage:{url} });
const DEMO_BORROWS = [
  { _id:'dbr1',  user:{_id:'dm1',name:'Arjun Mehta',  email:'arjun.mehta@gmail.com'},  book:_bk('db2','A Brief History of Time','Stephen Hawking',    'https://covers.openlibrary.org/b/id/8739161-M.jpg'),  status:'Borrowed',        borrowDate:_d(20), dueDate:_df(-6),  returnDate:null, fine:0, createdAt:_d(20) },
  { _id:'dbr2',  user:{_id:'dm3',name:'Rahul Nair',   email:'rahul.nair@gmail.com'},   book:_bk('db4','Thus Spoke Zarathustra','Friedrich Nietzsche', 'https://covers.openlibrary.org/b/id/8479674-M.jpg'),  status:'Borrowed',        borrowDate:_d(25), dueDate:_df(-11), returnDate:null, fine:0, createdAt:_d(25) },
  { _id:'dbr3',  user:{_id:'dm2',name:'Priya Sharma', email:'priya.sharma@gmail.com'}, book:_bk('db1','The Great Gatsby','F. Scott Fitzgerald',        'https://covers.openlibrary.org/b/id/8432019-M.jpg'),  status:'Borrowed',        borrowDate:_d(5),  dueDate:_df(9),   returnDate:null, fine:0, createdAt:_d(5)  },
  { _id:'dbr4',  user:{_id:'dm4',name:'Sneha Patel',  email:'sneha.patel@gmail.com'},  book:_bk('db3','Sapiens','Yuval Noah Harari',                  'https://covers.openlibrary.org/b/id/10527843-M.jpg'), status:'Borrowed',        borrowDate:_d(3),  dueDate:_df(27),  returnDate:null, fine:0, createdAt:_d(3)  },
  { _id:'dbr5',  user:{_id:'dm5',name:'Kiran Reddy',  email:'kiran.reddy@gmail.com'},  book:_bk('db5','The Iliad','Homer',                             'https://covers.openlibrary.org/b/id/8091016-M.jpg'),  status:'Requested',       borrowDate:null,   dueDate:_df(14),  returnDate:null, fine:0, createdAt:_d(1)  },
  { _id:'dbr6',  user:{_id:'dm1',name:'Arjun Mehta',  email:'arjun.mehta@gmail.com'},  book:_bk('db6','1984','George Orwell',                          'https://covers.openlibrary.org/b/id/8575351-M.jpg'),  status:'Return Requested',borrowDate:_d(30), dueDate:_df(-2),  returnDate:null, fine:0, createdAt:_d(30) },
  { _id:'dbr7',  user:{_id:'dm2',name:'Priya Sharma', email:'priya.sharma@gmail.com'}, book:_bk('db6','1984','George Orwell',                          'https://covers.openlibrary.org/b/id/8575351-M.jpg'),  status:'Returned',        borrowDate:_d(45), dueDate:_d(31),   returnDate:_d(28),fine:0, createdAt:_d(45) },
  { _id:'dbr8',  user:{_id:'dm3',name:'Rahul Nair',   email:'rahul.nair@gmail.com'},   book:_bk('db3','Sapiens','Yuval Noah Harari',                  'https://covers.openlibrary.org/b/id/10527843-M.jpg'), status:'Returned',        borrowDate:_d(60), dueDate:_d(46),   returnDate:_d(50),fine:0, createdAt:_d(60) },
  { _id:'dbr9',  user:{_id:'dm4',name:'Sneha Patel',  email:'sneha.patel@gmail.com'},  book:_bk('db1','The Great Gatsby','F. Scott Fitzgerald',        'https://covers.openlibrary.org/b/id/8432019-M.jpg'),  status:'Returned',        borrowDate:_d(35), dueDate:_d(21),   returnDate:_d(22),fine:1, createdAt:_d(35) },
  { _id:'dbr10', user:{_id:'dm5',name:'Kiran Reddy',  email:'kiran.reddy@gmail.com'},  book:_bk('db2','A Brief History of Time','Stephen Hawking',    'https://covers.openlibrary.org/b/id/8739161-M.jpg'),  status:'Returned',        borrowDate:_d(80), dueDate:_d(66),   returnDate:_d(60),fine:0, createdAt:_d(80) },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [members, setMembers] = useState([]);
  const [reservations, setReservations] = useState([]); // New: track active reservations
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [issueData, setIssueData] = useState({ bookId: '', userId: '', dueDate: '' });
  const [regData, setRegData] = useState({ name: '', email: '', password: 'Password123' });
  const [isIssuing, setIsIssuing] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [returnIdInput, setReturnIdInput] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", password: "" });
  const [circulationFilter, setCirculationFilter] = useState("All"); // "All" | "Returned"
  const [selectedBook, setSelectedBook] = useState(null); // for detail panel
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBook, setEditBook] = useState({ title: "", author: "", isbn: "", publishedYear: "", genre: "", totalCopies: "", price: "" });
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [settlementTarget, setSettlementTarget] = useState(null); // { member, amount, borrows }
  const [settleMethod, setSettleMethod] = useState('upi');
  const [settleInput, setSettleInput] = useState('');
  const [settleLoading, setSettleLoading] = useState(false);
  const [settleSuccess, setSettleSuccess] = useState(false);
  // Fines tab filter state
  const [finesViewFilter, setFinesViewFilter] = useState('all');
  const [finesSearch, setFinesSearch] = useState('');
  // Members tab state
  const [membersFilter, setMembersFilter] = useState('all');
  const [membersSearch, setMembersSearch] = useState('');
  const [notifiedMembers, setNotifiedMembers] = useState({}); // { memberId: true } after notify
  const [notifyToast, setNotifyToast] = useState(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  // Inventory tab additional states
  const [inventorySearch, setInventorySearch] = useState('');
  // eslint-disable-next-line no-unused-vars
  const [inventoryGenreFilter, setInventoryGenreFilter] = useState('All');
  // eslint-disable-next-line no-unused-vars
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState('All'); // 'All', 'Available', 'Out of Stock'

  // ── Inventory → Issue with Payment modal ──────────────────────────────────
  const [showInventoryIssueModal, setShowInventoryIssueModal] = useState(null); // book object
  const [inventoryIssueDuration,  setInventoryIssueDuration]  = useState('2weeks'); // '2weeks' | '1month'
  const [inventoryIssueUserId,    setInventoryIssueUserId]    = useState('');
  const [inventoryIssuePayMethod, setInventoryIssuePayMethod] = useState('cash'); // 'cash' | 'upi'
  const [inventoryIssuePayInput,  setInventoryIssuePayInput]  = useState('');
  const [inventoryIssueLoading,   setInventoryIssueLoading]   = useState(false);
  const [inventoryIssueSuccess,   setInventoryIssueSuccess]   = useState(false);
  // ──────────────────────────────────────────────────────────────────────────

  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    publishedYear: "",
    genre: "",
    totalCopies: "",
    price: "",
  });
  const [coverFile, setCoverFile] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  // Daily Agenda — persisted in localStorage
  const [agendaItems, setAgendaItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('librarianAgenda')) || [{ id: 1, text: 'Rare Manuscript Review', location: 'Archive Wing B', time: '09:00 AM', done: false }]; }
    catch { return []; }
  });
  const [showAddAgenda, setShowAddAgenda] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ text: '', location: '', time: '' });

  const navigate = useNavigate();
  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const res = await api.get("/auth/me");
        const userData = res.data.user || res.data;
        if (userData.role !== "Admin" && userData.role !== "Librarian") {
          navigate("/user");
        } else {
          setUser(userData);
        }
        await fetchUserAndDataPublic();
      } catch {
        navigate("/");
      }
    };
    fetchUserAndData();
  }, [navigate]);

  // –– Continuous Data Synchronization (Polling every 30s) –––––––––––––––––––––
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserAndDataPublic();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);
  // –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––

  const handleRegisterMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', regData);
      if (res.data.success) {
        alert('Member registered successfully!');
        setShowRegModal(false);
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!issueData.bookId || !issueData.userId) return alert('Please select both book and member');
    setIsIssuing(true);
    try {
      const res = await api.post('/borrows/admin-borrow', {
        bookId: issueData.bookId,
        userId: issueData.userId,
        dueDate: issueData.dueDate
      });
      if (res.data.success) {
        alert('Book issued successfully!');
        setShowIssueModal(false);
        setIssueData({ bookId: '', userId: '', dueDate: '' });
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsIssuing(false);
    }
  };

  const handleApproveBorrow = async (borrowId) => {
    try {
      const res = await api.post('/borrows/approve-borrow', { borrowId });
      if (res.data.success) {
        alert('Loan approved successfully!');
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleApproveReturn = async (borrowId) => {
    try {
      const res = await api.post('/borrows/approve-return', { borrowId });
      if (res.data.success) {
        alert('Return verify successful! Item returned to stack.');
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchUserAndDataPublic = async () => {
    try {
      const [resBooks, resBorrows, resMembers, resReservations] = await Promise.all([
        api.get("/books/all"),
        api.get("/borrows/all"),
        api.get("/users/all"),
        api.get("/books/reservations/all").catch(() => ({ data: { reservations: [] } }))
      ]);
      const bD  = resBooks.data.books       || resBooks.data || [];
      const brD = resBorrows.data.borrows   || [];
      const mD  = resMembers.data.users     || [];
      setBooks(bD.length   > 0 ? bD   : []); // No more demo data fallback for production to ensure data accuracy
      setBorrows(brD.length > 0 ? brD  : []);
      setMembers(mD.length  > 0 ? mD   : []);
      setReservations(resReservations.data.reservations || []);
      // Reset notification state on full refresh so buttons re-enable
      setNotifiedMembers({});
    } catch (err) {
      console.error("Fetch Data Public Error:", err);
    }
  };

  // Save agenda to localStorage on change
  useEffect(() => {
    localStorage.setItem('librarianAgenda', JSON.stringify(agendaItems));
  }, [agendaItems]);

  const addAgendaItem = () => {
    if (!newAgenda.text.trim()) return;
    setAgendaItems([...agendaItems, { id: Date.now(), ...newAgenda, done: false }]);
    setNewAgenda({ text: '', location: '', time: '' });
    setShowAddAgenda(false);
  };

  const toggleAgendaItem = (id) => {
    setAgendaItems(agendaItems.map(a => a.id === id ? { ...a, done: !a.done } : a));
  };

  const removeAgendaItem = (id) => {
    setAgendaItems(agendaItems.filter(a => a.id !== id));
  };

  const handleReturnAction = async (bid) => {
    const borrowId = bid || returnIdInput;
    if (!borrowId) return alert("Please enter or select a Borrow ID.");
    try {
      const res = await api.post("/borrows/approve-return", {
        borrowId,
      });
      if (res.data.success) {
        alert(res.data.message || "Return successfully processed.");
        setReturnIdInput("");
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleSendFineNotification = async (member, fineAmount, overdueLoans) => {
    try {
      const bookTitles = overdueLoans.map(b => b.book?.title || 'Unknown Book');
      await api.post('/notifications/fine', {
        userId: member._id,
        memberName: member.name,
        bookTitles,
        fineAmount,
      });
      setNotifiedMembers(prev => ({ ...prev, [member._id]: true }));
      setNotifyToast(`Notified ${member.name} — ₹${fineAmount} fine alert sent`);
      setTimeout(() => setNotifyToast(null), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send notification');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!coverFile) return alert("Cover image is required");
    setIsAdding(true);
    const formData = new FormData();
    formData.append("title", newBook.title);
    formData.append("author", newBook.author);
    formData.append("isbn", newBook.isbn);
    formData.append("publishedYear", newBook.publishedYear);
    formData.append("genre", newBook.genre);
    formData.append("totalCopies", newBook.totalCopies);
    formData.append("price", newBook.price);
    formData.append("coverImage", coverFile);
    try {
      const res = await api.post("/books/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("Book added successfully!");
        setShowAddModal(false);
        setNewBook({
          title: "",
          author: "",
          isbn: "",
          publishedYear: "",
          genre: "",
          totalCopies: "",
          price: "",
        });
        setCoverFile(null);
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this book from the archive?",
      )
    )
      return;
    try {
      const res = await api.delete(`/books/delete/${id}`);
      if (res.data.success) {
        alert("Book deleted successfully!");
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await api.get("/auth/logout");
    navigate("/");
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      const res = await api.post('/auth/register', {
        name: newMember.name,
        email: newMember.email,
        password: newMember.password,
      });
      if (res.data.success) {
        alert(`Member "${newMember.name}" registered successfully!`);
        setShowAddMemberModal(false);
        setNewMember({ name: '', email: '', password: '' });
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const openEditModal = (book, e) => {
    e.stopPropagation();
    setEditBook({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publishedYear: book.publishedYear || '',
      genre: book.genre || '',
      totalCopies: book.totalCopies || '',
      price: book.price || '',
    });
    setEditCoverFile(null);
    setShowEditModal(book._id);
  };

  const handleExportCatalog = () => {
    const headers = ['Title', 'Author', 'ISBN', 'Genre', 'Total Copies', 'Available', 'Price (INR)'];
    const rows = books.map(b => [
      `"${b.title}"`,
      `"${b.author}"`,
      b.isbn || 'N/A',
      b.genre || 'General',
      b.totalCopies,
      b.availableCopies,
      b.price || 0
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Library_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportManifest = () => {
    const headers = ['Name', 'Email', 'Role', 'Joined Date', 'Active Loans', 'Total Borrows', 'Current Fines (INR)'];
    const rows = memberUsers.map(member => {
      const mb = borrows.filter(b => b.user?._id === member._id || b.user === member._id);
      const active = mb.filter(b => b.status === "Borrowed" || b.status === "Requested" || b.status === "Return Requested").length;
      const overdue = mb.filter(b => (b.status === "Borrowed" || b.status === "Return Requested") && new Date(b.dueDate) < new Date());
      const currentFine = overdue.reduce((s, b) => s + calcFine(b.dueDate), 0);
      return [
        `"${member.name.replace(/"/g, '""')}"`,
        `"${member.email.replace(/"/g, '""')}"`,
        `"${member.role}"`,
        `"${new Date(member.createdAt).toLocaleDateString()}"`,
        active,
        mb.length,
        currentFine
      ];
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Member_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportReport = () => {
    const totalCopies = books.reduce((s, b) => s + (b.totalCopies || 0), 0);
    const availCopies = books.reduce((s, b) => s + (b.availableCopies || 0), 0);
    const utilizationRate = totalCopies > 0 ? Math.round(((totalCopies - availCopies) / totalCopies) * 100) : 0;
    
    const reportData = [
      ['Metric', 'Value', 'Description'],
      ['Total Titles', books.length, 'Unique book titles in catalog'],
      ['Total Copies', totalCopies, 'Total physical copies owned'],
      ['Available Copies', availCopies, 'Copies currently on shelves'],
      ['Utilization Rate', `"${utilizationRate}%"`, 'Percentage of collection currently borrowed'],
      ['Total Members', memberUsers.length, 'Registered library members'],
      ['Active Loans', activeBorrows.length, 'Books currently with members'],
      ['Overdue Loans', overdueBorrows.length, 'Books past their due date'],
      ['Total Collected Fines', `"₹${borrows.reduce((s, b) => s + (b.fine || 0), 0)}"`, 'Cumulative fines collected to date']
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," + reportData.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Library_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportLedger = () => {
    const headers = ['Member Name', 'Email', 'Outstanding Fines (INR)', 'Total Collected (INR)', 'Active Loans', 'Overdue Loans'];
    const rows = memberUsers.map(member => {
      const mb = borrows.filter(b => b.user?._id === member._id || b.user === member._id);
      const active = mb.filter(b => b.status === "Borrowed" || b.status === "Requested" || b.status === "Return Requested");
      const overdue = active.filter(b => new Date(b.dueDate) < new Date());
      const currentFine = overdue.reduce((s, b) => s + calcFine(b.dueDate), 0);
      const collected = mb.reduce((s, b) => s + (b.fine || 0), 0);
      
      return [
        `"${member.name.replace(/"/g, '""')}"`,
        `"${member.email.replace(/"/g, '""')}"`,
        currentFine,
        collected,
        active.length,
        overdue.length
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Financial_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    setIsEditing(true);
    try {
      const formData = new FormData();
      Object.entries(editBook).forEach(([k, v]) => { if (v) formData.append(k, v); });
      if (editCoverFile) formData.append('coverImage', editCoverFile);
      const res = await api.put(`/books/update/${showEditModal}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        alert('Book updated successfully!');
        setShowEditModal(false);
        setSelectedBook(null);
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsEditing(false);
    }
  };

  // Fine logic: same as backend — ₹1/day after due date
  const calcFine = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    if (now <= due) return 0;
    return Math.ceil((now - due) / (1000 * 60 * 60 * 24));
  };

  const handleSettlement = async (e) => {
    e.preventDefault();
    if (!settleInput.trim()) return;
    setSettleLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setSettleLoading(false);
    setSettleSuccess(true);
  };

  // ── Inventory Issue handlers ───────────────────────────────────────────────
  const openInventoryIssue = (book, e) => {
    e.stopPropagation();
    setShowInventoryIssueModal(book);
    setInventoryIssueDuration('2weeks');
    setInventoryIssueUserId('');
    setInventoryIssuePayMethod('cash');
    setInventoryIssuePayInput('');
    setInventoryIssueLoading(false);
    setInventoryIssueSuccess(false);
  };

  const handleInventoryIssueBook = async (e) => {
    e.preventDefault();
    if (!inventoryIssueUserId) return alert('Please select a member');
    setInventoryIssueLoading(true);
    try {
      const days    = inventoryIssueDuration === '1month' ? 30 : 14;
      const dueDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
      const res = await api.post('/borrows/admin-borrow', {
        bookId: showInventoryIssueModal._id,
        userId: inventoryIssueUserId,
        dueDate,
      });
      if (res.data.success) {
        setInventoryIssueSuccess(true);
        fetchUserAndDataPublic();
      }
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setInventoryIssueLoading(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────


  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCF8]">
        <p className="text-xl font-semibold text-gray-600">
          Initializing Admin Console...
        </p>
      </div>
    );
  }

  // Compute derived stats from real data
  const activeBorrows = borrows.filter(b => b.status === "Borrowed" || b.status === "Return Requested" || b.status === "Requested");
  const overdueBorrows = borrows.filter(b => (b.status === "Borrowed" || b.status === "Return Requested") && new Date(b.dueDate) < new Date());
  const totalBooks = books.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
  const memberUsers = members.filter(m => m.role === "User" || m.role === "Member");

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex font-['Inter'] text-gray-800">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#F5F4F0] flex flex-col justify-between shrink-0 h-screen border-r border-[#E8E6DF]">
        <div>
          <div className="p-8 pb-10 flex items-center">
            <div className="w-8 h-8 rounded bg-[#0B132B] flex items-center justify-center mr-3 shrink-0 shadow-md">
              <BookOpen
                size={16}
                className="text-[#F2D06B]"
                strokeWidth={2.5}
              />
            </div>
            <div>
              <h1 className="font-['Playfair_Display'] font-bold text-lg text-[#0B132B] leading-tight">
                The Modern Archivist
              </h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mt-0.5">
                Librarian Portal
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            <SidebarItem
              icon={<LayoutDashboard size={18} strokeWidth={2} />}
              text="Dashboard"
              active={activeTab === "Dashboard"}
              onClick={() => setActiveTab("Dashboard")}
            />
            <SidebarItem
              icon={<Book size={18} strokeWidth={2} />}
              text="Inventory"
              active={activeTab === "Inventory"}
              onClick={() => setActiveTab("Inventory")}
            />
            <SidebarItem
              icon={<ArrowLeftRight size={18} strokeWidth={2} />}
              text="Circulation"
              active={activeTab === "Circulation"}
              onClick={() => setActiveTab("Circulation")}
            />
            <SidebarItem
              icon={<Users size={18} strokeWidth={2} />}
              text="Members"
              active={activeTab === "Members"}
              onClick={() => setActiveTab("Members")}
            />
            <SidebarItem
              icon={<BarChart2 size={18} strokeWidth={2} />}
              text="Reports"
              active={activeTab === "Reports"}
              onClick={() => setActiveTab("Reports")}
            />
            <SidebarItem
              icon={<IndianRupee size={18} strokeWidth={2} />}
              text="Fees & Fines"
              active={activeTab === "Fines"}
              onClick={() => setActiveTab("Fines")}
            />
          </nav>
        </div>

        <div className="pb-8 space-y-1">
          <div className="px-6 mb-8 mt-2">
            <div className="relative group">
              <button className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white py-3.5 rounded text-[11px] font-bold tracking-widest uppercase transition-colors shadow-sm flex items-center justify-center">
                <Plus size={16} strokeWidth={3} className="mr-2" /> New Entry
              </button>
              <div className="absolute left-0 bottom-full mb-2 w-full bg-white border border-[#E8E6DF] shadow-xl rounded-lg overflow-hidden hidden group-hover:block z-50">
                <button onClick={() => setShowAddModal(true)} className="w-full text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-700 hover:bg-[#F5F4F0] border-b border-[#E8E6DF]">Add New Book</button>
                <button onClick={() => { setIssueData({...issueData, bookId: '', userId: ''}); setShowIssueModal(true); }} className="w-full text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-700 hover:bg-[#F5F4F0] border-b border-[#E8E6DF]">Issue Book</button>
                <button onClick={() => { setRegData({name:'', email:'', password:'Password123'}); setShowRegModal(true); }} className="w-full text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-700 hover:bg-[#F5F4F0]">Register Member</button>
              </div>
            </div>
          </div>
          <SidebarItem
            icon={<Settings size={18} strokeWidth={2} />}
            text="Settings"
            active={activeTab === "Settings"}
            onClick={() => setActiveTab("Settings")}
          />
          <SidebarItem
            icon={<CircleHelp size={18} strokeWidth={2} />}
            text="Support"
            active={activeTab === "Support"}
            onClick={() => setActiveTab("Support")}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 bg-[#FAF9F5] flex items-center justify-between px-10 shrink-0 border-b border-gray-100/50">
          <div className="flex items-center space-x-8">
            <h2 className="font-['Playfair_Display'] text-[22px] font-bold text-[#0B132B]">
              {activeTab === "Members" && "Member Management"}
            </h2>
            <div className="w-80 bg-[#F1EFE9] rounded flex items-center px-4 border border-transparent transition-all h-10">
              <Search size={16} className="text-gray-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search archives..."
                className="w-full bg-transparent border-none outline-none text-xs placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <NotificationArea />
            <div onClick={() => setActiveTab("Settings")} className="cursor-pointer text-gray-400 hover:text-[#0B132B] transition-colors">
              <SlidersHorizontal size={20} />
            </div>

            <button onClick={() => setShowAddMemberModal(true)} className="bg-[#8e6b10] hover:bg-[#7a5a0c] text-white font-bold text-[11px] tracking-widest uppercase px-6 py-2.5 rounded shadow-sm flex items-center transition-colors">
              <UserPlus size={16} strokeWidth={2.5} className="mr-2" /> Add
              Member
            </button>

            <div className="relative">
              <div
                className="cursor-pointer group"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden border border-[#1A2542] shadow-sm shrink-0 flex items-center justify-center hover:shadow-md transition-all">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B132B&color=F2D06B&bold=true`}
                    alt="Admin"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  ></div>

                  <div className="absolute top-14 right-0 w-72 bg-[#FAF9F5] border border-[#E8E6DF] shadow-2xl rounded shadow-sm overflow-hidden z-50 transform origin-top-right transition-all">
                    <div className="p-5 border-b border-[#E8E6DF] bg-[#F5F4F0]">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 rounded border border-[#E8E6DF] shadow-sm overflow-hidden shrink-0">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B132B&color=F2D06B&bold=true`}
                            alt="Admin"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-['Playfair_Display'] font-bold text-gray-900 text-xl leading-tight truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-[#6A81A4] font-medium truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-[8px] font-bold tracking-[0.2em] text-[#8e6b10] uppercase">
                            Staff ID
                          </p>
                          <p className="text-[10px] font-mono text-gray-700 mt-0.5">
                            {user._id.substring(0, 8).toUpperCase()}
                          </p>
                        </div>
                        <span className="text-[8px] font-bold tracking-[0.1em] text-[#FDFCF8] bg-[#0B132B] px-2 py-1 rounded uppercase">
                          {user.role} Elite
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-1 bg-white">
                      <button
                        onClick={() => {
                          setActiveTab("Profile");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#F5F4F0] hover:text-[#0B132B] rounded font-medium transition-colors"
                      >
                        <span className="mr-3 opacity-60">👤</span> View Full Profile
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("Settings");
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-[#F5F4F0] hover:text-[#0B132B] rounded font-medium transition-colors"
                      >
                        <span className="mr-3 opacity-60">⚙️</span> Suite Settings
                      </button>
                    </div>

                    <div className="p-2 border-t border-[#E8E6DF] bg-[#FAF9F5]">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm text-[#D26E4B] hover:bg-[#F4D3D3] hover:text-[#D26E4B] rounded font-bold transition-colors"
                      >
                        <span className="mr-3">🚪</span> Secure Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-10 pb-12 pt-8">
          {/* ---------------- DASHBOARD TAB (from previous design) ---------------- */}
          {activeTab === "Dashboard" && (
            <div className="max-w-6xl">
              {/* Header Greeting */}
              <div className="mb-10 lg:pr-80">
                <h1 className="font-['Playfair_Display'] text-[42px] text-gray-900 leading-tight">
                  Good morning,
                </h1>
                <h1 className="font-['Playfair_Display'] text-[42px] text-[#997B28] leading-tight italic">
                  Curator {user.name.split(" ")[0]}.
                </h1>
              </div>

              <div className="flex flex-col xl:flex-row gap-10">
                {/* Left Column (Main Stats & Circulation Stream) */}
                <div className="flex-1 max-w-4xl">
                  {/* 3 Stats Block */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    <div className="bg-[#EBE9DF]/70 rounded border border-[#E0DED5] shadow-sm p-6 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-5 text-8xl -mr-4 -mb-8 leading-none">
                        📚
                      </div>
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-4">
                        Total Inventory
                      </p>
                      <h3 className="font-serif text-4xl text-gray-900 leading-none mb-6">
                        {totalBooks.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-bold tracking-wide text-[#2E9C7E] flex items-center">
                        <span className="text-xs mr-1 opacity-80">↗</span> {books.length} titles
                      </p>
                    </div>

                    <div className="bg-[#EBE9DF]/70 rounded border border-[#E0DED5] shadow-sm p-6 relative overflow-hidden">
                      <div className="absolute right-0 bottom-0 opacity-5 text-8xl -mr-4 -mb-8 leading-none">
                        📖
                      </div>
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-4">
                        Active Loans
                      </p>
                      <h3 className="font-serif text-4xl text-gray-900 leading-none mb-6">
                        {activeBorrows.length}
                      </h3>
                      <p className="text-[10px] font-bold tracking-wide text-[#A67E14] flex items-center">
                        <span className="mr-1.5 opacity-60">↺</span> {borrows.length} total records
                      </p>
                    </div>

                    <div className="bg-[#0B132B] rounded p-6 shadow border border-[#1A2542] relative overflow-hidden">
                      <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">
                        Overdue Alerts
                      </p>
                      <h3 className="font-serif text-4xl text-[#D2A450] leading-none mb-6">
                        {overdueBorrows.length}
                      </h3>
                      <p className="text-[10px] font-bold tracking-wide text-[#D26E4B] flex items-center">
                        <span className="mr-1.5 mb-0.5">⚠️</span> {overdueBorrows.length > 0 ? 'Action required' : 'All clear!'}
                      </p>
                    </div>
                  </div>

                  {/* Circulation Stream */}
                  <div>
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h3 className="font-['Playfair_Display'] text-[22px] text-gray-900">
                          Circulation Stream
                        </h3>
                        <p className="text-[12px] text-[#6A81A4] mt-0.5">
                          Real-time borrowing and return activity
                        </p>
                      </div>
                      <div className="flex space-x-2 bg-[#EBE9Df] p-[3px] rounded-full border border-gray-200">
                        <button
                          onClick={() => setCirculationFilter("Returned")}
                          className={`text-[9px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full transition-colors ${
                            circulationFilter === "Returned"
                              ? "bg-[#0B132B] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          Returns
                        </button>
                        <button
                          onClick={() => setCirculationFilter("All")}
                          className={`text-[9px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full transition-colors ${
                            circulationFilter === "All"
                              ? "bg-[#0B132B] text-white shadow-sm"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          All Activity
                        </button>
                      </div>
                    </div>

                    {/* Table Wrapper */}
                    <div className="bg-[#FAF9F5] border-t border-gray-200/80">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F2F0E6]/50 border-b border-gray-200">
                          <tr>
                            <th className="font-medium text-[9px] uppercase tracking-[0.15em] text-[#6A81A4] py-3.5 px-5 w-28">
                              Status
                            </th>
                            <th className="font-medium text-[9px] uppercase tracking-[0.15em] text-[#6A81A4] py-3.5 px-5">
                              Resource Metadata
                            </th>
                            <th className="font-medium text-[9px] uppercase tracking-[0.15em] text-[#6A81A4] py-3.5 px-5 w-40">
                              Borrower
                            </th>
                            <th className="font-medium text-[9px] uppercase tracking-[0.15em] text-[#6A81A4] py-3.5 px-5 w-24">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(() => {
                            const filteredBorrows = circulationFilter === "All"
                              ? borrows
                              : borrows.filter(b => b.status === circulationFilter);
                            return filteredBorrows.length > 0 ? (
                              filteredBorrows.map((br) => (
                              <tr
                                key={br._id}
                                className="hover:bg-gray-50/40 transition-colors"
                              >
                                <td className="px-5 py-5 border-r border-[#FAF9F5] bg-transparent shadow-[inset_-1px_0_0_#F2F0E6]">
                                  <span
                                    className={`text-[8px] font-bold tracking-widest px-3 py-1 rounded-full uppercase inline-block border ${br.status === "Borrowed" ? "bg-[#FCEAB3] text-[#A67E14] border-[#E9D698]" : "bg-blue-100 text-blue-800 border-blue-200"}`}
                                  >
                                    {br.status}
                                  </span>
                                </td>
                                <td className="px-5 py-5">
                                  <div className="flex items-center">
                                    <div className="w-10 h-14 bg-[#14213d] mr-4 shrink-0 shadow-sm border border-[#1A2A4D]">
                                      {br.book?.coverImage?.url ? (
                                        <img
                                          src={br.book.coverImage.url}
                                          alt="cover"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : null}
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-[13px] text-gray-900 mb-0.5 max-w-[200px] truncate">
                                        {br.book?.title}
                                      </h4>
                                      <p className="text-[10px] text-gray-500 leading-tight tracking-widest">
                                        <span className="text-[8px] uppercase">
                                          ID:{" "}
                                        </span>
                                        {br._id}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-5">
                                  <div className="flex items-center">
                                    <div className="w-6 h-6 rounded-full bg-[#E5ECF6] text-[#6A81A4] text-[8px] font-bold flex items-center justify-center mr-3 shrink-0">
                                      {br.user?.name
                                        ? br.user.name.charAt(0).toUpperCase()
                                        : "U"}
                                    </div>
                                    <div className="text-[11px] leading-tight">
                                      <p className="text-gray-900 truncate w-24">
                                        {br.user?.name}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-5 text-[11px] text-[#6A81A4] leading-tight flex flex-col">
                                  <span>
                                    {new Date(
                                      br.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span className="opacity-70 text-[9px]">
                                    {new Date(
                                      br.createdAt,
                                    ).toLocaleTimeString()}
                                  </span>
                                </td>
                              </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="4"
                                  className="py-8 text-center text-gray-500 italic text-xs"
                                >
                                  {circulationFilter === "Returned" ? "No returned books yet." : "No circulation history yet."}
                                </td>
                              </tr>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Column (Widgets) */}
                <div className="w-full xl:w-80 space-y-10 shrink-0 border-l border-gray-200/50 pl-0 xl:pl-10">
                  {/* Return Requests Widget */}
                  <div className="bg-[#FAF9F5] rounded-xl border border-[#E0DED5] p-6 shadow-sm">
                    <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900 mb-5 flex justify-between items-center">
                      Return Requests
                      <span className="text-[10px] bg-[#D26E4B] text-white px-2 py-0.5 rounded-full font-bold">{borrows.filter(b => b.status === 'Return Requested').length}</span>
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      {borrows.filter(b => b.status === "Return Requested").length > 0 ? (
                        borrows.filter(b => b.status === "Return Requested").map(req => (
                          <div key={req._id} className="bg-white rounded-lg p-4 border border-[#E0DED5] shadow-sm relative group overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-[#D26E4B]"></div>
                             <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-10 bg-gray-900 rounded shrink-0 overflow-hidden">
                                   {req.book?.coverImage?.url && <img src={req.book.coverImage.url} alt="cover" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <h4 className="text-xs font-bold text-gray-900 truncate">{req.book?.title}</h4>
                                   <p className="text-[10px] text-gray-500 font-medium truncate">{req.user?.name}</p>
                                </div>
                             </div>
                             <button onClick={() => handleReturnAction(req._id)} className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white text-[9px] font-bold tracking-widest uppercase py-2 rounded shadow-sm transition-colors">
                                Approve Return
                             </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-gray-400 italic text-center py-6 border border-dashed border-[#E0DED5] rounded bg-white/50">No pending requests.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center border-b border-gray-200/80 pb-3 mb-4">
                      <h3 className="font-['Playfair_Display'] font-bold text-[17px] text-gray-900">
                        Daily Agenda
                      </h3>
                      <p className="text-[8px] font-bold tracking-[0.1em] text-[#997B28] uppercase">
                        {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {agendaItems.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-4">No tasks scheduled today.</p>
                      )}
                      {agendaItems.map(item => (
                        <div key={item.id} className={`bg-white p-4 shadow-sm border border-gray-100 relative group cursor-pointer hover:border-gray-200 transition-colors ${item.done ? 'opacity-50' : ''}`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all ${item.done ? 'bg-gray-300' : 'bg-[#D26E4B]'}`}></div>
                          <div className="flex items-start justify-between">
                            <div onClick={() => toggleAgendaItem(item.id)} className="flex-1">
                              <p className={`font-bold text-[12px] mb-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                <span className="mr-2">📌</span> {item.text}
                              </p>
                              {(item.location || item.time) && (
                                <p className="text-[10px] text-gray-500 ml-6">
                                  {item.location}{item.location && item.time ? ' • ' : ''}{item.time}
                                </p>
                              )}
                            </div>
                            <button onClick={() => removeAgendaItem(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-opacity text-xs px-1 ml-2 shrink-0">✕</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {showAddAgenda ? (
                      <div className="mt-3 bg-[#F5F4F0] border border-[#E0DED5] rounded p-4 space-y-2">
                        <input autoFocus type="text" placeholder="Task description *" value={newAgenda.text} onChange={e => setNewAgenda({...newAgenda, text: e.target.value})} className="w-full text-xs border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#8e6b10]" />
                        <input type="text" placeholder="Location (optional)" value={newAgenda.location} onChange={e => setNewAgenda({...newAgenda, location: e.target.value})} className="w-full text-xs border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#8e6b10]" />
                        <input type="text" placeholder="Time (e.g. 10:00 AM)" value={newAgenda.time} onChange={e => setNewAgenda({...newAgenda, time: e.target.value})} className="w-full text-xs border border-gray-200 rounded px-3 py-2 focus:outline-none focus:border-[#8e6b10]" />
                        <div className="flex space-x-2 pt-1">
                          <button onClick={addAgendaItem} className="flex-1 bg-[#0B132B] text-white text-[10px] font-bold tracking-widest uppercase py-2 rounded">Add</button>
                          <button onClick={() => setShowAddAgenda(false)} className="flex-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase py-2 rounded">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowAddAgenda(true)} className="mt-4 text-[9px] font-bold tracking-[0.2em] text-[#8e6b10] hover:text-[#0B132B] uppercase w-full text-left transition-colors">+ Add Task</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- MEMBERS TAB (New Wireframe) ---------------- */}
          {activeTab === "Members" && (() => {
            // Build rich per-member data
            const memberFilter = membersFilter || 'all';
            const memberSearch = membersSearch || '';

            const enrichedMembers = memberUsers.map(member => {
              const mb = borrows.filter(b => b.user?._id === member._id || b.user === member._id);
              const activeLoans = mb.filter(b => b.status === "Borrowed" || b.status === "Requested" || b.status === "Return Requested");
              const overdueLoans = activeLoans.filter(b => new Date(b.dueDate) < new Date());
              const returnedLoans = mb.filter(b => b.status === 'Returned');
              const currentFine = overdueLoans.reduce((s, b) => s + calcFine(b.dueDate), 0);
              const collectedFines = mb.reduce((s, b) => s + (b.fine || 0), 0);
              const lastActivity = mb.length > 0
                ? new Date(Math.max(...mb.map(b => new Date(b.createdAt))))
                : null;
              const notified = notifiedMembers[member._id] || false;
              return { member, mb, activeLoans, overdueLoans, returnedLoans, currentFine, collectedFines, lastActivity, notified };
            });

            const filtered = enrichedMembers
              .filter(r => {
                if (memberFilter === 'active') return r.activeLoans.length > 0;
                if (memberFilter === 'overdue') return r.overdueLoans.length > 0;
                if (memberFilter === 'clear') return r.currentFine === 0 && r.overdueLoans.length === 0;
                return true;
              })
              .filter(r => !memberSearch || r.member.name.toLowerCase().includes(memberSearch.toLowerCase()) || r.member.email?.toLowerCase().includes(memberSearch.toLowerCase()));

            const totalFines = enrichedMembers.reduce((s, r) => s + r.currentFine, 0);
            const overdueCount = enrichedMembers.filter(r => r.overdueLoans.length > 0).length;

            return (
              <div className="max-w-7xl pb-16">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h1 className="font-['Playfair_Display'] text-[42px] text-[#0B132B] leading-tight mb-2">Member Registry</h1>
                    <p className="text-[15px] text-[#4A4E4D] font-light leading-relaxed">
                      {memberUsers.length} registered members · {enrichedMembers.filter(r => r.activeLoans.length > 0).length} with active loans · {overdueCount} overdue
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={handleExportManifest} className="bg-[#EBE9DF] border border-[#D5D3CA] hover:bg-[#E0DED5] text-[#0B132B] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded transition-colors shadow-sm flex items-center">
                      <Download size={13} className="mr-2" /> Export Manifest
                    </button>
                  </div>
                </div>

                {/* 4 KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
                  {[
                    { label: 'Total Members', value: memberUsers.length, sub: `${members.length - memberUsers.length} staff`, color: 'text-gray-900', bg: 'bg-[#EBE9DF]', border: 'border-[#E0DED5]' },
                    { label: 'Active Loans', value: enrichedMembers.reduce((s, r) => s + r.activeLoans.length, 0), sub: `${enrichedMembers.filter(r => r.activeLoans.length > 0).length} members borrowing`, color: 'text-[#A67E14]', bg: 'bg-[#EBE9DF]', border: 'border-[#E0DED5]' },
                    { label: 'Overdue Members', value: overdueCount, sub: `₹${totalFines} outstanding`, color: 'text-[#D26E4B]', bg: 'bg-[#0B132B]', border: 'border-[#1A2542]', dark: true },
                    { label: 'Returns This Month', value: borrows.filter(b => b.status === 'Returned' && new Date(b.returnDate) > new Date(Date.now() - 30*86400000)).length, sub: 'in last 30 days', color: 'text-[#2E9C7E]', bg: 'bg-[#EBE9DF]', border: 'border-[#E0DED5]' },
                  ].map(({ label, value, sub, color, bg, border, dark }) => (
                    <div key={label} className={`${bg} rounded-xl p-6 shadow-sm border ${border}`}>
                      <p className={`text-[9px] font-bold tracking-[0.2em] uppercase mb-3 ${dark ? 'text-gray-400' : 'text-[#6A81A4]'}`}>{label}</p>
                      <h3 className={`font-serif text-4xl leading-none mb-2 ${dark ? 'text-[#D2A450]' : color}`}>{value}</h3>
                      <p className={`text-[10px] font-bold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Notification toast */}
                {notifyToast && (
                  <div className="fixed bottom-6 right-6 z-50 bg-[#0B132B] text-white px-6 py-4 rounded-xl shadow-2xl border border-[#1A2542] flex items-center space-x-3 animate-pulse">
                    <span className="text-lg">🔔</span>
                    <div>
                      <p className="font-bold text-sm">{notifyToast}</p>
                      <p className="text-[10px] text-gray-400">Notification sent to member & librarian</p>
                    </div>
                  </div>
                )}

                {/* Filter bar + Search */}
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <div className="flex space-x-2">
                    {[
                      { key: 'all', label: 'All Members', count: enrichedMembers.length },
                      { key: 'active', label: 'Active Loans', count: enrichedMembers.filter(r => r.activeLoans.length > 0).length },
                      { key: 'overdue', label: 'Overdue', count: overdueCount },
                      { key: 'clear', label: 'Clear', count: enrichedMembers.filter(r => r.currentFine === 0 && r.overdueLoans.length === 0).length },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setMembersFilter(tab.key)}
                        className={`flex items-center space-x-2 px-5 py-2 rounded-full text-[10px] font-bold tracking-widest uppercase transition-colors border ${
                          memberFilter === tab.key
                            ? 'bg-[#0B132B] text-white border-[#0B132B] shadow'
                            : 'bg-[#F5F4F0] text-gray-600 border-[#E0DED5] hover:bg-[#EAE8DD]'
                        }`}
                      >
                        <span>{tab.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${memberFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>{tab.count}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center bg-white border border-[#E0DED5] rounded-lg px-3 py-2.5 shadow-inner w-60">
                    <Search size={13} className="text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search name or email..."
                      value={memberSearch}
                      onChange={e => setMembersSearch(e.target.value)}
                      className="text-xs bg-transparent outline-none w-full placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Rich Members Table */}
                <div className="bg-white rounded-xl border border-[#E0DED5] shadow-sm overflow-hidden mb-10">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F4F0] border-b border-[#E0DED5]">
                      <tr>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-6">Member</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Status</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Active Loans</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Overdue</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Returns</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Fine (Accruing)</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Last Activity</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EEE8]">
                      {filtered.length > 0 ? filtered.map(({ member, activeLoans, overdueLoans, returnedLoans, currentFine, collectedFines, lastActivity, notified, mb }) => {
                        const isOverdue = overdueLoans.length > 0;
                        const statusLabel = isOverdue ? 'Overdue' : activeLoans.length > 0 ? 'Active' : mb.length > 0 ? 'Returned' : 'No Loans';
                        const statusColor = isOverdue ? 'bg-[#F4D3D3]/80 text-[#D26E4B] border-[#D26E4B]/30'
                          : activeLoans.length > 0 ? 'bg-[#FFF3CD] text-[#A67E14] border-[#E9C86A]/40'
                          : mb.length > 0 ? 'bg-[#E8F5E9] text-[#2E9C7E] border-[#2E9C7E]/30'
                          : 'bg-gray-100 text-gray-400 border-gray-200';

                        return (
                          <tr key={member._id} className={`hover:bg-[#FDFCF8] transition-colors group ${isOverdue ? 'border-l-2 border-l-[#D26E4B]' : ''}`}>
                            {/* Member Identity */}
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="relative mr-4 shrink-0">
                                  <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0B132B&color=F2D06B&bold=true&size=40`}
                                    alt={member.name}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200"
                                  />
                                  {isOverdue && (
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#D26E4B] rounded-full border-2 border-white" title="Overdue"></span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-[13px] text-gray-900 leading-tight">{member.name}</p>
                                  <p className="text-[9px] text-gray-400 truncate max-w-[160px]">{member.email}</p>
                                  <p className="text-[8px] font-bold tracking-widest text-gray-300 uppercase mt-0.5">ID: {member._id?.substring(0,8).toUpperCase()}</p>
                                </div>
                              </div>
                            </td>

                            {/* Status badge */}
                            <td className="px-4 py-4">
                              <span className={`text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border ${statusColor}`}>
                                {statusLabel}
                              </span>
                            </td>

                            {/* Active Loans */}
                            <td className="px-4 py-4">
                              {activeLoans.length > 0 ? (
                                <div>
                                  <p className="font-bold text-[14px] text-[#A67E14]">{activeLoans.length}</p>
                                  <div className="mt-1 space-y-0.5">
                                    {activeLoans.slice(0, 2).map(b => (
                                      <p key={b._id} className="text-[10px] text-gray-500 truncate max-w-[130px] flex items-center">
                                        <span className="w-1 h-1 rounded-full bg-[#A67E14] mr-1.5 shrink-0"></span>
                                        {b.book?.title || 'Book'}
                                      </p>
                                    ))}
                                    {activeLoans.length > 2 && <p className="text-[9px] text-gray-400 italic">+{activeLoans.length - 2} more</p>}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-[12px]">—</span>
                              )}
                            </td>

                            {/* Overdue */}
                            <td className="px-4 py-4">
                              {overdueLoans.length > 0 ? (
                                <div>
                                  <p className="font-bold text-[14px] text-[#D26E4B]">{overdueLoans.length} book{overdueLoans.length > 1 ? 's' : ''}</p>
                                  <div className="mt-1 space-y-0.5">
                                    {overdueLoans.slice(0, 2).map(b => {
                                      const daysLate = Math.floor((Date.now() - new Date(b.dueDate)) / 86400000);
                                      return (
                                        <p key={b._id} className="text-[10px] text-[#D26E4B]/80 flex items-center">
                                          <span className="w-1 h-1 rounded-full bg-[#D26E4B] mr-1.5 shrink-0"></span>
                                          {b.book?.title?.substring(0, 16) || 'Book'} · {daysLate}d late
                                        </p>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#2E9C7E] font-bold flex items-center">
                                  <span className="mr-1">✓</span> None
                                </span>
                              )}
                            </td>

                            {/* Returns */}
                            <td className="px-4 py-4">
                              <div>
                                <p className="font-bold text-[14px] text-[#2E9C7E]">{returnedLoans.length}</p>
                                <p className="text-[9px] text-gray-400 mt-0.5">of {mb.length} total</p>
                                {collectedFines > 0 && (
                                  <p className="text-[9px] text-[#2E9C7E] font-bold mt-0.5">₹{collectedFines} paid</p>
                                )}
                              </div>
                            </td>

                            {/* Fine (Accruing ₹1/day) */}
                            <td className="px-4 py-4">
                              {currentFine > 0 ? (
                                <div className="bg-[#F4D3D3]/40 border border-[#D26E4B]/20 rounded-lg px-3 py-2 inline-block">
                                  <p className="font-bold text-[16px] text-[#D26E4B] leading-none">₹{currentFine}</p>
                                  <p className="text-[8px] text-[#D26E4B]/70 font-bold uppercase tracking-widest mt-0.5">+₹1/day</p>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-[#2E9C7E] bg-[#E8F5E9] px-3 py-1.5 rounded-lg uppercase tracking-widest text-[9px]">₹0 Clear</span>
                              )}
                            </td>

                            {/* Last Activity */}
                            <td className="px-4 py-4">
                              {lastActivity ? (
                                <div>
                                  <p className="text-[11px] font-bold text-gray-700">
                                    {lastActivity.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                                  </p>
                                  <p className="text-[9px] text-gray-400 mt-0.5">
                                    {Math.floor((Date.now() - lastActivity) / 86400000)}d ago
                                  </p>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-[11px]">No activity</span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4 text-right">
                              <div className="flex flex-col items-end space-y-2">
                                {isOverdue && (
                                  <button
                                    onClick={() => handleSendFineNotification(member, currentFine, overdueLoans)}
                                    disabled={notified}
                                    className={`text-[9px] font-bold tracking-widest uppercase px-3 py-2 rounded shadow-sm transition-colors flex items-center whitespace-nowrap ${
                                      notified
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-[#D26E4B] hover:bg-[#b85c3c] text-white'
                                    }`}
                                  >
                                    <Bell size={10} className="mr-1" />
                                    {notified ? 'Notified ✓' : 'Notify'}
                                  </button>
                                )}
                                {currentFine > 0 && (
                                  <button
                                    onClick={() => setSettlementTarget({ member, amount: currentFine, borrows: overdueLoans })}
                                    className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[9px] font-bold tracking-widest uppercase px-3 py-2 rounded shadow-sm transition-colors flex items-center whitespace-nowrap"
                                  >
                                    <IndianRupee size={10} className="mr-1" /> Settle
                                  </button>
                                )}
                                {!isOverdue && activeLoans.length === 0 && mb.length === 0 && (
                                  <span className="text-[9px] text-gray-300 uppercase tracking-widest">—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan="8" className="py-12 text-center text-gray-400 italic text-sm">
                            No members match the current filter.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-[#F5F4F0] border-t border-[#E0DED5] flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">Showing {filtered.length} of {memberUsers.length} members</p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#D26E4B]"></div>
                        <span className="text-[10px] text-gray-500">Outstanding: <strong className="text-gray-900">₹{totalFines}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#2E9C7E]"></div>
                        <span className="text-[10px] text-gray-500">Collected: <strong className="text-gray-900">₹{enrichedMembers.reduce((s, r) => s + r.collectedFines, 0)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ---------------- REPORTS TAB ---------------- */}
          {activeTab === "Reports" && (() => {
            // --- Derived analytics data ---
            const COLORS = ['#0B132B','#A67E14','#2E9C7E','#D26E4B','#6A81A4','#997B28','#D2A450','#1d6b55'];

            // Borrow activity last 7 days
            const last7 = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(); d.setDate(d.getDate() - (6 - i));
              const label = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
              const count = borrows.filter(b => new Date(b.createdAt).toDateString() === d.toDateString()).length;
              const returned = borrows.filter(b => b.returnDate && new Date(b.returnDate).toDateString() === d.toDateString()).length;
              return { label, borrowed: count, returned };
            });

            // Books by genre
            const genreMap = {};
            books.forEach(b => { const g = b.genre || 'Other'; genreMap[g] = (genreMap[g] || 0) + 1; });
            const genreData = Object.entries(genreMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([name, value]) => ({ name, value }));

            // Loan status pie
            const statusData = [
              { name: 'Active Loans', value: activeBorrows.length },
              { name: 'Returned', value: borrows.filter(b => b.status === 'Returned').length },
              { name: 'Overdue', value: overdueBorrows.length },
            ].filter(d => d.value > 0);

            // Top 5 most borrowed books
            const bookBorrowCount = {};
            borrows.forEach(b => {
              const id = b.book?._id || b.book;
              if (id) bookBorrowCount[id] = (bookBorrowCount[id] || 0) + 1;
            });
            const topBooks = books
              .map(b => ({ ...b, count: bookBorrowCount[b._id] || 0 }))
              .filter(b => b.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Top 5 members by borrow count
            const memberBorrowCount = {};
            borrows.forEach(b => {
              const id = b.user?._id || b.user;
              if (id) memberBorrowCount[id] = (memberBorrowCount[id] || 0) + 1;
            });
            const topMembers = memberUsers
              .map(m => ({ ...m, count: memberBorrowCount[m._id] || 0 }))
              .filter(m => m.count > 0)
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);

            // Collection health
            const totalCopies = books.reduce((s, b) => s + (b.totalCopies || 0), 0);
            const availCopies = books.reduce((s, b) => s + (b.availableCopies || 0), 0);
            const utilizationRate = totalCopies > 0 ? Math.round(((totalCopies - availCopies) / totalCopies) * 100) : 0;
            const returnRate = borrows.length > 0
              ? Math.round((borrows.filter(b => b.status === 'Returned').length / borrows.length) * 100) : 0;
            const overdueRate = borrows.filter(b => b.status === 'Borrowed').length > 0
              ? Math.round((overdueBorrows.length / borrows.filter(b => b.status === 'Borrowed').length) * 100) : 0;

            const CustomTooltip = ({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#0B132B] text-white px-4 py-3 rounded-lg shadow-xl border border-[#1A2542] text-xs">
                    <p className="font-bold mb-1">{label}</p>
                    {payload.map((p, i) => (
                      <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
                    ))}
                  </div>
                );
              }
              return null;
            };

            return (
              <div className="max-w-7xl pb-20">
                {/* Header */}
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h1 className="font-['Playfair_Display'] text-[42px] text-[#0B132B] leading-tight">Analytics & Reports</h1>
                    <p className="text-[14px] text-[#6A81A4] mt-1">Real-time insights from {books.length} titles, {memberUsers.length} members & {borrows.length} borrow records</p>
                  </div>
                  <button onClick={handleExportReport} className="flex items-center bg-[#EBE9DF] border border-[#D5D3CA] hover:bg-[#E0DED5] text-[#0B132B] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded transition-colors shadow-sm">
                    <Download size={13} className="mr-2" /> Export Report
                  </button>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                  {[
                    { label: 'Total Books', value: books.length, sub: `${totalCopies} total copies`, color: 'text-gray-900', bg: 'bg-[#EBE9DF]' },
                    { label: 'Active Loans', value: activeBorrows.length, sub: `${utilizationRate}% utilization`, color: 'text-[#A67E14]', bg: 'bg-[#EBE9DF]' },
                    { label: 'Total Members', value: memberUsers.length, sub: `${members.length - memberUsers.length} staff accounts`, color: 'text-[#1d6b55]', bg: 'bg-[#EBE9DF]' },
                    { label: 'Overdue', value: overdueBorrows.length, sub: `${overdueRate}% of current loans`, color: 'text-[#D26E4B]', bg: 'bg-[#0B132B]', dark: true },
                  ].map(({ label, value, sub, color, bg, dark }) => (
                    <div key={label} className={`${bg} rounded-xl p-6 shadow-sm border ${dark ? 'border-[#1A2542]' : 'border-[#E0DED5]'}`}>
                      <p className={`text-[9px] font-bold tracking-[0.2em] uppercase mb-3 ${dark ? 'text-gray-400' : 'text-[#6A81A4]'}`}>{label}</p>
                      <h3 className={`font-serif text-4xl leading-none mb-2 ${dark ? 'text-[#D2A450]' : color}`}>{value}</h3>
                      <p className={`text-[10px] font-bold ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Row 1: Activity Area Chart + Loan Status Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* 7-day Activity Chart */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-[#E0DED5] shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900">7-Day Borrow Activity</h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">Daily loans issued vs. returned</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={last7} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBorrowed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0B132B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0B132B" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorReturned" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2E9C7E" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2E9C7E" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE8" />
                        <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="borrowed" name="Issued" stroke="#0B132B" strokeWidth={2} fill="url(#colorBorrowed)" />
                        <Area type="monotone" dataKey="returned" name="Returned" stroke="#2E9C7E" strokeWidth={2} fill="url(#colorReturned)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="flex items-center space-x-6 mt-3">
                      <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-[#0B132B] mr-2"></div><span className="text-[10px] text-gray-500">Issued</span></div>
                      <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-[#2E9C7E] mr-2"></div><span className="text-[10px] text-gray-500">Returned</span></div>
                    </div>
                  </div>

                  {/* Loan Status Pie */}
                  <div className="bg-white rounded-xl border border-[#E0DED5] shadow-sm p-6">
                    <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900 mb-1">Loan Status</h3>
                    <p className="text-[11px] text-gray-400 mb-4">Current distribution</p>
                    {statusData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                              {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-2 mt-2">
                          {statusData.map((d, i) => (
                            <div key={d.name} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ background: COLORS[i % COLORS.length] }}></div>
                                <span className="text-[10px] text-gray-600">{d.name}</span>
                              </div>
                              <span className="text-[11px] font-bold text-gray-900">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-8">No borrow data yet.</p>
                    )}
                  </div>
                </div>

                {/* Row 2: Genre Bar Chart + Collection Health */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                  {/* Books by Genre */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-[#E0DED5] shadow-sm p-6">
                    <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900 mb-1">Collection by Genre</h3>
                    <p className="text-[11px] text-gray-400 mb-5">Number of titles per genre</p>
                    {genreData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={genreData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={14}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0EEE8" />
                          <XAxis type="number" tick={{ fontSize: 9, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#4A4E4D' }} tickLine={false} axisLine={false} width={110} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name="Titles" radius={[0, 4, 4, 0]}>
                            {genreData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-8">No genre data available.</p>
                    )}
                  </div>

                  {/* Collection Health */}
                  <div className="bg-[#0B132B] rounded-xl p-6 shadow-lg border border-[#1A2542] text-white flex flex-col justify-between">
                    <div>
                      <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-white mb-1">Collection Health</h3>
                      <p className="text-[11px] text-gray-400 mb-6">Live system metrics</p>
                      {[
                        { label: 'Stock Utilization', value: utilizationRate, color: '#D2A450' },
                        { label: 'Return Rate', value: returnRate, color: '#2E9C7E' },
                        { label: 'Overdue Rate', value: overdueRate, color: '#D26E4B' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="mb-5">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{label}</span>
                            <span className="font-bold text-sm" style={{ color }}>{value}%</span>
                          </div>
                          <div className="w-full bg-[#1A2542] rounded-full h-1.5">
                            <div className="h-1.5 rounded-full transition-all" style={{ width: `${value}%`, background: color }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-[#1A2542]">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Total Collection</p>
                      <p className="font-serif text-3xl text-[#D2A450]">{totalCopies} <span className="text-sm text-gray-400 font-sans">copies</span></p>
                    </div>
                  </div>
                </div>

                {/* Row 3: Top Books + Top Members */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Borrowed Books */}
                  <div className="bg-white rounded-xl border border-[#E0DED5] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E0DED5] bg-[#F5F4F0] flex items-center justify-between">
                      <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900">Most Borrowed Books</h3>
                      <span className="text-[9px] font-bold tracking-widest text-[#A67E14] uppercase">Top 5</span>
                    </div>
                    {topBooks.length > 0 ? (
                      <div className="divide-y divide-[#F0EEE8]">
                        {topBooks.map((book, i) => (
                          <div key={book._id} className="flex items-center px-6 py-4 hover:bg-[#FDFCF8] transition-colors">
                            <span className="font-serif text-2xl text-gray-200 font-bold w-8 shrink-0">{i + 1}</span>
                            <div className="w-8 h-11 bg-[#0B132B] ml-2 mr-4 shrink-0 rounded-sm overflow-hidden shadow-sm">
                              {book.coverImage?.url && <img src={book.coverImage.url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[13px] text-gray-900 truncate">{book.title}</p>
                              <p className="text-[10px] text-gray-400">{book.author} · {book.genre || 'General'}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="font-bold text-[15px] text-[#0B132B]">{book.count}</p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-widest">borrows</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-10">No borrow history yet.</p>
                    )}
                  </div>

                  {/* Top Members */}
                  <div className="bg-white rounded-xl border border-[#E0DED5] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#E0DED5] bg-[#F5F4F0] flex items-center justify-between">
                      <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900">Most Active Members</h3>
                      <span className="text-[9px] font-bold tracking-widest text-[#2E9C7E] uppercase">Top 5</span>
                    </div>
                    {topMembers.length > 0 ? (
                      <div className="divide-y divide-[#F0EEE8]">
                        {topMembers.map((member, i) => {
                          const mb = borrows.filter(b => b.user?._id === member._id || b.user === member._id);
                          const active = mb.filter(b => b.status === 'Borrowed').length;
                          const overdue = mb.filter(b => b.status === 'Borrowed' && new Date(b.dueDate) < new Date()).length;
                          return (
                            <div key={member._id} className="flex items-center px-6 py-4 hover:bg-[#FDFCF8] transition-colors">
                              <span className="font-serif text-2xl text-gray-200 font-bold w-8 shrink-0">{i + 1}</span>
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0B132B&color=F2D06B&bold=true&size=36`}
                                alt={member.name}
                                className="w-9 h-9 rounded-full ml-2 mr-4 shrink-0 border border-gray-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-[13px] text-gray-900 truncate">{member.name}</p>
                                <p className="text-[10px] text-gray-400 truncate">{member.email}</p>
                              </div>
                              <div className="text-right shrink-0 ml-4 space-y-0.5">
                                <p className="font-bold text-[15px] text-[#0B132B]">{member.count}</p>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest">borrows</p>
                                {overdue > 0 && <p className="text-[9px] text-[#D26E4B] font-bold">{overdue} overdue</p>}
                                {active > 0 && overdue === 0 && <p className="text-[9px] text-[#2E9C7E] font-bold">{active} active</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-10">No records found.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ---------------- CIRCULATION TAB (New Wireframe) ---------------- */}
          {activeTab === "Circulation" && (
            <div className="max-w-6xl">
              {/* Header and Stats */}
              <div className="flex justify-between items-start mb-10">
                <div className="max-w-2xl">
                  <h1 className="font-['Playfair_Display'] text-[46px] text-[#0B132B] leading-tight mb-2">
                    Circulation Desk
                  </h1>
                  <p className="text-[15px] text-[#4A4E4D] font-light leading-relaxed max-w-lg">
                    Curating the flow of the archive. Monitor active loans and
                    manage modern scholarly returns with precision.
                  </p>
                </div>
                <div className="flex space-x-5">
                  <div className="bg-[#EAE8DD] rounded border border-[#E0DED5] px-8 py-6 shadow-sm flex flex-col justify-center items-center min-w-[160px]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#8e6b10] uppercase mb-4">
                      Active Loans
                    </p>
                    <h3 className="font-serif text-4xl text-gray-900 leading-none">
                      {activeBorrows.length}
                    </h3>
                  </div>
                  <div className="bg-[#F5D77D] rounded border border-[#E9C86A] px-8 py-6 shadow-sm flex flex-col justify-center items-center min-w-[160px]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#8e6b10] uppercase mb-4 text-center">
                      Overdue
                    </p>
                    <h3 className="font-serif text-4xl text-gray-900 leading-none">
                      {overdueBorrows.length}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Process Return Box */}
              <div className="bg-[#F5F4F0] rounded-xl p-8 mb-12 border border-[#EAE8DD] shadow-sm flex items-center justify-between">
                <div className="max-w-sm">
                  <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-2">
                    Process Return
                  </h3>
                  <p className="text-[13px] text-[#6A81A4] leading-relaxed">
                    Paste the Borrow ID directly to verify archive condition and
                    return item to stack.
                  </p>
                </div>
                <div className="flex-1 max-w-[560px] flex items-center space-x-4">
                  <div className="flex-1 bg-[#FDFCF8] rounded border border-[#DCDAD2] flex items-center px-4 py-4 shadow-inner text-gray-600">
                    <span className="text-[#8e6b10] mr-4 text-xl">🛒</span>
                    <input
                      value={returnIdInput}
                      onChange={(e) => setReturnIdInput(e.target.value)}
                      type="text"
                      placeholder="Enter Borrow ID from Circulation stream..."
                      className="w-full bg-transparent border-none outline-none text-sm placeholder-gray-400 font-medium"
                    />
                  </div>
                  <button
                    onClick={handleReturnAction}
                    className="bg-[#0B132B] hover:bg-[#1a233a] text-white font-bold text-[10px] tracking-widest uppercase px-8 py-4.5 rounded shadow-sm transition-colors whitespace-nowrap"
                  >
                    Process Entry
                  </button>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-8">
                {/* Left: Administrative Queues */}
                <div className="w-full xl:w-96 space-y-8 shrink-0">
                  {/* Borrow Requests (IN STACK items) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Playfair_Display'] text-[20px] text-gray-900">Issue Requests</h3>
                      <span className="text-[8px] font-bold tracking-widest text-[#2E9C7E] uppercase bg-green-100 px-2.5 py-1 rounded-full">
                        {borrows.filter(b => b.status === 'Requested').length} NEW
                      </span>
                    </div>
                    
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 flex flex-col">
                      {borrows.filter(b => b.status === 'Requested').map((req) => (
                        <div key={req._id} className="bg-white rounded-lg p-4 border border-[#EAE8DD] shadow-sm hover:border-[#D2A450] transition-colors group">
                          <div className="flex items-center space-x-3 mb-3">
                             <div className="w-8 h-12 bg-[#0B132B] rounded border border-gray-700 shrink-0 overflow-hidden shadow-sm">
                               {req.book?.coverImage?.url && <img src={req.book.coverImage.url} alt="cover" className="w-full h-full object-cover" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[11px] text-gray-900 truncate leading-tight uppercase font-['Playfair_Display']">{req.book?.title}</h4>
                                <p className="text-[9px] text-[#A67E14] font-bold mt-0.5 truncate uppercase tracking-widest">{req.user?.name}</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                             <span className="text-[8px] text-gray-400 font-mono">ID: {req._id.substring(req._id.length-6)}</span>
                             <button 
                               onClick={() => handleApproveBorrow(req._id)}
                               className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[8px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded transition-all shadow-md group-hover:scale-105"
                             >
                               Approve Issue
                             </button>
                          </div>
                        </div>
                      ))}
                      {borrows.filter(b => b.status === 'Requested').length === 0 && (
                        <div className="text-center py-8 bg-[#F5F4F0]/50 rounded-lg border border-dashed border-[#EAE8DD]">
                          <p className="text-gray-400 italic text-[11px]">No active issue requests.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Desk (Online Submissions) */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-['Playfair_Display'] text-[20px] text-gray-900">Return Desk</h3>
                      <span className="text-[8px] font-bold tracking-widest text-[#0B132B] uppercase bg-blue-100 px-2.5 py-1 rounded-full">
                        {borrows.filter(b => b.status === "Return Requested").length} INCOMING
                      </span>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 flex flex-col">
                       {borrows.filter(b => b.status === "Return Requested").map((brv) => (
                         <div key={brv._id} className="bg-[#FAF9F6] rounded-lg p-4 border border-[#EAE8DD] shadow-sm hover:border-[#0B132B] transition-colors group">
                           <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-12 bg-gray-200 rounded border border-gray-300 shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                                {brv.book?.coverImage?.url ? <img src={brv.book.coverImage.url} alt="cover" className="w-full h-full object-cover" /> : <Book size={12} className="text-gray-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h4 className="font-bold text-[11px] text-gray-700 truncate leading-tight uppercase font-['Playfair_Display']">{brv.book?.title}</h4>
                                 <p className="text-[9px] text-[#A67E14] font-bold mt-0.5 truncate uppercase tracking-widest">{brv.user?.name}</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                              <span className="text-[8px] text-gray-400 font-mono italic">Submitted online</span>
                              <button onClick={() => handleApproveReturn(brv._id)} className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[7px] font-bold px-4 py-1.5 rounded uppercase tracking-widest transition-all shadow-sm">
                                 Verify Receipt
                              </button>
                           </div>
                         </div>
                       ))}
                       {borrows.filter(b => b.status === "Return Requested").length === 0 && (
                        <div className="text-center py-8 bg-[#F5F4F0]/30 rounded-lg border border-dashed border-[#EAE8DD]">
                          <p className="text-gray-400 italic text-[11px]">No pending returns.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Overdue Items & Physical Verification */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-['Playfair_Display'] text-[22px] text-gray-900">
                      Physical Verification Pending
                    </h3>
                    <button className="text-[10px] font-bold tracking-[0.15em] text-[#8e6b10] hover:text-[#0B132B] uppercase transition-colors">
                      View All Exceptions
                    </button>
                  </div>

                  <div className="space-y-4">
                    {overdueBorrows.length > 0 ? overdueBorrows.map((ob) => {
                      const daysLate = Math.floor((new Date() - new Date(ob.dueDate)) / (1000*60*60*24));
                      return (
                        <div key={ob._id} className="bg-[#EAE8DD]/80 rounded p-6 border border-[#E0DED5] flex items-start shadow-sm hover:bg-[#EAE8DD] transition-colors">
                          <div className="w-[72px] h-[100px] bg-[#14213d] shrink-0 mr-6 shadow-md border border-[#1A2A4D] overflow-hidden flex items-center justify-center relative">
                            {ob.book?.coverImage?.url
                              ? <img src={ob.book.coverImage.url} alt="cover" className="w-full h-full object-cover" />
                              : <span className="text-[6px] text-white font-serif uppercase tracking-widest leading-tight text-center z-10 px-1">{ob.book?.title}</span>
                            }
                          </div>
                          <div className="flex-1">
                            <div className="mb-2.5">
                              <span className="bg-[#F4D3D3]/80 text-[#D26E4B] text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                                {daysLate} {daysLate === 1 ? 'Day' : 'Days'} Late
                              </span>
                            </div>
                            <h4 className="font-['Playfair_Display'] text-[18px] text-gray-900 leading-tight mb-1.5">{ob.book?.title}</h4>
                            <p className="text-[11px] text-gray-500 font-medium">
                              Lent to: {ob.user?.name} • Due {new Date(ob.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                          <button className="bg-[#FDFCF8] hover:bg-white border border-[#D5D3CA] text-[#8e6b10] text-[9px] font-bold tracking-widest uppercase px-5 py-3 rounded shadow-sm transition-colors flex items-center mt-6">
                            <span className="mr-2">➤</span> Send Notification
                          </button>
                        </div>
                      );
                    }) : (
                      <div className="bg-[#EAE8DD]/80 rounded p-8 border border-[#E0DED5] text-center">
                        <p className="text-green-700 font-bold text-sm">✓ No overdue items! All loans are current.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Recent Transactions */}
                <div className="w-full xl:w-[380px] shrink-0 bg-[#F5F4F0] rounded-xl border border-[#EAE8DD] shadow-sm flex flex-col overflow-hidden">
                  <div className="p-8 pb-4">
                    <h3 className="font-['Playfair_Display'] text-[20px] text-gray-900 mb-6">
                      Recent Transactions
                    </h3>

                    <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
                      {borrows.slice(0, 6).map(br => (
                        <div key={br._id} className="flex items-start">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mr-4 font-bold text-lg shadow-sm ${
                            br.status === 'Returned'
                              ? 'bg-[#F5D77D] text-[#8e6b10] border border-[#E9C86A]'
                              : 'bg-[#0B132B] text-white'
                          }`}>
                            {br.status === 'Returned' ? '↵' : '↳'}
                          </div>
                          <div className="pt-0.5">
                            <p className="font-bold text-[13px] text-gray-900 mb-1">
                              {br.status === 'Returned' ? 'Return' : 'Loan'}: {br.book?.title?.substring(0, 22) || 'Unknown Book'}{br.book?.title?.length > 22 ? '…' : ''}
                            </p>
                            <p className="text-[10px] text-[#6A81A4] leading-tight">
                              {br.user?.name || 'Member'} • {new Date(br.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {borrows.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-4">No transactions yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto p-6 bg-[#EBE9DF]/60 border-t border-[#EAE8DD] flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-widest text-[#6A81A4] uppercase">
                      Today: {borrows.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length} records
                    </span>
                    <button onClick={() => setShowAddModal(true)} className="bg-[#8e6b10] hover:bg-[#7a5c0d] text-white font-bold text-[10px] tracking-widest uppercase px-6 py-3 rounded shadow-sm transition-colors flex items-center">
                      <span className="mr-2 leading-none text-xl font-light mb-0.5">+</span>{" "}
                      New Entry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- FEES & FINES TAB ---------------- */}
          {activeTab === "Fines" && (() => {
            // Build full member registry with fine data
            const allMemberRows = memberUsers.map(member => {
              const mb = borrows.filter(b => b.user?._id === member._id || b.user === member._id);
              const activeLoans = mb.filter(b => b.status === "Borrowed" || b.status === "Requested" || b.status === "Return Requested");
              const overdueLoans = activeLoans.filter(b => new Date(b.dueDate) < new Date());
              const currentFine = overdueLoans.reduce((s, b) => s + calcFine(b.dueDate), 0);
              const collectedFines = mb.reduce((s, b) => s + (b.fine || 0), 0);
              const totalBorrows = mb.length;
              const maxDaysLate = overdueLoans.length > 0
                ? Math.max(...overdueLoans.map(b => {
                    const diff = Math.floor((Date.now() - new Date(b.dueDate)) / 86400000);
                    return diff > 0 ? diff : 0;
                  }))
                : 0;
              return { member, activeLoans, overdueLoans, currentFine, collectedFines, totalBorrows, maxDaysLate };
            });

            const totalOutstanding = allMemberRows.reduce((s, r) => s + r.currentFine, 0);
            const totalCollected = borrows.reduce((s, b) => s + (b.fine || 0), 0);
            const overdueCount = borrows.filter(b => b.status === 'Borrowed' && new Date(b.dueDate) < new Date()).length;
            const membersWithFines = allMemberRows.filter(r => r.currentFine > 0 || r.collectedFines > 0).length;
            const membersClear = allMemberRows.filter(r => r.currentFine === 0 && r.collectedFines === 0).length;

            // Filter + search
            const fineFilter = finesViewFilter || 'all';
            const fineSearch = finesSearch || '';
            const filteredRows = allMemberRows
              .filter(r => {
                if (fineFilter === 'fines') return r.currentFine > 0 || r.collectedFines > 0;
                if (fineFilter === 'clear') return r.currentFine === 0 && r.overdueLoans.length === 0;
                return true;
              })
              .filter(r => !fineSearch || r.member.name.toLowerCase().includes(fineSearch.toLowerCase()) || r.member.email.toLowerCase().includes(fineSearch.toLowerCase()))
              .sort((a, b) => b.currentFine - a.currentFine || b.collectedFines - a.collectedFines);

            return (
              <div className="max-w-6xl pb-16">
                {/* Header */}
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h1 className="font-['Playfair_Display'] text-[42px] text-[#0B132B] leading-tight">Fees & Fines</h1>
                    <p className="text-[14px] text-[#6A81A4] mt-1">
                      Complete member financial registry · ₹1 per day after due date · {memberUsers.length} members tracked
                    </p>
                  </div>
                  <button onClick={handleExportLedger} className="flex items-center bg-[#EBE9DF] border border-[#D5D3CA] hover:bg-[#E0DED5] text-[#0B132B] text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded transition-colors shadow-sm">
                    <Download size={13} className="mr-2" /> Export Ledger
                  </button>
                </div>

                {/* KPI Row — 4 cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
                  <div className="bg-[#0B132B] rounded-xl p-6 text-white shadow-lg border border-[#1A2542]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Total Outstanding</p>
                    <h3 className="font-serif text-4xl text-[#D2A450] leading-none mb-2">₹{totalOutstanding}</h3>
                    <p className="text-[10px] text-gray-400">{overdueCount} overdue loan{overdueCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-[#EBE9DF]/80 rounded-xl p-6 shadow-sm border border-[#E0DED5]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-4">Total Collected</p>
                    <h3 className="font-serif text-4xl text-[#2E9C7E] leading-none mb-2">₹{totalCollected}</h3>
                    <p className="text-[10px] text-[#6A81A4]">{borrows.filter(b => (b.fine || 0) > 0).length} penalised returns</p>
                  </div>
                  <div className="bg-[#EBE9DF]/80 rounded-xl p-6 shadow-sm border border-[#E0DED5]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-4">Members with Fines</p>
                    <h3 className="font-serif text-4xl text-[#D26E4B] leading-none mb-2">{membersWithFines}</h3>
                    <p className="text-[10px] text-[#6A81A4]">of {memberUsers.length} total members</p>
                  </div>
                  <div className="bg-[#EBE9DF]/80 rounded-xl p-6 shadow-sm border border-[#E0DED5]">
                    <p className="text-[9px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-4">Clear Accounts</p>
                    <h3 className="font-serif text-4xl text-[#2E9C7E] leading-none mb-2">{membersClear}</h3>
                    <p className="text-[10px] text-[#6A81A4]">no outstanding fines</p>
                  </div>
                </div>

                {/* Table: Filter tabs + Search */}
                <div className="bg-white rounded-xl border border-[#E0DED5] shadow-sm overflow-hidden mb-8">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#E0DED5] bg-[#F5F4F0] flex-wrap gap-3">
                    {/* Filter tabs */}
                    <div className="flex space-x-1 bg-white border border-[#E0DED5] rounded-lg p-1">
                      {[
                        { key: 'all', label: 'All Members', count: allMemberRows.length },
                        { key: 'fines', label: 'With Fines', count: membersWithFines },
                        { key: 'clear', label: 'Clear', count: membersClear },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setFinesViewFilter(tab.key)}
                          className={`px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center space-x-1.5 ${
                            fineFilter === tab.key ? 'bg-[#0B132B] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            fineFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>{tab.count}</span>
                        </button>
                      ))}
                    </div>
                    {/* Search */}
                    <div className="flex items-center bg-white border border-[#E0DED5] rounded px-3 py-2 shadow-inner w-56">
                      <Search size={12} className="text-gray-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search member..."
                        value={fineSearch}
                        onChange={e => setFinesSearch(e.target.value)}
                        className="text-xs bg-transparent outline-none w-full placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[#F5F4F0] border-b border-[#E0DED5]">
                      <tr>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-6">Member</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-6">Loans</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-6">Overdue Books</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Days Late</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Fine Amount</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4">Collected</th>
                        <th className="text-[9px] font-bold tracking-widest text-gray-500 uppercase py-4 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0EEE8]">
                      {filteredRows.length > 0 ? filteredRows.map(({ member, activeLoans, overdueLoans, currentFine, collectedFines, totalBorrows, maxDaysLate }) => (
                        <tr key={member._id} className="hover:bg-[#FDFCF8] transition-colors group">

                          {/* Member */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=0B132B&color=F2D06B&bold=true&size=36`}
                                alt={member.name}
                                className="w-9 h-9 rounded-full mr-3 shrink-0 border border-gray-200"
                              />
                              <div>
                                <p className="font-bold text-[13px] text-gray-900 leading-tight">{member.name}</p>
                                <p className="text-[9px] text-gray-400 truncate max-w-[160px]">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Loan counts */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-gray-400">Total:</span>
                                <span className="font-bold text-[12px] text-gray-900">{totalBorrows}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] text-gray-400">Active:</span>
                                <span className={`font-bold text-[12px] ${activeLoans.length > 0 ? 'text-[#A67E14]' : 'text-gray-400'}`}>{activeLoans.length}</span>
                              </div>
                            </div>
                          </td>

                          {/* Overdue books */}
                          <td className="px-6 py-4">
                            {overdueLoans.length > 0 ? (
                              <div className="space-y-1">
                                {overdueLoans.slice(0, 2).map(b => (
                                  <div key={b._id} className="flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D26E4B] mr-2 shrink-0"></span>
                                    <span className="text-[11px] text-gray-700 truncate max-w-[140px]">{b.book?.title || 'Unknown'}</span>
                                  </div>
                                ))}
                                {overdueLoans.length > 2 && (
                                  <span className="text-[10px] text-gray-400 italic ml-3">+{overdueLoans.length - 2} more</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[#2E9C7E] font-bold flex items-center">
                                <span className="mr-1">✓</span> Clear
                              </span>
                            )}
                          </td>

                          {/* Days Late */}
                          <td className="px-4 py-4">
                            {maxDaysLate > 0 ? (
                              <span className="text-[11px] font-bold text-[#D26E4B] bg-[#F4D3D3]/60 px-2 py-1 rounded whitespace-nowrap">{maxDaysLate}d</span>
                            ) : (
                              <span className="text-gray-300 text-[11px]">—</span>
                            )}
                          </td>

                          {/* Fine Amount (current accruing) */}
                          <td className="px-4 py-4">
                            {currentFine > 0 ? (
                              <div>
                                <span className="font-bold text-[15px] text-[#D26E4B]">₹{currentFine}</span>
                                <span className="text-[9px] text-gray-400 block">accruing</span>
                              </div>
                            ) : (
                              <span className="font-bold text-[13px] text-[#2E9C7E]">₹0</span>
                            )}
                          </td>

                          {/* Collected (paid fines from returns) */}
                          <td className="px-4 py-4">
                            {collectedFines > 0 ? (
                              <div>
                                <span className="font-bold text-[14px] text-[#2E9C7E]">₹{collectedFines}</span>
                                <span className="text-[9px] text-gray-400 block">paid</span>
                              </div>
                            ) : (
                              <span className="text-gray-300 text-[13px]">₹0</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="px-4 py-4 text-right">
                            {currentFine > 0 ? (
                              <button
                                onClick={() => setSettlementTarget({ member, amount: currentFine, borrows: overdueLoans })}
                                className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[9px] font-bold tracking-widest uppercase px-4 py-2 rounded shadow-sm transition-colors flex items-center ml-auto whitespace-nowrap"
                              >
                                <IndianRupee size={11} className="mr-1" /> Settle
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-[#2E9C7E] bg-[#E8F5E9] px-3 py-1.5 rounded uppercase tracking-widest">Clear</span>
                            )}
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center">
                            <p className="text-[#2E9C7E] font-bold text-sm">✓ No members match this filter.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {/* Table Footer summary */}
                  <div className="px-6 py-3 bg-[#F5F4F0] border-t border-[#E0DED5] flex items-center justify-between">
                    <p className="text-[11px] text-gray-500">
                      Showing {filteredRows.length} of {memberUsers.length} members
                    </p>
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#D26E4B]"></div>
                        <span className="text-[10px] text-gray-500">Outstanding: <strong className="text-gray-900">₹{totalOutstanding}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#2E9C7E]"></div>
                        <span className="text-[10px] text-gray-500">Collected: <strong className="text-gray-900">₹{totalCollected}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Fines Collected */}
                <div className="bg-[#F5F4F0] rounded-xl border border-[#E0DED5] p-6">
                  <h3 className="font-['Playfair_Display'] font-bold text-[18px] text-gray-900 mb-5">Recent Fines Collected</h3>
                  <div className="space-y-3">
                    {borrows.filter(b => (b.fine || 0) > 0).slice(0, 8).map(b => (
                      <div key={b._id} className="flex items-center justify-between bg-white rounded-lg px-5 py-3 border border-[#E0DED5] shadow-sm">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E9C7E] flex items-center justify-center mr-4 text-sm font-bold shrink-0">✓</div>
                          <div>
                            <p className="font-bold text-[13px] text-gray-900">{b.book?.title || 'Book'}</p>
                            <p className="text-[10px] text-gray-500">{b.user?.name} · Returned {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '—'}</p>
                          </div>
                        </div>
                        <span className="font-bold text-[15px] text-[#2E9C7E] font-mono">₹{b.fine}.00</span>
                      </div>
                    ))}
                    {borrows.filter(b => (b.fine || 0) > 0).length === 0 && (
                      <p className="text-sm text-gray-400 italic text-center py-4">No fines collected yet.</p>
                    )}
                  </div>{/* end space-y-3 */}
                </div>
              </div>
            );
            // end Fees & Fines content wrapper
          })()}

          {/* ---------------- INVENTORY TAB ---------------- */}
          {activeTab === "Inventory" && (() => {
            const filteredBooks = books.filter(b => {
              const matchesSearch = b.title.toLowerCase().includes(inventorySearch.toLowerCase()) || 
                                   b.author.toLowerCase().includes(inventorySearch.toLowerCase()) ||
                                   b.isbn?.includes(inventorySearch);
              const matchesGenre  = inventoryGenreFilter === 'All' || b.genre === inventoryGenreFilter;
              const matchesStatus = inventoryStatusFilter === 'All' || 
                                   (inventoryStatusFilter === 'Available' && b.availableCopies > 0) ||
                                   (inventoryStatusFilter === 'Out of Stock' && b.availableCopies === 0);
              return matchesSearch && matchesGenre && matchesStatus;
            });

            return (
              <div className="max-w-[1400px] relative pb-20">
                {/* Header Area */}
                <div className="flex justify-between items-start mb-8">
                  <div className="max-w-xl">
                    <h1 className="font-['Playfair_Display'] text-[46px] text-[#0B132B] leading-tight mb-2">Manuscript Inventory</h1>
                    <p className="text-[15px] text-[#4A4E4D] font-light leading-relaxed">
                      Comprehensive oversight of the Modern Library's physical and digital assets.<br />
                      Click any row to view full details.
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0B132B] transition-colors" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search title, author, isbn..."
                        value={inventorySearch}
                        onChange={(e) => setInventorySearch(e.target.value)}
                        className="pl-11 pr-6 py-3.5 bg-white border border-[#D5D3CA] rounded-lg text-[13px] w-72 focus:outline-none focus:ring-2 focus:ring-[#0B132B]/5 focus:border-[#0B132B] transition-all shadow-sm"
                      />
                    </div>
                    
                    {/* Filter Dropdown */}
                    <div className="relative group">
                      <button className="bg-[#FDFCF8] border border-[#D5D3CA] hover:bg-[#F2F0E6] text-gray-800 font-bold text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-lg text-center shadow-sm flex items-center leading-tight transition-colors">
                        <Filter size={14} className="mr-3 opacity-70" />
                        Status: {inventoryStatusFilter}
                      </button>
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E8E6DF] shadow-xl rounded-lg overflow-hidden hidden group-hover:block z-50">
                        {['All', 'Available', 'Out of Stock'].map(st => (
                          <button key={st} onClick={() => setInventoryStatusFilter(st)} className="w-full text-left px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-600 hover:bg-[#FAF9F5] hover:text-[#0B132B] transition-colors">{st}</button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={handleExportCatalog}
                      className="bg-[#0B132B] hover:bg-[#1a233a] text-white font-bold text-[10px] uppercase tracking-widest px-8 py-3.5 rounded-lg text-center shadow-lg flex items-center leading-tight transition-all"
                    >
                      <Download size={14} className="mr-3" /> Export Catalog
                    </button>
                  </div>
                </div>

                {/* Main content area: table + detail panel */}
                <div className="flex gap-6">
                  {/* Main Table */}
                  <div className={`${selectedBook ? 'flex-1 min-w-0' : 'w-full'} transition-all duration-300`}>
                  <div className="bg-white rounded-xl border border-[#D5D3CA] shadow-sm mb-6 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#FAF9F5] border-b border-[#D5D3CA]/60">
                        <tr>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6">Book Title & Author</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6 shrink-0">ISBN-13</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6">Genre</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6">Status</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6">Copies</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6">Last Updated</th>
                          <th className="font-semibold text-[10px] uppercase tracking-[0.15em] text-[#4A4E4D] py-5 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D5D3CA]/30">
                        {filteredBooks.length > 0 ? (
                          filteredBooks.map((book) => {
                          const isAvail = book.availableCopies > 0;
                          const isSelected = selectedBook?._id === book._id;
                          return (
                            <tr
                              key={book._id}
                              onClick={() => setSelectedBook(isSelected ? null : book)}
                              className={`cursor-pointer transition-colors ${isSelected ? 'bg-[#0B132B]/5 border-l-4 border-[#0B132B]' : 'hover:bg-[#F2F0E6]'}`}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="w-9 h-12 bg-gray-200 shrink-0 mr-4 shadow-sm border border-gray-300 overflow-hidden rounded-sm">
                                    {book.coverImage?.url ? (
                                      <img src={book.coverImage.url} alt="Cover" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-[#1A2542] flex items-center justify-center">
                                        <span className="text-[4px] text-white opacity-50 px-1 text-center">{book.title?.substring(0, 15)}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-['Playfair_Display'] font-bold text-[15px] text-gray-900 leading-tight mb-0.5 max-w-[180px] truncate">{book.title}</h4>
                                    <p className="text-[11px] text-[#6A81A4]">{book.author}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-[10px] text-gray-600 tracking-wider">
                                  {book.isbn ? `${book.isbn.substring(0,3)}-${book.isbn.substring(3,4)}-${book.isbn.substring(4,6)}-${book.isbn.substring(6,12)}-${book.isbn.substring(12,13)}` : '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="bg-[#E9D698]/60 text-[#8e6b10] text-[8px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 rounded-full whitespace-nowrap">
                                  {book.genre || 'NON-FICTION'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <span className={`w-2 h-2 rounded-full mr-2.5 ${isAvail ? 'bg-[#2E9C7E]' : 'bg-[#D2A450]'}`}></span>
                                  <span className={`text-[12px] font-bold ${isAvail ? 'text-[#1d6b55]' : 'text-[#a46d1b]'}`}>
                                    {isAvail ? 'Available' : 'Borrowed'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="text-[11px] text-gray-600">
                                    <span className="font-bold">{book.availableCopies}</span>
                                    <span className="text-gray-400"> / {book.totalCopies}</span>
                                  </div>
                                  {reservations.filter(r => (r.book?._id === book._id || r.book === book._id) && r.status === 'Pending').length > 0 && (
                                    <div className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wider">
                                      {reservations.filter(r => (r.book?._id === book._id || r.book === book._id) && r.status === 'Pending').length} Reserved
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-[11px] text-[#6A81A4]">
                                {book.updatedAt ? new Date(book.updatedAt).toLocaleDateString() : '—'}
                              </td>
                              <td className="px-6 py-4 text-right w-44">
                                <div className="flex justify-end space-x-2">
                                  {book.availableCopies > 0 && (
                                    <button
                                      onClick={(e) => openInventoryIssue(book, e)}
                                      className="h-8 px-3 rounded bg-[#0B132B] hover:bg-[#1a233a] text-white text-[9px] font-bold tracking-widest uppercase flex items-center transition-colors shadow-sm whitespace-nowrap"
                                      title="Issue to member"
                                    >
                                      <ArrowUpRight size={12} className="mr-1" />Issue
                                    </button>
                                  )}
                                  <button
                                    onClick={(e) => openEditModal(book, e)}
                                    className="w-8 h-8 rounded bg-[#F2F0E6] hover:bg-[#E9D698] text-[#8e6b10] flex items-center justify-center transition-colors shadow-sm"
                                    title="Edit book"
                                  >
                                    <FileText size={14} />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteBook(book._id); }}
                                    className="w-8 h-8 rounded bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors shadow-sm"
                                    title="Delete book"
                                  >
                                    <span className="text-sm">🗑</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-500 italic text-sm">
                            No books match the current filter.
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Book Detail Side Panel */}
                {selectedBook && (
                  <div className="w-[380px] shrink-0 bg-white border border-[#D5D3CA] rounded-xl shadow-2xl overflow-hidden flex flex-col h-full sticky top-0 animate-in slide-in-from-right duration-300">
                    {/* Cover */}
                    <div className="relative bg-[#0B132B] h-60 flex items-center justify-center shrink-0 group">
                      {selectedBook.coverImage?.url ? (
                        <img src={selectedBook.coverImage.url} alt="cover" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <div className="w-24 h-36 bg-[#1A2542] border-l-4 border-[#D2A450] flex items-center justify-center rounded shadow-xl">
                          <span className="text-[9px] text-[#D2A450] font-bold text-center px-2 uppercase tracking-tighter opacity-70 leading-tight">{selectedBook.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-linear-to-t from-[#0B132B] to-transparent pointer-events-none"></div>
                      <button 
                        onClick={() => setSelectedBook(null)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all backdrop-blur-md z-10 hover:scale-110 active:scale-95"
                      >✕</button>
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-[10px] font-bold tracking-[0.3em] text-[#D2A450] uppercase mb-1.5">{selectedBook.genre || 'Collection'}</p>
                        <h3 className="font-['Playfair_Display'] text-white text-2xl font-bold leading-tight balance">{selectedBook.title}</h3>
                        <p className="text-[13px] text-gray-400 mt-1 font-light italic">{selectedBook.author}</p>
                      </div>
                    </div>

                    {/* Details Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                      {/* Stock Summary */}
                      <div className="bg-[#FAF9F5] rounded-xl p-5 border border-[#EBE9DF]/80 shadow-inner">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Archive Status</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${selectedBook.availableCopies > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {selectedBook.availableCopies > 0 ? '✔️ In Catalog' : '🔍 Searching'}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                           <div>
                             <p className="font-serif text-3xl font-bold text-[#0B132B] leading-none mb-1">{selectedBook.availableCopies}</p>
                             <p className="text-[10px] text-gray-400 uppercase tracking-widest">Available</p>
                           </div>
                           <div className="text-right">
                             <p className="font-serif text-lg font-bold text-gray-600 leading-none mb-1">/ {selectedBook.totalCopies}</p>
                             <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total Copies</p>
                           </div>
                        </div>
                        <div className="w-full bg-[#EBE9DF] rounded-full h-1.5 mb-1 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ease-out ${selectedBook.availableCopies > (selectedBook.totalCopies / 2) ? 'bg-[#2E9C7E]' : 'bg-[#D2A450]'}`}
                            style={{ width: selectedBook.totalCopies > 0 ? `${(selectedBook.availableCopies / selectedBook.totalCopies) * 100}%` : '0%' }}
                          ></div>
                        </div>
                      </div>

                      {/* Metadata Grid */}
                      <div className="space-y-4">
                         {[
                           { label: 'ISBN-13', value: selectedBook.isbn || 'N/A' },
                           { label: 'Shelf Life', value: `${selectedBook.publishedYear || '—'} Edition` },
                           { label: 'Market Value', value: selectedBook.price ? `₹${selectedBook.price}` : '—' },
                           { label: 'Asset ID', value: selectedBook._id.substring(selectedBook._id.length - 8).toUpperCase() },
                         ].map(({ label, value }) => (
                           <div key={label} className="flex justify-between items-center py-1 border-b border-[#F5F4F0] last:border-0">
                             <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{label}</span>
                             <span className="text-[12px] font-medium text-[#0B132B]">{value}</span>
                           </div>
                         ))}
                      </div>

                      {/* Active Borrowers or History snippet */}
                      <div className="space-y-3 pt-2">
                         <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase flex items-center">
                           <ArrowLeftRight size={12} className="mr-2" /> Recent Activity
                         </p>
                         <div className="bg-white border border-[#EBE9DF] rounded-lg p-4 text-center">
                            <p className="text-[11px] text-gray-500 font-serif italic mb-1">
                              {borrows.filter(b => (b.book?._id === selectedBook._id || b.book === selectedBook._id)).length} loan transactions documented.
                            </p>
                            <p className="text-[10px] text-gray-400">Inventory last audited {selectedBook.updatedAt ? new Date(selectedBook.updatedAt).toLocaleDateString() : 'recently'}.</p>
                         </div>
                      </div>
                    </div>

                    {/* Side Panel Footer Actions */}
                    <div className="p-4 border-t border-[#D5D3CA] bg-[#FAF9F5] flex space-x-3 shrink-0">
                      <button
                        onClick={(e) => openEditModal(selectedBook, e)}
                        className="flex-1 h-11 bg-white border border-[#D5D3CA] hover:bg-[#F2F0E6] text-[#0B132B] text-[10px] font-bold tracking-[0.2em] uppercase rounded-lg transition-all shadow-sm flex items-center justify-center group"
                      >
                        <FileText size={15} className="mr-2 opacity-50 group-hover:opacity-100" /> Edit Metadata
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteBook(selectedBook._id); }}
                        className="w-11 h-11 bg-[#FFF5F5] hover:bg-red-100 text-red-500 border border-red-50 rounded-lg transition-all flex items-center justify-center hover:scale-95 active:scale-90"
                        title="Purge from Archive"
                      >
                        <span className="text-xl">🗑</span>
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            );
          })()}

          {/* ---------------- SETTINGS TAB ---------------- */}
          {activeTab === "Settings" && (
            <div className="max-w-4xl mx-auto space-y-8 pb-16">
               <h2 className="font-['Playfair_Display'] text-[42px] font-bold mb-6 text-[#0B132B]">System Configuration</h2>
               
               <div className="bg-white rounded-xl border border-[#D5D3CA] shadow-sm p-8 space-y-8">
                  <div>
                      <h4 className="text-[10px] font-bold tracking-widest text-[#6A81A4] uppercase mb-4">Librarian Access</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Full Name</label>
                            <input type="text" readOnly value={user?.name || ""} className="w-full bg-[#FAF9F5] border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">Administrator Email</label>
                            <input type="email" readOnly value={user?.email || ""} className="w-full bg-[#FAF9F5] border border-gray-200 rounded-md py-2 px-3 text-sm text-gray-700" />
                         </div>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-[#E8E6DF]">
                      <h4 className="text-[10px] font-bold tracking-widest text-[#6A81A4] uppercase mb-4">Library Preferences</h4>
                      <div className="space-y-4">
                         <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0B132B] border-gray-300 rounded focus:ring-[#0B132B]" />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Enable fine calculation automations</span>
                         </label>
                         <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-[#0B132B] border-gray-300 rounded focus:ring-[#0B132B]" />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Allow members to request physical items</span>
                         </label>
                         <label className="flex items-center cursor-pointer group">
                            <input type="checkbox" className="w-4 h-4 text-[#0B132B] border-gray-300 rounded focus:ring-[#0B132B]" />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">Send daily digest of circulation logs</span>
                         </label>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-[#E8E6DF] flex justify-end">
                      <button onClick={handleLogout} className="mr-4 text-red-500 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors shadow-sm bg-white border border-red-100 flex items-center">
                         <LogOut size={14} className="mr-2" /> Log Out
                      </button>
                      <button className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-[10px] font-bold tracking-widest uppercase px-6 py-3 rounded shadow-sm transition-colors flex items-center">
                         <Settings size={14} className="mr-2" /> Save Environment
                      </button>
                  </div>
               </div>
            </div>
          )}

          {/* ---------------- SUPPORT TAB ---------------- */}
          {activeTab === "Support" && (
            <div className="max-w-4xl mx-auto space-y-8 pb-16">
               <div className="mb-8">
                  <h2 className="font-['Playfair_Display'] text-[42px] font-bold text-[#0B132B] mb-2">Admin Helpdesk</h2>
                  <p className="text-gray-500">Resource center for system administrators and head librarians.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-[#0B132B] text-white rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
                     <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                     <CircleHelp size={48} className="text-[#F2D06B] mb-6 opacity-90" />
                     <h3 className="font-serif text-2xl font-bold mb-3">System Documentation</h3>
                     <p className="text-sm text-gray-400 mb-8 max-w-[250px] leading-relaxed">
                        Access technical manuals, database schemas, and migration guides.
                     </p>
                     <button className="bg-[#F2D06B] text-[#0B132B] hover:bg-white transition-colors text-[10px] font-bold uppercase tracking-widest px-8 py-3 rounded shadow-md">
                        Read Docs
                     </button>
                  </div>

                  <div className="bg-white rounded-xl p-8 border border-[#D5D3CA] shadow-sm">
                     <h3 className="font-serif text-xl font-bold mb-6 text-[#0B132B]">Contact IT Support</h3>
                     <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Ticket submitted to IT Support.'); }}>
                        <div>
                           <label className="block text-[10px] font-bold text-[#6A81A4] mb-2 tracking-widest uppercase">Issue Category</label>
                           <select className="w-full bg-[#FAF9F5] border border-[#D5D3CA] rounded py-2.5 px-3 text-sm text-gray-700 outline-none focus:border-[#0B132B]">
                              <option>Database Synchronization</option>
                              <option>Authentication Error</option>
                              <option>Asset Management Module</option>
                              <option>Other technical issue</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-[#6A81A4] mb-2 tracking-widest uppercase">Diagnostic Message</label>
                           <textarea rows="4" className="w-full bg-[#FAF9F5] border border-[#D5D3CA] rounded py-2.5 px-3 text-sm text-gray-700 outline-none focus:border-[#0B132B]" placeholder="Include error logs if applicable..."></textarea>
                        </div>
                        <button type="submit" className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-3.5 rounded transition-colors shadow-sm">
                           Dispatch Ticket
                        </button>
                     </form>
                  </div>
               </div>
            </div>
          )}

          {/* ---------------- PROFILE TAB ---------------- */}
          {activeTab === "Profile" && (
            <div className="max-w-4xl mx-auto space-y-10 pb-16 animate-in fade-in duration-500">
              <div className="text-center">
                 <div className="inline-block relative">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0B132B&color=F2D06B&bold=true&size=128`}
                      alt="Avatar"
                      className="w-32 h-32 rounded-2xl border-4 border-white shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-[#0B132B] text-[#F2D06B] p-2 rounded-lg shadow-lg">
                       <LayoutDashboard size={20} />
                    </div>
                 </div>
                 <h2 className="font-['Playfair_Display'] text-[42px] font-bold mt-6 text-[#0B132B] leading-tight">{user.name}</h2>
                 <p className="text-[#6A81A4] font-medium tracking-[0.1em] uppercase text-[10px]">{user.role} Authority • Staff ID: {user._id.substring(0,8).toUpperCase()}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white rounded-xl border border-[#D5D3CA] shadow-sm p-8 hover:shadow-md transition-shadow">
                    <h3 className="font-['Playfair_Display'] text-xl font-bold mb-6 text-[#0B132B]">Archive Credentials</h3>
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Registered Email</p>
                          <p className="text-gray-900 font-medium text-[15px]">{user.email}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Access Authorization</p>
                          <p className="text-[#8e6b10] font-bold flex items-center text-[13px]">
                             <span className="w-2 h-2 rounded-full bg-[#8e6b10] mr-2"></span>
                             Elite Curator System Access
                          </p>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tenure Commenced</p>
                          <p className="text-gray-900 font-medium text-[14px]">{new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-[#FAF9F5] rounded-xl border border-[#D5D3CA] shadow-sm p-8 hover:shadow-md transition-shadow">
                    <h3 className="font-['Playfair_Display'] text-xl font-bold mb-6 text-[#0B132B]">Security Matrix</h3>
                    <div className="space-y-7">
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-[13px] font-bold text-gray-900">Two-Factor Authentication</p>
                             <p className="text-[10px] text-gray-400 mt-0.5">Secure your curator session</p>
                          </div>
                          <div className="w-11 h-6 bg-[#0B132B]/10 rounded-full relative p-1 cursor-not-allowed">
                             <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div>
                             <p className="text-[13px] font-bold text-gray-900">Session Integrity</p>
                             <p className="text-[10px] text-gray-400 mt-0.5">Active encryption on this terminal</p>
                          </div>
                          <span className="text-[9px] font-bold text-[#2E9C7E] uppercase bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#2E9C7E]/20">Active</span>
                       </div>
                       <button className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-lg shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]" onClick={() => alert('Password reset module is currently restricted.')}>
                          Revise Access Password
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Bottom Stats Row (Hidden on Settings, Support & Profile pages) */}
          {!['Settings', 'Support', 'Profile'].includes(activeTab) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-[#F2F0E6] rounded-xl p-6 shadow-sm border border-[#E0DED5] relative overflow-hidden h-32">
                <div className="absolute -right-4 -bottom-6 text-8xl opacity-10 leading-none pointer-events-none">📚</div>
                <p className="text-[8px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-1">Total Titles</p>
                <h3 className="font-serif text-[32px] text-gray-900 leading-none mb-2">{books.length.toLocaleString()}</h3>
                <p className="text-[10px] font-bold tracking-widest text-[#2E9C7E]">{totalBooks.toLocaleString()} total copies</p>
              </div>

              <div className="bg-[#F2F0E6] rounded-xl p-6 shadow-sm border border-[#E0DED5] relative overflow-hidden h-32">
                <div className="absolute right-2 top-4 bottom-4 w-12 flex flex-col justify-between items-center opacity-10 pointer-events-none">
                  <span className="text-3xl font-bold font-sans rotate-180">↑</span>
                  <span className="text-3xl font-bold font-sans">↓</span>
                </div>
                <p className="text-[8px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-1">In Circulation</p>
                <h3 className="font-serif text-[32px] text-gray-900 leading-none mb-2">{activeBorrows.length}</h3>
                <p className="text-[10px] font-bold tracking-widest text-[#997B28]">
                  {totalBooks > 0 ? Math.round((activeBorrows.length / totalBooks) * 100) : 0}% of total stock
                </p>
              </div>

              <div className="bg-[#F2F0E6] rounded-xl p-6 shadow-sm border border-[#E0DED5] relative overflow-hidden h-32">
                <div className="absolute right-0 -bottom-8 text-9xl opacity-10 leading-none pointer-events-none text-gray-900 font-serif">👥</div>
                <p className="text-[8px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-1">Registered Members</p>
                <h3 className="font-serif text-[32px] text-gray-900 leading-none mb-2">{memberUsers.length}</h3>
                <p className="text-[10px] font-bold tracking-widest text-[#4A64A2]">{members.length - memberUsers.length} staff accounts</p>
              </div>

              <div className="bg-[#F2F0E6] rounded-xl p-6 shadow-sm border border-[#E0DED5] relative overflow-hidden h-32">
                <div className="absolute -right-4 -bottom-4 text-[100px] opacity-10 leading-none pointer-events-none text-gray-900">☑</div>
                <p className="text-[8px] font-bold tracking-[0.2em] text-[#6A81A4] uppercase mb-1">Returned Books</p>
                <h3 className="font-serif text-[32px] text-gray-900 leading-none mb-2">{borrows.filter(b => b.status === 'Returned').length}</h3>
                <p className="text-[10px] font-bold tracking-widest text-[#1d6b55]">{overdueBorrows.length > 0 ? `${overdueBorrows.length} overdue` : 'All on time ✓'}</p>
              </div>
            </div>
          )}

          {/* Edit Book Modal */}
          {showEditModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#FDFCF8] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EAE8DD]">
                <div className="p-8 border-b border-[#EAE8DD] flex justify-between items-center bg-[#F5F4F0] sticky top-0 z-10">
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0B132B]">Edit Book Record</h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleEditBook} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: 'Title', key: 'title', type: 'text', placeholder: 'Book title' },
                      { label: 'Author', key: 'author', type: 'text', placeholder: 'Author name' },
                      { label: 'ISBN', key: 'isbn', type: 'text', placeholder: '978-0140275360' },
                      { label: 'Published Year', key: 'publishedYear', type: 'number', placeholder: '1998' },
                      { label: 'Total Copies', key: 'totalCopies', type: 'number', placeholder: '5' },
                      { label: 'Price (₹)', key: 'price', type: 'number', placeholder: '350' },
                    ].map(({ label, key, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">{label}</label>
                        <input
                          value={editBook[key]}
                          onChange={e => setEditBook({ ...editBook, [key]: e.target.value })}
                          type={type}
                          placeholder={placeholder}
                          className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Genre</label>
                      <select value={editBook.genre} onChange={e => setEditBook({ ...editBook, genre: e.target.value })} className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white">
                        <option value="">Select Genre</option>
                        {['Fiction','Non-Fiction','Science','History','Philosophy','Classics','Academic Journals','Rare Manuscripts','Classical Literature','Historical Records','Periodicals','Poetry'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Replace Cover Image (optional)</label>
                    <input
                      type="file"
                      onChange={e => setEditCoverFile(e.target.files[0])}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EBE9DF] file:text-[#8c6b22] hover:file:bg-[#E0DED5] cursor-pointer"
                    />
                  </div>
                  <div className="pt-6 border-t border-[#EAE8DD] flex justify-end">
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 mr-4 hover:bg-gray-100 transition-colors uppercase tracking-widest">Cancel</button>
                    <button disabled={isEditing} type="submit" className="bg-[#0B132B] hover:bg-[#1a233a] disabled:bg-gray-400 text-white px-8 py-2 rounded text-sm font-bold uppercase tracking-widest transition-colors flex items-center shadow-lg">
                      {isEditing ? <span className="animate-pulse">Saving...</span> : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Member Modal */}
          {showAddMemberModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#FDFCF8] rounded-xl shadow-2xl max-w-md w-full border border-[#EAE8DD]">
                <div className="p-8 border-b border-[#EAE8DD] flex justify-between items-center bg-[#F5F4F0] rounded-t-xl">
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0B132B]">Register New Member</h3>
                  <button onClick={() => setShowAddMemberModal(false)} className="text-gray-400 hover:text-gray-900 text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleAddMember} className="p-8 space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Full Name</label>
                    <input required value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} type="text" placeholder="Jane Doe" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Email Address</label>
                    <input required value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} type="email" placeholder="jane@example.com" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Temporary Password</label>
                    <input required value={newMember.password} onChange={e => setNewMember({...newMember, password: e.target.value})} type="password" placeholder="Min 6 characters" minLength={6} className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none" />
                  </div>
                  <p className="text-[10px] text-gray-400">The member will be able to log in immediately using these credentials.</p>
                  <div className="pt-4 border-t border-[#EAE8DD] flex justify-end space-x-3">
                    <button type="button" onClick={() => setShowAddMemberModal(false)} className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors uppercase tracking-widest">Cancel</button>
                    <button disabled={isAddingMember} type="submit" className="bg-[#8e6b10] hover:bg-[#7a5a0c] disabled:bg-gray-400 text-white px-8 py-2 rounded text-sm font-bold uppercase tracking-widest transition-colors shadow-sm">
                      {isAddingMember ? <span className="animate-pulse">Registering...</span> : 'Register Member'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Book Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-[#FDFCF8] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#EAE8DD]">
                <div className="p-8 border-b border-[#EAE8DD] flex justify-between items-center bg-[#F5F4F0] sticky top-0 z-10">
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0B132B]">
                    Add New Document
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-900 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>
                <form onSubmit={handleAddBook} className="p-8 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Title
                      </label>
                      <input
                        required
                        value={newBook.title}
                        onChange={(e) =>
                          setNewBook({ ...newBook, title: e.target.value })
                        }
                        type="text"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="The Iliad"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Author
                      </label>
                      <input
                        required
                        value={newBook.author}
                        onChange={(e) =>
                          setNewBook({ ...newBook, author: e.target.value })
                        }
                        type="text"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="Homer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        ISBN
                      </label>
                      <input
                        required
                        value={newBook.isbn}
                        onChange={(e) =>
                          setNewBook({ ...newBook, isbn: e.target.value })
                        }
                        type="text"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="978-0140275360"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Published Year
                      </label>
                      <input
                        required
                        value={newBook.publishedYear}
                        onChange={(e) =>
                          setNewBook({
                            ...newBook,
                            publishedYear: e.target.value,
                          })
                        }
                        type="number"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="1998"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Genre
                      </label>
                      <select
                        required
                        value={newBook.genre}
                        onChange={(e) =>
                          setNewBook({ ...newBook, genre: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                      >
                        <option value="">Select Genre</option>
                        <option value="Fiction">Fiction</option>
                        <option value="Science">Science</option>
                        <option value="History">History</option>
                        <option value="Philosophy">Philosophy</option>
                        <option value="Classics">Classics</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Total Copies
                      </label>
                      <input
                        required
                        value={newBook.totalCopies}
                        onChange={(e) =>
                          setNewBook({
                            ...newBook,
                            totalCopies: e.target.value,
                          })
                        }
                        type="number"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="5"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                        Price (₹)
                      </label>
                      <input
                        required
                        value={newBook.price}
                        onChange={(e) =>
                          setNewBook({ ...newBook, price: e.target.value })
                        }
                        type="number"
                        className="w-full border border-gray-300 rounded px-4 py-2 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none"
                        placeholder="350"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">
                      Cover Image (Upload)
                    </label>
                    <input
                      required
                      type="file"
                      onChange={(e) => setCoverFile(e.target.files[0])}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#EBE9DF] file:text-[#8c6b22] hover:file:bg-[#E0DED5] transition-colors cursor-pointer"
                    />
                  </div>
                  <div className="pt-6 border-t border-[#EAE8DD] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded text-sm font-bold text-gray-600 mr-4 hover:bg-gray-100 transition-colors uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isAdding}
                      type="submit"
                      className="bg-[#0B132B] hover:bg-[#1a233a] disabled:bg-gray-400 text-white px-8 py-2 rounded text-sm font-bold uppercase tracking-widest transition-colors flex items-center shadow-lg"
                    >
                      {isAdding ? (
                        <span className="animate-pulse">Uploading...</span>
                      ) : (
                        "Save Record"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* ======== FINE SETTLEMENT MODAL ======== */}
        {settlementTarget && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
            <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl max-w-4xl w-full border border-[#EAE8DD] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

              {/* Left: Transaction Summary */}
              <div className="bg-[#0B132B] w-full md:w-5/12 p-10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#D2A450]/10 pointer-events-none"></div>
                <div>
                  <button
                    onClick={() => { setSettlementTarget(null); setSettleSuccess(false); setSettleInput(''); }}
                    className="text-gray-400 hover:text-white text-xs font-bold tracking-widest uppercase mb-8 self-start flex items-center transition-colors"
                  >← Cancel
                  </button>
                  <p className="text-[9px] font-bold tracking-[0.2em] text-[#D2A450] uppercase mb-2">Transaction Summary</p>
                  <h3 className="font-['Playfair_Display'] text-2xl text-white mb-8">Fine Settlement</h3>

                  <div className="space-y-5">
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Member Name</p>
                      <p className="text-white font-bold text-[15px]">{settlementTarget.member.name}</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Transaction Type</p>
                      <p className="text-white font-bold text-[15px]">Fine Settlement</p>
                    </div>
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Overdue Books</p>
                      <div className="space-y-1 mt-1">
                        {settlementTarget.borrows.map(b => (
                          <div key={b._id} className="flex justify-between">
                            <span className="text-[11px] text-gray-300 truncate max-w-[160px]">{b.book?.title || 'Book'}</span>
                            <span className="text-[11px] text-[#D2A450] font-bold ml-2">₹{calcFine(b.dueDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#1A2542]">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-1">Payable Amount</p>
                      <p className="font-serif text-3xl text-[#D2A450] font-bold">₹{settlementTarget.amount}.00</p>
                      <p className="text-[9px] text-gray-500 mt-1">inclusive of processing fees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Payment Form */}
              <div className="w-full md:w-7/12 p-10 flex flex-col justify-center overflow-y-auto">
                {settleSuccess ? (
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-4xl mb-6 shadow-inner">✓</div>
                    <h3 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-3">Payment Confirmed</h3>
                    <p className="text-sm text-gray-500 mb-8 max-w-xs">Fine of ₹{settlementTarget.amount}.00 for {settlementTarget.member.name} has been recorded and cleared.</p>
                    <button
                      onClick={() => { setSettlementTarget(null); setSettleSuccess(false); setSettleInput(''); }}
                      className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded-lg w-full transition-colors"
                    >Close</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-8">
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase mb-1">Secure Gateway</p>
                      <h3 className="font-['Playfair_Display'] text-3xl text-gray-900">Secure Settlement</h3>
                      <p className="text-xs text-gray-500 mt-2">Please finalize the transaction within the security window.</p>
                    </div>

                    {/* Payment method tabs */}
                    <div className="flex space-x-3 mb-8">
                      {['upi', 'card'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSettleMethod(m)}
                          className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase border rounded transition-colors ${settleMethod === m ? 'border-[#0B132B] bg-[#0B132B] text-white' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}
                        >
                          {m === 'upi' ? 'UPI / Mobile' : 'Card Payment'}
                        </button>
                      ))}
                    </div>

                    <form onSubmit={handleSettlement} className="space-y-5">
                      {settleMethod === 'upi' ? (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">UPI ID / VPA</label>
                            <input
                              required
                              type="text"
                              value={settleInput}
                              onChange={e => setSettleInput(e.target.value)}
                              placeholder="username@okbank"
                              className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-transparent font-mono"
                            />
                          </div>
                          <div className="flex space-x-3 mt-2">
                            {['Google Pay', 'PhonePe', 'BHIM'].map(app => (
                              <div key={app} className="flex-1 border border-gray-200 rounded-lg py-2 px-3 flex items-center justify-center text-[10px] font-bold text-gray-600 hover:border-[#0B132B] cursor-pointer transition-colors">
                                {app}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Card Number</label>
                            <input
                              required
                              type="text"
                              maxLength={19}
                              value={settleInput}
                              onChange={e => {
                                const val = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                setSettleInput(val);
                              }}
                              placeholder="0000 0000 0000 0000"
                              className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-transparent font-mono tracking-widest"
                            />
                          </div>
                        </>
                      )}

                      <div className="pt-6">
                        <button
                          type="submit"
                          disabled={settleLoading}
                          className="w-full bg-[#0B132B] hover:bg-[#1a233a] disabled:bg-gray-400 text-white py-4 rounded-lg font-bold tracking-[0.2em] text-[10px] uppercase transition-all flex items-center justify-center shadow-lg"
                        >
                          {settleLoading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          ) : (
                            `Pay ₹${settlementTarget.amount}.00 →`
                          )}
                        </button>
                        <p className="text-center mt-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">🔒 Encrypted Transaction — 256-bit AES</p>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======== ISSUE BOOK MODAL ======== */}
        {showIssueModal && (
          <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
            <div className="bg-[#FDFCF8] rounded-xl shadow-2xl max-w-md w-full border border-[#EAE8DD] overflow-hidden">
               <div className="p-8 border-b border-[#EAE8DD] bg-[#F5F4F0] flex justify-between items-center">
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0B132B]">Issue Book to Member</h3>
                  <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">✕</button>
               </div>
               <form onSubmit={handleIssueBook} className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Select Book</label>
                    <select
                      required
                      value={issueData.bookId}
                      onChange={e => setIssueData({...issueData, bookId: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                    >
                      <option value="">Choose a book...</option>
                      {books.filter(b => b.availableCopies > 0).map(b => (
                        <option key={b._id} value={b._id}>{b.title} ({b.availableCopies} avail)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Select Member</label>
                    <select
                      required
                      value={issueData.userId}
                      onChange={e => setIssueData({...issueData, userId: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                    >
                      <option value="">Choose a member...</option>
                      {memberUsers.map(m => (
                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={issueData.dueDate}
                      onChange={e => setIssueData({...issueData, dueDate: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      disabled={isIssuing}
                      type="submit"
                      className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white py-4 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                      {isIssuing ? "Processing Issue..." : "Confirm & Issue Book"}
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* ======== REGISTER MEMBER MODAL ======== */}
        {showRegModal && (
          <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
            <div className="bg-[#FDFCF8] rounded-xl shadow-2xl max-w-md w-full border border-[#EAE8DD] overflow-hidden">
               <div className="p-8 border-b border-[#EAE8DD] bg-[#F5F4F0] flex justify-between items-center">
                  <h3 className="font-['Playfair_Display'] text-2xl text-[#0B132B]">New Member Registration</h3>
                  <button onClick={() => setShowRegModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">✕</button>
               </div>
               <form onSubmit={handleRegisterMember} className="p-8 space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Full Name</label>
                    <input
                      required
                      type="text"
                      value={regData.name}
                      onChange={e => setRegData({...regData, name: e.target.value})}
                      placeholder="John Doe"
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Email Address</label>
                    <input
                      required
                      type="email"
                      value={regData.email}
                      onChange={e => setRegData({...regData, email: e.target.value})}
                      placeholder="john@example.com"
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Temporary Password</label>
                    <input
                      required
                      type="text"
                      value={regData.password}
                      onChange={e => setRegData({...regData, password: e.target.value})}
                      className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:border-[#8c6b22] focus:ring-1 focus:ring-[#8c6b22] outline-none bg-white font-mono"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full bg-[#0B132B] hover:bg-[#1a233a] text-white py-4 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                      Process Membership
                    </button>
                  </div>
               </form>
            </div>
          </div>
        )}

        {/* ======= INVENTORY ISSUE WITH PAYMENT MODAL ======= */}
        {showInventoryIssueModal && (
          <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-[#E0DED5] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">

              {/* LEFT — Book info + pricing */}
              <div className="bg-[#0B132B] w-full md:w-[42%] p-8 flex flex-col relative overflow-hidden shrink-0">
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#D2A450]/10 pointer-events-none" />
                <div className="absolute -bottom-8 -left-8  w-32 h-32 rounded-full bg-white/5       pointer-events-none" />

                <div className="mb-5">
                  <p className="text-[9px] font-bold tracking-[0.2em] text-[#D2A450] uppercase mb-1">Librarian Issue Desk</p>
                  <h3 className="font-['Playfair_Display'] text-xl text-white leading-tight">Issue Book with Payment</h3>
                </div>

                {/* Cover + title */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-[88px] bg-[#1A2542] rounded border border-[#2A3A5C] shrink-0 overflow-hidden shadow-xl">
                    {showInventoryIssueModal.coverImage?.url
                      ? <img src={showInventoryIssueModal.coverImage.url} alt="cover" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} className="text-[#D2A450]" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-['Playfair_Display'] text-white text-[15px] font-bold leading-tight mb-1 line-clamp-2">{showInventoryIssueModal.title}</h4>
                    <p className="text-[11px] text-gray-400 mb-2">{showInventoryIssueModal.author}</p>
                    <span className="text-[8px] font-bold tracking-widest uppercase text-[#D2A450] bg-[#D2A450]/10 px-2 py-1 rounded">{showInventoryIssueModal.genre || 'General'}</span>
                  </div>
                </div>

                {/* Duration / pricing selector */}
                <p className="text-[9px] font-bold tracking-[0.2em] text-gray-500 uppercase mb-3">Select Rental Period</p>
                <div className="space-y-3 mb-6">
                  {[
                    { key:'2weeks', label:'2 Weeks',  sub:'14 days · Standard',  mult:1 },
                    { key:'1month', label:'1 Month',   sub:'30 days · Extended',  mult:1.5 },
                  ].map(opt => {
                    const price = Math.round((showInventoryIssueModal.price || 300) * opt.mult);
                    const active = inventoryIssueDuration === opt.key;
                    return (
                      <button key={opt.key} type="button"
                        onClick={() => setInventoryIssueDuration(opt.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                          active ? 'border-[#D2A450] bg-[#D2A450]/10' : 'border-[#1A2542] bg-[#111827] hover:border-[#2A3A5C]'
                        }`}
                      >
                        <div>
                          <p className={`text-[12px] font-bold ${active ? 'text-[#D2A450]':'text-gray-300'}`}>{opt.label}</p>
                          <p className="text-[9px] text-gray-500 mt-0.5">{opt.sub}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-serif text-xl font-bold ${active ? 'text-[#D2A450]':'text-gray-400'}`}>₹{price}</p>
                          {opt.mult > 1 && <p className="text-[9px] text-gray-600">incl. ext. fee</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Stock */}
                <div className="mt-auto pt-4 border-t border-[#1A2542]">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">Available Stock</p>
                    <p className="font-bold text-sm text-white">{showInventoryIssueModal.availableCopies} / {showInventoryIssueModal.totalCopies}</p>
                  </div>
                  <div className="w-full bg-[#1A2542] rounded-full h-1">
                    <div className="bg-[#D2A450] h-1 rounded-full" style={{ width: showInventoryIssueModal.totalCopies > 0 ? `${(showInventoryIssueModal.availableCopies/showInventoryIssueModal.totalCopies)*100}%` : '0%' }} />
                  </div>
                </div>
              </div>

              {/* RIGHT — Form */}
              <div className="flex-1 p-8 flex flex-col justify-center overflow-y-auto">
                {inventoryIssueSuccess ? (
                  <div className="flex flex-col items-center text-center py-6">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl mb-5 shadow-inner animate-bounce">✓</div>
                    <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-2">Book Issued!</h3>
                    <p className="text-sm text-gray-500 mb-1"><strong>"{showInventoryIssueModal.title}"</strong> issued successfully.</p>
                    <p className="text-xs text-gray-400 mb-2">Due in <strong>{inventoryIssueDuration === '1month' ? '30 days (1 month)' : '14 days (2 weeks)'}</strong>.</p>
                    <p className="text-[10px] text-[#D26E4B] mb-6">⚠ Fines: ₹1/day after due date applies automatically.</p>
                    <button
                      onClick={() => { setShowInventoryIssueModal(null); setInventoryIssueSuccess(false); }}
                      className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-3 rounded-lg w-full transition-colors"
                    >Close & Continue</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <p className="text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase mb-1">Member & Payment Details</p>
                      <h3 className="font-['Playfair_Display'] text-2xl text-gray-900">Confirm Issue</h3>
                      <p className="text-xs text-gray-400 mt-1">Select the member, confirm payment received, then issue.</p>
                    </div>

                    <form onSubmit={handleInventoryIssueBook} className="space-y-5">
                      {/* Member select */}
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Member</label>
                        <select
                          required
                          value={inventoryIssueUserId}
                          onChange={e => setInventoryIssueUserId(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:border-[#0B132B] focus:ring-1 focus:ring-[#0B132B] outline-none bg-white"
                        >
                          <option value="">Choose a member...</option>
                          {members.filter(m => m.role === 'User' || m.role === 'Member').map(m => (
                            <option key={m._id} value={m._id}>{m.name} — {m.email}</option>
                          ))}
                        </select>
                      </div>

                      {/* Duration summary */}
                      <div className="bg-[#F5F4F0] rounded-xl px-4 py-3 flex items-center justify-between border border-[#E0DED5]">
                        <div>
                          <p className="text-[9px] font-bold tracking-widest text-gray-500 uppercase">Borrow Period</p>
                          <p className="font-bold text-[13px] text-gray-900 mt-0.5">{inventoryIssueDuration === '1month' ? '1 Month (30 days)' : '2 Weeks (14 days)'}</p>
                          <p className="text-[10px] text-[#D26E4B] mt-0.5">Return by: <strong>{new Date(Date.now() + (inventoryIssueDuration === '1month' ? 30 : 14) * 86400000).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</strong></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-gray-400 uppercase tracking-widest">Rental Fee</p>
                          <p className="font-serif text-2xl text-[#0B132B] font-bold">₹{inventoryIssueDuration === '1month' ? Math.round((showInventoryIssueModal.price||300)*1.5) : (showInventoryIssueModal.price||300)}</p>
                        </div>
                      </div>

                      {/* Payment method */}
                      <div>
                        <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Payment Method</label>
                        <div className="flex space-x-3">
                          {[{key:'cash',label:'💵 Cash'},{key:'upi',label:'📱 UPI'}].map(pm => (
                            <button key={pm.key} type="button"
                              onClick={() => setInventoryIssuePayMethod(pm.key)}
                              className={`flex-1 py-2.5 text-[11px] font-bold tracking-widest uppercase border rounded-lg transition-all ${
                                inventoryIssuePayMethod === pm.key
                                  ? 'border-[#0B132B] bg-[#0B132B] text-white shadow-md'
                                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
                              }`}
                            >{pm.label}</button>
                          ))}
                        </div>
                      </div>

                      {/* UPI input */}
                      {inventoryIssuePayMethod === 'upi' && (
                        <div>
                          <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">UPI ID / Transaction Ref</label>
                          <input
                            type="text"
                            value={inventoryIssuePayInput}
                            onChange={e => setInventoryIssuePayInput(e.target.value)}
                            placeholder="username@okbank or TXN ID"
                            className="w-full border-b-2 border-gray-200 py-2.5 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-transparent font-mono"
                          />
                        </div>
                      )}

                      {/* Confirmation checkbox */}
                      <label className="flex items-start space-x-3 cursor-pointer bg-[#F0FFF4] border border-green-200 rounded-xl p-4">
                        <input type="checkbox" required className="mt-0.5 w-4 h-4 accent-[#0B132B] cursor-pointer shrink-0" />
                        <span className="text-[11px] text-gray-700 leading-relaxed">
                          I confirm that the rental fee of{' '}
                          <strong className="text-[#0B132B]">
                            ₹{inventoryIssueDuration === '1month' ? Math.round((showInventoryIssueModal.price||300)*1.5) : (showInventoryIssueModal.price||300)}
                          </strong>{' '}
                          has been received via <strong>{inventoryIssuePayMethod === 'upi' ? 'UPI' : 'cash'}</strong>, and the book is ready to issue.
                        </span>
                      </label>

                      {/* Actions */}
                      <div className="flex space-x-3 pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowInventoryIssueModal(null); setInventoryIssueSuccess(false); }}
                          className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors uppercase tracking-widest"
                        >Cancel</button>
                        <button
                          type="submit"
                          disabled={inventoryIssueLoading}
                          className="flex-1 bg-[#0B132B] hover:bg-[#1a233a] disabled:bg-gray-400 text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center shadow-lg"
                        >
                          {inventoryIssueLoading
                            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><ArrowUpRight size={14} className="mr-2" />Issue Book</>}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
