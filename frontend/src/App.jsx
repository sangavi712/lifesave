import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoutes';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { AIAssistant } from './components/AIAssistant';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { DonorRegister } from './pages/DonorRegister';
import { DonorList } from './pages/DonorList';
import { BloodRequests } from './pages/BloodRequests';
import { Inventory } from './pages/Inventory';
import { Contact } from './pages/Contact';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const AuthenticatedLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent">
      <div className="flex-grow flex flex-col">
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="flex flex-1 relative">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/register-donor" element={<DonorRegister />} />
              <Route path="/donors" element={<DonorList />} />
              <Route path="/requests" element={<BloodRequests />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
      <footer className="w-full py-4 px-6 text-center text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-450 border-t border-slate-200/40 dark:border-white/[0.05] bg-white/40 dark:bg-black/10 backdrop-blur-xs select-none">
        Portfolio Demo Project – For Educational Purposes Only. All data shown is fictional and for portfolio/demo purposes only. The system is not intended for real-world medical, clinical, or emergency use.
      </footer>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Authentication Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/*" element={<AuthenticatedLayout />} />
            </Route>
          </Routes>
          <AIAssistant />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
