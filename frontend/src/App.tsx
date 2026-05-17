import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import LeadsManagement from './pages/LeadsManagement';
import ProtectedRoute from './components/ProtectedRoute'; // Secure Guard

function App() {
    return (
        <Router>
            <Routes>
                {/* 🔓 Public Authentication Gates */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 🔒 FIXED NESTING: Both paths must live under this exact single wrapper */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/leads" element={<LeadsManagement />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Catch-all safety net fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;