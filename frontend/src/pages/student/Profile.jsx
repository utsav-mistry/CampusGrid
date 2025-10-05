import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import { Mail, Lock, CheckCircle, AlertCircle, Building2 } from 'lucide-react';

export default function Profile() {
  const { user, linkUniversityEmail, verifyUniversityEmail, sendOTP } = useAuth();
  const [step, setStep] = useState(1); // 1: Form, 2: Verify OTP
  const [universityEmail, setUniversityEmail] = useState('');
  const [universityPassword, setUniversityPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLinkEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await linkUniversityEmail(universityEmail, universityPassword);
      setSuccess('OTP sent to your university email!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link university email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyUniversityEmail(otp);
      setSuccess('University email verified successfully!');
      setStep(1);
      setUniversityEmail('');
      setUniversityPassword('');
      setOtp('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);
    try {
      await sendOTP(universityEmail, 'registration');
      setSuccess('OTP resent successfully!');
    } catch (err) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>

        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <p className="text-gray-900">{user?.profile?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">General Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{user?.email}</p>
                {user?.isEmailVerified && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
            </div>
            {user?.profile?.studentId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <p className="text-gray-900">{user.profile.studentId}</p>
              </div>
            )}
            {user?.profile?.branch && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <p className="text-gray-900">{user.profile.branch}</p>
              </div>
            )}
            {user?.profile?.year && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <p className="text-gray-900">Year {user.profile.year}</p>
              </div>
            )}
          </div>
        </div>

        {/* University Email Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">University Email</h2>
          </div>

          {user?.universityEmail ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">University Email Linked</span>
              </div>
              <p className="text-green-800">{user.universityEmail}</p>
              {user.isUniversityEmailVerified && (
                <p className="text-sm text-green-600 mt-2">✓ Verified</p>
              )}
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Why link university email?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Required to participate in recruitment drives</li>
                  <li>• Access company-specific exams</li>
                  <li>• Verify your student status</li>
                </ul>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleLinkEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={universityEmail}
                        onChange={(e) => setUniversityEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="yourname@mail.ljku.edu.in"
                        pattern=".+@mail\.ljku\.edu\.in"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Must be a valid LJ University email (@mail.ljku.edu.in)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      University Email Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={universityPassword}
                        onChange={(e) => setUniversityPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="••••••••"
                        minLength={6}
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Set a password for logging in with your university email
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Linking...' : 'Link University Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      OTP sent to {universityEmail}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Resend OTP
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
