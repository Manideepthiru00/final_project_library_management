import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Checkout() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [success, setSuccess] = useState(false);
   const [paymentMethod, setPaymentMethod] = useState('card');
   const [paymentData, setPaymentData] = useState({
      name: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      upiId: ''
   });

   const [borrows, setBorrows] = useState([]);
   const [user, setUser] = useState(null);

   useEffect(() => {
     // Fetch active context to make it feel real
     const fetchData = async () => {
        try {
           const { data: userData } = await api.get('/auth/me');
           setUser(userData.user || userData);
           const { data: borrowData } = await api.get('/borrows/my-borrows');
           const fetchedBorrows = borrowData.borrows || [];
           setBorrows(fetchedBorrows.filter(b => b.status === "Reserved"));
        } catch (e) {
           console.log("No valid session context", e);
        }
     };
     fetchData();
   }, []);

   const handleRemoveItem = (indexToRemove) => {
      setBorrows(prev => prev.filter((_, index) => index !== indexToRemove));
   };

   const handlePayment = async (e) => {
      e.preventDefault();
      if(borrows.length === 0) return;
      setLoading(true);

      try {
         const borrowsIds = borrows.map(b => b._id);
         const res = await api.post('/borrows/checkout', { borrowsIds });
         if (res.data.success) {
            setSuccess(true);
         }
      } catch (error) {
         console.error("Payment failed", error);
         alert(error.response?.data?.message || "Payment Process Failed.");
      } finally {
         setLoading(false);
      }
   };

   if (success) {
      return (
         <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-12 rounded-3xl border border-gray-200/50 shadow-2xl max-w-lg w-full flex flex-col items-center">
               <div className="w-24 h-24 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
                  ✓
               </div>
               <h2 className="font-['Playfair_Display'] text-4xl text-gray-900 mb-4">Payment Confirmed</h2>
               <p className="text-gray-500 mb-8 max-w-sm">
                  Your transaction was securely processed. An invoice has been appended to your library records.
               </p>
               <button 
                  onClick={() => navigate('/user')}
                  className="bg-[#0B132B] hover:bg-[#1a233a] text-white text-xs font-bold tracking-[0.2em] uppercase px-8 py-4 rounded w-full transition-colors"
               >
                  Return to Dashboard
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 sm:p-8">
         <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden flex flex-col md:flex-row">
            
            {/* Left side: Order Summary */}
            <div className="bg-[#EBE9DF] w-full md:w-5/12 p-10 lg:p-14 flex flex-col relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#A37B2C]/10 rounded-bl-full pointer-events-none"></div>
               
               <button onClick={() => navigate('/user')} className="text-gray-500 hover:text-gray-900 text-xs font-bold tracking-widest uppercase mb-12 self-start flex items-center transition-colors">
                 ← Back
               </button>

               <h2 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-2">Order Summary</h2>
               <p className="text-xs text-gray-500 uppercase tracking-widest mb-10">Library Services & Fines</p>
               
               <div className="flex-1 space-y-6">
                  {borrows.length > 0 ? borrows.map((b, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-gray-200/50">
                        <div className="flex items-center space-x-4">
                           <div className="w-10 h-10 bg-[#0B132B] rounded shadow overflow-hidden flex-shrink-0">
                              {b.book?.coverImage?.url && <img src={b.book.coverImage.url} alt="book" className="w-full h-full object-cover" />}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-gray-900">{b.book?.title}</p>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Expedited Transfer</p>
                           </div>
                        </div>
                        <div className="flex items-center">
                           <span className="font-mono text-gray-900 font-bold">₹{(b.book?.price || 350).toFixed(2)}</span>
                           <button onClick={() => handleRemoveItem(idx)} className="text-gray-400 hover:text-[#D26E4B] text-lg ml-4 transition-colors leading-none" title="Remove from checkout">
                              &times;
                           </button>
                        </div>
                     </div>
                  )) : (
                     <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-gray-200/50">
                        <div>
                           <p className="text-sm font-bold text-gray-900">Premium Vault Access</p>
                           <p className="text-[10px] text-gray-500 uppercase tracking-widest">Monthly Subscription</p>
                        </div>
                        <span className="font-mono text-gray-900 font-bold">₹999.00</span>
                     </div>
                  )}

                  <div className="flex justify-between items-center bg-white/50 p-4 rounded-xl border border-gray-200/50">
                     <div>
                        <p className="text-sm font-bold text-gray-900">Late Return Fine</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Clear Outstanding</p>
                     </div>
                     <span className="font-mono text-gray-900 font-bold">₹0.00</span>
                  </div>
               </div>

               <div className="pt-8 mt-8 border-t border-gray-300">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-gray-500">Subtotal</span>
                     <span className="font-mono text-gray-700">{borrows.length > 0 ? `₹${(borrows.reduce((sum, b) => sum + (b.book?.price || 350), 0)).toFixed(2)}` : '₹999.00'}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-sm text-gray-500">Processing Fee</span>
                     <span className="font-mono text-gray-700">₹45.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-lg font-bold text-gray-900">Total</span>
                     <span className="font-mono text-2xl font-bold text-[#8c6b22]">
                        {borrows.length > 0 ? `₹${(borrows.reduce((sum, b) => sum + (b.book?.price || 350), 0) + 45).toFixed(2)}` : '₹1044.00'}
                     </span>
                  </div>
               </div>
            </div>

            {/* Right side: Payment Gateway */}
            <div className="w-full md:w-7/12 p-10 lg:p-14 flex flex-col justify-center bg-white">
               <div className="mb-10">
                  <span className="text-[9px] font-bold tracking-[0.2em] text-[#8c6b22] uppercase">Secure Gateway</span>
                  <h3 className="font-['Playfair_Display'] text-4xl text-gray-900 mt-2">Payment Details</h3>
                  <p className="text-xs text-gray-500 mt-2">Complete your transaction using a secure encrypted connection.</p>
               </div>

               <form onSubmit={handlePayment} className="space-y-6">
                  <div>
                     <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Cardholder Name</label>
                     <input 
                        type="text" 
                        required
                        value={paymentData.name}
                        onChange={(e) => setPaymentData({...paymentData, name: e.target.value})}
                        placeholder={user?.name || "J. Vane"}
                        className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-white font-mono"
                      />
                   </div>
                   
                   <div className="flex space-x-4 mb-6">
                      <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase border rounded transition-colors ${paymentMethod === 'card' ? 'border-[#0B132B] bg-[#0B132B] text-white' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>Credit/Debit Card</button>
                      <button type="button" onClick={() => setPaymentMethod('upi')} className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase border rounded transition-colors ${paymentMethod === 'upi' ? 'border-[#0B132B] bg-[#0B132B] text-white' : 'border-gray-300 text-gray-500 hover:border-gray-400'}`}>UPI / Mobile</button>
                   </div>

                   {paymentMethod === 'card' ? (
                      <>
                         <div>
                            <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Card Number</label>
                            <div className="relative">
                               <input 
                                  type="text" 
                                  required
                                  maxLength="19"
                                  value={paymentData.cardNumber}
                                  onChange={(e) => {
                                     const val = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                     setPaymentData({...paymentData, cardNumber: val});
                                  }}
                                  placeholder="0000 0000 0000 0000"
                                  className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-white font-mono tracking-widest"
                               />
                               <div className="absolute right-0 top-3 flex space-x-1">
                                  <div className="w-8 h-5 bg-gray-200 rounded"></div>
                                  <div className="w-8 h-5 bg-[#0B132B] rounded opacity-20"></div>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-8 mt-6">
                            <div>
                               <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">Expiry Date</label>
                               <input 
                                  type="text" 
                                  required
                                  maxLength="5"
                                  value={paymentData.expiry}
                                  onChange={(e) => {
                                     let val = e.target.value.replace(/\D/g, '');
                                     if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
                                     setPaymentData({...paymentData, expiry: val});
                                  }}
                                  placeholder="MM/YY"
                                  className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-white font-mono"
                               />
                            </div>
                            <div>
                               <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">CVC</label>
                               <input 
                                  type="text" 
                                  required
                                  maxLength="3"
                                  value={paymentData.cvc}
                                  onChange={(e) => setPaymentData({...paymentData, cvc: e.target.value.replace(/\D/g, '')})}
                                  placeholder="123"
                                  className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-white font-mono"
                               />
                            </div>
                         </div>
                      </>
                   ) : (
                      <div className="mb-6 mt-4">
                         <label className="block text-[10px] font-bold tracking-widest text-gray-700 uppercase mb-2">UPI ID / VPA</label>
                         <input 
                            type="text" 
                            required
                            value={paymentData.upiId}
                            onChange={(e) => setPaymentData({...paymentData, upiId: e.target.value})}
                            placeholder="username@okbank"
                            className="w-full border-b-2 border-gray-200 py-3 text-sm focus:outline-none focus:border-[#0B132B] transition-colors bg-white font-mono"
                         />
                      </div>
                   )}                  <div className="pt-8">
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#0B132B] hover:bg-[#1a233a] disabled:bg-gray-400 text-white py-4 rounded-lg font-bold tracking-[0.2em] text-[10px] uppercase transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
                     >
                        {loading ? (
                           <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                           `Pay ${borrows.length > 0 ? '₹' + (borrows.reduce((sum, b) => sum + (b.book?.price || 350), 0) + 45).toFixed(2) : '₹1044.00'}`
                        )}
                     </button>
                     <div className="text-center mt-6 flex items-center justify-center text-gray-400">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Payments secured by 256-bit AES encryption</span>
                     </div>
                  </div>
               </form>
            </div>

         </div>
      </div>
   );
}
