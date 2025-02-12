import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Home, 
  Users, 
  Bell, 
  MessageSquare,
  Settings,
  LogOut,
  ClipboardCheck,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/dashboard" className="flex items-center px-2 py-2">
                <img 
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4QJrHTBxEEDukM-IexLwKP7ATsl6NGfYDEg&s" 
                  alt="Tierra Alta Logo" 
                  className="h-8 w-auto"
                />
              </Link>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <NavLink to="/dashboard" active={isActive('/dashboard')}>
                  <Home className="w-5 h-5" />
                  <span>Inicio</span>
                </NavLink>
                
                <NavLink to="/campers" active={isActive('/campers')}>
                  <Users className="w-5 h-5" />
                  <span>Campistas</span>
                </NavLink>
                
                <NavLink to="/announcements" active={isActive('/announcements')}>
                  <Bell className="w-5 h-5" />
                  <span>Anuncios</span>
                </NavLink>
                
                <NavLink to="/chat" active={isActive('/chat')}>
                  <MessageSquare className="w-5 h-5" />
                  <span>Chat</span>
                </NavLink>

                <NavLink to="/tracking" active={isActive('/tracking')}>
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Seguimiento</span>
                </NavLink>

                <NavLink to="/documents" active={isActive('/documents')}>
                  <FileText className="w-5 h-5" />
                  <span>Documentos</span>
                </NavLink>

                {isAdmin && (
                  <NavLink to="/admin" active={isActive('/admin')}>
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </NavLink>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ children, to, active }: { children: React.ReactNode, to: string, active: boolean }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}