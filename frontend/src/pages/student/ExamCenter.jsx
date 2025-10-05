import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import ExamRulesModal from '../../components/ExamRulesModal';
import api from '../../lib/api';
import { getLevelColor } from '../../lib/utils';
import { BookOpen, Play, AlertCircle, Building2 } from 'lucide-react';

export default function ExamCenter() {
  const [activeTab, setActiveTab] = useState('general');
  const [subjects, setSubjects] = useState([]);
  const [levels, setLevels] = useState([]);
  const [drives, setDrives] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [pendingExamData, setPendingExamData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, drivesRes] = await Promise.all([
          api.get('/exams/general/subjects'),
          api.get('/exams'),
        ]);
        setSubjects(subjectsRes.data.data.subjects);
        setLevels(subjectsRes.data.data.levels);
        setDrives(drivesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch exam data:', error);
      }
    };

    fetchData();
  }, []);

  const handleStartGeneralExam = async () => {
    if (!selectedSubject || !selectedLevel) {
      setError('Please select both subject and level');
      return;
    }

    // Show rules modal first
    setShowRulesModal(true);
    setPendingExamData({ type: 'general', subjectId: selectedSubject, level: selectedLevel });
  };

  const handleAcceptRules = async () => {
    setShowRulesModal(false);
    setError('');
    setLoading(true);

    try {
      if (pendingExamData.type === 'general') {
        const response = await api.post('/exams/general/start', {
          subjectId: pendingExamData.subjectId,
          level: pendingExamData.level,
          questionCount: 10,
        });

        const attemptId = response.data.data.attemptId;
        localStorage.setItem(`exam_${attemptId}`, JSON.stringify(response.data.data));
        navigate(`/student/exam/${attemptId}`);
      } else if (pendingExamData.type === 'drive') {
        const response = await api.post(`/exams/${pendingExamData.driveId}/start`);
        const attemptId = response.data.data.attemptId;
        localStorage.setItem(`exam_${attemptId}`, JSON.stringify(response.data.data));
        navigate(`/student/exam/${attemptId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start exam');
    } finally {
      setLoading(false);
      setPendingExamData(null);
    }
  };

  const handleStartDrive = (driveId, mode) => {
    // Show rules modal first
    setShowRulesModal(true);
    setPendingExamData({ type: 'drive', driveId, mode });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Center</h1>
          <p className="text-gray-600 mt-2">
            Choose between general practice exams or recruitment drives
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                General Exams
              </div>
            </button>
            <button
              onClick={() => setActiveTab('drives')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'drives'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Recruitment Drives
              </div>
            </button>
          </nav>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* General Exams Tab */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Start a General Practice Exam
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a subject...</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Difficulty Level
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        selectedLevel === level
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(level)}`}>
                        {level}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Exam Details</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 10 random questions from selected subject and level</li>
                  <li>• 60 minutes duration</li>
                  <li>• Lenient mode (1 warning before ban)</li>
                  <li>• Instant results and badge progression</li>
                </ul>
              </div>

              <button
                onClick={handleStartGeneralExam}
                disabled={loading || !selectedSubject || !selectedLevel}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                {loading ? 'Starting Exam...' : 'Start Exam'}
              </button>
            </div>
          </div>
        )}

        {/* Recruitment Drives Tab */}
        {activeTab === 'drives' && (
          <div className="space-y-4">
            {drives.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Recruitment Drives
                </h3>
                <p className="text-gray-600">
                  Check back later for company recruitment exams
                </p>
              </div>
            ) : (
              drives.map((drive) => (
                <div
                  key={drive._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {drive.title}
                      </h3>
                      {drive.driveDetails?.companyName && (
                        <p className="text-primary-600 font-medium mt-1">
                          {drive.driveDetails.companyName}
                        </p>
                      )}
                      {drive.driveDetails?.description && (
                        <p className="text-gray-600 mt-2">
                          {drive.driveDetails.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                        <span className={`px-3 py-1 rounded-full ${getLevelColor(drive.level)}`}>
                          {drive.level}
                        </span>
                        <span>Duration: {drive.duration} min</span>
                        <span className={`px-3 py-1 rounded-full ${
                          drive.mode === 'strict' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {drive.mode === 'strict' ? 'Strict Mode' : 'Lenient Mode'}
                        </span>
                      </div>
                      {drive.requiresUniversityEmail && !drive.canTake && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-yellow-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm">
                            Requires verified university email (@mail.ljku.edu.in)
                          </span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleStartDrive(drive._id, drive.mode)}
                      disabled={loading || !drive.canTake}
                      className="ml-4 bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Play className="w-5 h-5" />
                      Start
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Exam Rules Modal */}
      <ExamRulesModal
        isOpen={showRulesModal}
        onAccept={handleAcceptRules}
        mode={pendingExamData?.mode || 'lenient'}
      />
    </Layout>
  );
}
