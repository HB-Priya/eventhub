import React, { useEffect, useState } from 'react';
import { mockDb } from '../services/mockDatabase';
import { Booking, User } from '../types';
import { Calendar, IndianRupee, Clock } from 'lucide-react';
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
        const data = await mockDb.getBookingsByUser(user.id);
        setBookings(data);
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user.id]);

  // Prepare data for chart (Expense by Service Type)
  const chartData = bookings.reduce((acc: any[], curr) => {
    const existing = acc.find(item => item.name === curr.serviceTitle);
    if (existing) {
      existing.amount += curr.totalAmount;
    } else {
      acc.push({ name: curr.serviceTitle.split(' ')[0], amount: curr.totalAmount, fullTitle: curr.serviceTitle });
    }
    return acc;
  }, []);

  const COLORS = ['#4f46e5', '#06b6d4', '#f59e0b', '#10b981'];

  if (loading) return <div className="p-10 text-center">Loading records...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-playfair">Welcome, {user.name}</h1>
        <p className="text-slate-600">Here are your event records with Tirupalappa Events.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking History */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-indigo-600" /> Recent Bookings
          </h2>
          
          {bookings.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-slate-500">
              No bookings found. Start planning your event today!
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{booking.serviceTitle}</h3>
                    <div className="flex items-center text-slate-500 mt-1 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} 
                      <span className="mx-2">•</span>
                      Guest Count: {booking.guestCount}
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
                    <p className="text-xs text-slate-400 mt-1">ID: {booking.id}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-slate-500">
                  Confirmation sent to: <span className="font-medium">{booking.userEmail}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats / Chart */}
        <div className="space-y-6">
           <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <IndianRupee className="h-5 w-5 mr-2 text-indigo-600" /> Spending Overview
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
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-2">Special Offers!</h3>
            <ul className="list-disc pl-4 text-sm space-y-1">
              <li>10% Off on Wedding + Photo Combo</li>
              <li>Free Cake with Kids Birthday Package</li>
              <li>Corporate Weekday Discounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;