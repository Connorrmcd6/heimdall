import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider"
import { Login } from './routes/Login';
import { Signup } from './routes/Signup';
import { MFAVerification } from './routes/MFAVerification';
import { MFASetup } from './routes/MFASetup';
import { Dashboard } from './routes/Dashboard';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ForgotPassword } from './routes/ForgotPassword';

const AppRoutes = () => {
  const { isAuthenticated, requiresMFA } = useAuth();

  return (
    <Routes>
      <Route 
        path="/mfa-verify" 
        element={
          requiresMFA ? (
            <MFAVerification />
          ) : (
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          )
        } 
      />

      <Route 
        path="/mfa-setup" 
        element={<MFASetup />} 
      />
      
      <Route 
        path="/login" 
        element={
          requiresMFA ? (
            <Navigate to="/mfa-verify" replace />
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
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} 
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