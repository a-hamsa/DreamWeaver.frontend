import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminUsers from '../Components/Admin/AdminUsers';
import AdminDreams from '../Components/Admin/AdminDreams';
import AdminComments from '../Components/Admin/AdminComments';
import Navbar from '../Components/Home/Navbar';
import Swal from 'sweetalert2';

const Admin: React.FC = () => {
  const [view, setView] = useState<'users' | 'dreams' | 'comments'>('users');
  const navigate = useNavigate();
  const isAdmin = localStorage.getItem('isAdmin');

useEffect(() => {
    if (!isAdmin) {
        Swal.fire({
            icon: 'warning',
            title: 'Access Denied',
            text: 'You do not have permission to access this page',
            confirmButtonColor: '#3085d6',
        }).then(() => {
            navigate('/home', { replace: true });
        });
    }
}, [isAdmin, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar userFullName={localStorage.getItem('userFullName') || 'Admin'} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <button onClick={() => setView('users')} className="mx-2 px-4 py-2 bg-blue-500 text-white rounded">Manage Users</button>
          <button onClick={() => setView('dreams')} className="mx-2 px-4 py-2 bg-green-500 text-white rounded">Manage Dreams</button>
          <button onClick={() => setView('comments')} className="mx-2 px-4 py-2 bg-red-500 text-white rounded">Manage Comments</button>
        </div>
        {view === 'users' && <AdminUsers />}
        {view === 'dreams' && <AdminDreams />}
        {view === 'comments' && <AdminComments />}
      </div>
    </div>
  );
};

export default Admin;
