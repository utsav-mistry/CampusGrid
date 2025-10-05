import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, FileQuestion, TrendingUp, LogOut } from 'lucide-react';

export default function AdminDashboard() {
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
              <h1 className="text-2xl font-bold text-primary-600">CampusGrid Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user?.profile?.name}</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage subjects, questions, and monitor exams</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Subjects</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exams Today</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <BookOpen className="w-8 h-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manage Subjects</h3>
              <p className="text-gray-600 text-sm">Add, edit, or remove subjects</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <FileQuestion className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Question Bank</h3>
              <p className="text-gray-600 text-sm">Manage MCQ and code questions</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Student Management</h3>
              <p className="text-gray-600 text-sm">View and manage student accounts</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <TrendingUp className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics</h3>
              <p className="text-gray-600 text-sm">View performance metrics and reports</p>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-medium text-blue-900 mb-2">🚧 Admin Portal Under Development</h3>
            <p className="text-blue-800 text-sm">
              Full admin features including subject management, question bank, and analytics dashboard are being built.
              The backend APIs are ready and functional.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
