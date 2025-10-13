import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { MFAVerificationForm } from './components/auth/MFAVerificationForm';
import { Dashboard } from './components/Dashboard';

const AppRoutes = () => {
  const { isAuthenticated, requiresMFA } = useAuth();

  return (
    <Routes>
      {/* MFA Verification Route */}
      <Route 
        path="/mfa-verify" 
        element={
          requiresMFA ? (
            <MFAVerificationForm />
          ) : (
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          )
        } 
      />
      
      {/* Redirect authenticated users away from auth pages */}
      <Route 
        path="/login" 
        element={
          requiresMFA ? (
            <Navigate to="/mfa-verify" replace />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm />
          )
        } 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordForm />} 
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;