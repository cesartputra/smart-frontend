// src/App.jsx - Updated dengan proper route protection dan Profile integration
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import CompleteKTP from './pages/ktp/CompleteKTP';
import Profile from './pages/profile/Profile';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import CompleteProfile from './pages/profile/CompleteProfile';

const TestPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
    <div className="max-w-4xl mx-auto text-center">
      <div className="mb-8">
        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            SMART-RW
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-2">Sistem Manajemen RT-RW Digital</p>
        <p className="text-gray-500">Development server berhasil berjalan! 🚀</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Akses Aplikasi</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a 
            href="/login" 
            className="block p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Login</h3>
            <p className="text-blue-100 text-sm">Masuk ke akun Anda</p>
          </a>
          
          <a 
            href="/register" 
            className="block p-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-lg font-semibold mb-2">Register</h3>
            <p className="text-green-100 text-sm">Daftar akun baru</p>
          </a>
        </div>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Status Development</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            Auth System
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            Email Verify
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            KTP Form
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            Profile Form
          </div>
        </div>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        {/* Public Routes */}
        <Route path="/test" element={<TestPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Email verification - accessible without full auth */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Routes dengan step-by-step completion */}
        <Route 
          path="/complete-ktp" 
          element={
            <ProtectedRoute>
              <CompleteKTP />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile completion - requires KTP to be completed first */}
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute requiresKTP>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile management - accessible after KTP completion */}
        {/* <Route 
          path="/profile" 
          element={
            <ProtectedRoute requiresKTP>
              <Profile />
            </ProtectedRoute>
          } 
        /> */}
        
        {/* Dashboard - requires both KTP and user details completion */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiresKTP requiresUserDetails>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Auto-redirect based on completion status */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div>Redirecting...</div>
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;