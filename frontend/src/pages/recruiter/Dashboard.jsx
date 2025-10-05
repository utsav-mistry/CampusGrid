import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, FileText, Users, BarChart3, LogOut } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">CampusGrid Recruiter</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.profile?.name}</span>
              {user?.profile?.companyName && (
                <span className="text-sm text-gray-500">• {user.profile.companyName}</span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
            <p className="text-gray-600 mt-2">Create and manage recruitment drives</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Drives</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Applicants</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Custom Questions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <Building2 className="w-10 h-10 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Create New Drive</h3>
              <p className="text-primary-100">
                Set up a new recruitment drive with custom questions
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer">
              <FileText className="w-10 h-10 mb-4" />
              <h3 className="text-2xl font-bold mb-2">Question Bank</h3>
              <p className="text-purple-100">
                Browse and add questions from the question bank
              </p>
            </div>
          </div>

          {/* My Drives */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">My Recruitment Drives</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center py-8">
                No drives created yet. Create your first recruitment drive!
              </p>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">🚧 Recruiter Portal Under Development</h3>
            <p className="text-blue-800 text-sm">
              Full recruiter features including drive creation, custom questions, student analytics, and shortlisting are being built.
              The backend APIs are ready and functional.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
