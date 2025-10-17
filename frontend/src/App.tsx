import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider"
import { Login } from './routes/Login';
import { Signup } from './routes/Signup';
import { OTPVerification } from './routes/OTPVerification';
import { Dashboard } from './routes/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
// import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';

const AppRoutes = () => {
  const { isAuthenticated, requiresMFA } = useAuth();

  return (
    <Routes>
      {/* MFA Verification Route */}
      <Route 
        path="/otp-verify" 
        element={
          requiresMFA ? (
            <OTPVerification />
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
            <Navigate to="/otp-verify" replace />
          ) : isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login />
          )
        } 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      {/* <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPasswordForm />} 
      /> */}
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
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;