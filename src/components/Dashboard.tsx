import React, { useEffect, useState } from 'react';
import { api } from '../services/api'; // USING REAL API NOW
import { Booking, User } from '../types';
import { Calendar, IndianRupee, Clock, ShieldCheck, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Pass the isAdmin flag to fetch all data if needed
        const data = await api.getBookings(user.id, user.isAdmin);
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.id, user.isAdmin]);

  // --- CHART DATA LOGIC ---
  const chartData = bookings.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.serviceTitle);
    if (existing) {
      existing.amount += curr.totalAmount;
    } else {
      acc.push({ name: curr.serviceTitle.split(' ')[0], amount: curr.totalAmount, fullTitle: curr.serviceTitle });
    }
    return acc;
  }, []);

  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981', '#ec4899'];

  // --- ADMIN STATS ---
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalGuests = bookings.reduce((sum, b) => sum + b.guestCount, 0);

  if (loading) return <div className="p-10 text-center">Loading records...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-playfair">
            {user.isAdmin ? 'Agency Dashboard' : `Welcome, ${user.name}`}
          </h1>
          <p className="text-slate-600">
            {user.isAdmin 
              ? 'Here is the complete overview of all customer bookings.' 
              : 'Here are your event records with Tirupalappa Events.'}
          </p>
        </div>
        {user.isAdmin && (
          <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-bold text-sm flex items-center">
            <ShieldCheck className="h-4 w-4 mr-2" /> Admin Mode Active
          </div>
        )}
      </div>

      {/* Admin Stats Cards */}
      {user.isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-500 font-bold uppercase">Total Revenue</p>
                 <p className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</p>
               </div>
               <div className="bg-green-100 p-3 rounded-full"><IndianRupee className="h-6 w-6 text-green-600" /></div>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-500 font-bold uppercase">Total Bookings</p>
                 <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
               </div>
               <div className="bg-blue-100 p-3 rounded-full"><TrendingUp className="h-6 w-6 text-blue-600" /></div>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-500">
             <div className="flex justify-between items-center">
               <div>
                 <p className="text-sm text-gray-500 font-bold uppercase">Total Guests Managed</p>
                 <p className="text-2xl font-bold text-slate-900">{totalGuests.toLocaleString()}</p>
               </div>
               <div className="bg-purple-100 p-3 rounded-full"><Users className="h-6 w-6 text-purple-600" /></div>
             </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking History List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" /> 
            {user.isAdmin ? 'All Customer Bookings' : 'Recent Bookings'}
          </h2>
          
          {bookings.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-slate-500">
              No bookings found.
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="font-bold text-lg text-slate-900">{booking.serviceTitle}</h3>
                       {user.isAdmin && (
                         <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-bold border border-gray-200">
                           {booking.userName}
                         </span>
                       )}
                    </div>
                    <div className="flex items-center text-slate-500 mt-1 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} 
                      <span className="mx-2">•</span>
                      Guests: {booking.guestCount}
                    </div>
                    <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                      {booking.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-900 flex items-center justify-end">
                      <IndianRupee className="h-4 w-4" />
                      {booking.totalAmount.toLocaleString()}
                    </div>
                    {user.isAdmin && (
                      <div className="text-xs text-slate-500 mt-1">
                        Contact: {booking.userEmail}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats / Chart */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <IndianRupee className="h-5 w-5 mr-2 text-indigo-600" /> 
            {user.isAdmin ? 'Revenue by Service' : 'Spending Overview'}
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md h-80">
             {bookings.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" tick={{fontSize: 12}} />
                   <YAxis tick={{fontSize: 12}} />
                   <Tooltip formatter={(value) => `₹${Number(value).toLocaleString()}`} />
                   <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                     {chartData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                 No data to visualize
               </div>
             )}
          </div>
          
          {!user.isAdmin && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
              <h3 className="font-bold text-lg mb-2">Special Offers!</h3>
              <ul className="list-disc pl-4 text-sm space-y-1">
                <li>10% Off on Wedding + Photo Combo</li>
                <li>Free Cake with Kids Birthday Package</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;