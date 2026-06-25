import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import MinimalLoader from '../common/MinimalLoader';
import Swal from 'sweetalert2';

const AdminDonations = () => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGateway, setFilterGateway] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const axiosSecure = useAxiosSecure();

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const res = await axiosSecure.get('/admin/donations');
      setDonations(res.data);
    } catch (error) {
      console.error("Failed to fetch donations", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to retrieve donation records.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Filter logic
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          donation.tranId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGateway = filterGateway === 'all' || donation.gateway?.toLowerCase() === filterGateway.toLowerCase();
    const matchesType = filterType === 'all' || donation.type?.toLowerCase() === filterType.toLowerCase();
    
    return matchesSearch && matchesGateway && matchesType;
  });

  // Calculate statistics
  const totalAmount = donations.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const stripeAmount = donations
    .filter(item => item.gateway?.toLowerCase() === 'stripe')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const sslAmount = donations
    .filter(item => item.gateway?.toLowerCase() === 'sslcommerz')
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <MinimalLoader size="lg" color="#14b8a6" />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      {}
      <div className="flex items-center gap-5 mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-700 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-teal-500/30 border border-teal-400">
          <i className="ri-heart-3-line text-3xl tracking-tight drop-shadow-md"></i>
        </div>
        <div>
          <h1 className="text-3xl tracking-tight md:text-4xl tracking-tight font-black text-slate-900 dark:text-white tracking-tight">Donations & Contributions</h1>
          <p className="text-[13px] md:text-[13px] text-slate-500 dark:text-slate-300 font-medium mt-1">Monitor, query, and verify financial contributions across the platform.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3040] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Contributions</span>
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">৳{totalAmount.toLocaleString()}</h3>
            <p className="text-xs font-semibold text-teal-600 mt-2 flex items-center gap-1">
              <i className="ri-arrow-up-circle-line"></i> Cumulative raised
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3040] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Stripe Card Payments</span>
          <div>
            <h3 className="text-2xl font-black text-[#635BFF] leading-none">৳{stripeAmount.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2">Processed securely via Stripe</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3040] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Mobile Banking / local</span>
          <div>
            <h3 className="text-2xl font-black text-emerald-600 leading-none">৳{sslAmount.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-2">Processed via SSLCommerz</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-2xl p-5 border border-slate-200 dark:border-[#1e3040] shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Transaction Count</span>
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none">{donations.length}</h3>
            <p className="text-xs text-slate-500 mt-2">Successful transactions</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white dark:bg-[#0a120e] ring-1 ring-slate-100 dark:ring-[#14241d] rounded-[2rem] shadow-sm border border-slate-200 dark:border-[#1e3040] p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
            <input 
              type="text" 
              placeholder="Search email or transaction ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-[#0b1215] border-2 border-slate-100 dark:border-[#1e3040] rounded-xl text-[14px] font-semibold text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select 
              value={filterGateway}
              onChange={(e) => setFilterGateway(e.target.value)}
              className="select select-sm bg-slate-50 dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] rounded-lg h-11 px-4 focus:outline-none text-[13px] font-bold"
            >
              <option value="all">All Gateways</option>
              <option value="stripe">Stripe</option>
              <option value="sslcommerz">SSLCommerz</option>
            </select>

            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="select select-sm bg-slate-50 dark:bg-[#0b1215] border-slate-200 dark:border-[#1e3040] text-slate-700 dark:text-[#cbd5e1] rounded-lg h-11 px-4 focus:outline-none text-[13px] font-bold"
            >
              <option value="all">All Contribution Types</option>
              <option value="community">Community Platform</option>
              <option value="animal">Animal Welfare</option>
              <option value="event">Cleanup Events</option>
              <option value="ngo">NGO Funding</option>
            </select>
          </div>
        </div>

        {/* Donations Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1e3040] text-slate-500 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Donor Info</th>
                <th className="py-4 px-6">Transaction ID</th>
                <th className="py-4 px-6">Gateway</th>
                <th className="py-4 px-6">Purpose</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1e3040]">
              {filteredDonations.length > 0 ? (
                filteredDonations.map(donation => (
                  <tr key={donation._id} className="hover:bg-slate-50 dark:hover:bg-[#0b1215]/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {donation.email?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white text-[13px]">{donation.email || 'Anonymous Donor'}</p>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase tracking-wider">User</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[12px] font-mono text-slate-600 dark:text-slate-300 select-all">{donation.tranId || donation.tran_id || 'N/A'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        donation.gateway?.toLowerCase() === 'stripe'
                          ? 'bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {donation.gateway || 'Stripe'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        donation.type === 'community' ? 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' :
                        donation.type === 'animal' ? 'bg-pink-500/10 text-pink-600 border-pink-500/20' :
                        donation.type === 'event' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                        'bg-violet-500/10 text-violet-600 border-violet-500/20'
                      }`}>
                        {donation.type || 'community'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-[13px] text-slate-800 dark:text-white">৳{Number(donation.amount || 0).toLocaleString()}</td>
                    <td className="py-4 px-6 text-[12.5px] text-slate-500 dark:text-slate-300 font-medium">
                      {new Date(donation.date || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-450 dark:text-slate-300 font-bold text-sm">
                    No transactions found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
