import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
    const token = localStorage.getItem('token');
    
    // This will force print exactly what the browser is seeing into your console!
    console.log("--- SECURITY GUARD CHECK ---");
    console.log("Token value found:", token);
    console.log("Token type:", typeof token);

    // FIX: Added 'token?.trim()' optional chaining to prevent null-pointer crashes
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
        console.log("RESULT: No valid token! Kicking user out to /login.");
        return <Navigate to="/login" replace />;
    }

    console.log("RESULT: Token found! Letting user through.");
    return <Outlet />;
};

export default ProtectedRoute;