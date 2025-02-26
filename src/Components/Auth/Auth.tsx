import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Auth: React.FC = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      Swal.fire({
        icon: 'warning',
        title: 'Authentication Required',
        text: 'You must log in to access this page',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        navigate('/login', { replace: true });
      });
    }
  }, [token, navigate]);

  return token ? <Outlet /> : null;
};

export default Auth;