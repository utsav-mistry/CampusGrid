import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Clock, AlertTriangle, CheckCircle, Code, Shield, Eye } from 'lucide-react';

export default function TakeExam() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [mouseLeft, setMouseLeft] = useState(false);
  const [copyPasteAttempts, setCopyPasteAttempts] = useState(0);
  const [rightClickAttempts, setRightClickAttempts] = useState(0);
  const fullscreenRef = useRef(null);
  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    // Enter fullscreen
    if (fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen().catch(err => {
        console.error('Fullscreen error:', err);
      });
    }

    // Load exam data from localStorage (set by ExamCenter)
    const storedExam = localStorage.getItem(`exam_${attemptId}`);
    if (storedExam) {
      const data = JSON.parse(storedExam);
      setExamData(data);
      setTimeLeft(data.duration * 60); // Convert to seconds
      setLoading(false);
    } else {
      // If not in localStorage, redirect back
      navigate('/student/exam-center');
    }

    // ULTRA-STRICT EXAM RULES
    
    // 1. Fullscreen enforcement (no grace period in strict mode)
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        const gracePeriod = examData?.mode === 'strict' ? 0 : 2000;
        setTimeout(() => {
          if (!document.fullscreenElement) {
            reportViolation('fullscreen_exit');
          }
        }, gracePeriod);
      }
    };

    // 2. Tab/Window visibility detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportViolation('tab_switch');
      }
    };

    // 3. Window blur detection (switching to another app)
    const handleWindowBlur = () => {
      setIsFocused(false);
      reportViolation('window_blur');
    };

    const handleWindowFocus = () => {
      setIsFocused(true);
    };

    // 4. Mouse leave detection (moving cursor outside exam window)
    const handleMouseLeave = () => {
      setMouseLeft(true);
      if (examData?.mode === 'strict') {
        reportViolation('mouse_leave');
      }
    };

    const handleMouseEnter = () => {
      setMouseLeft(false);
    };

    // 5. Copy/Paste detection
    const handleCopy = (e) => {
      e.preventDefault();
      setCopyPasteAttempts(prev => prev + 1);
      if (copyPasteAttempts >= 2) {
        reportViolation('copy_attempt');
      }
    };

    const handlePaste = (e) => {
      e.preventDefault();
      setCopyPasteAttempts(prev => prev + 1);
      if (copyPasteAttempts >= 2) {
        reportViolation('paste_attempt');
      }
    };

    // 6. Right-click detection
    const handleContextMenu = (e) => {
      e.preventDefault();
      setRightClickAttempts(prev => prev + 1);
      if (rightClickAttempts >= 2) {
        reportViolation('right_click');
      }
    };

    // 7. Keyboard shortcuts detection
    const handleKeyDown = (e) => {
      // Block common cheating shortcuts
      const forbidden = [
        (e.ctrlKey || e.metaKey) && e.key === 'c', // Copy
        (e.ctrlKey || e.metaKey) && e.key === 'v', // Paste
        (e.ctrlKey || e.metaKey) && e.key === 'x', // Cut
        (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I', // DevTools
        (e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J', // Console
        (e.ctrlKey || e.metaKey) && e.key === 'u', // View source
        e.key === 'F12', // DevTools
        e.altKey && e.key === 'Tab', // Alt+Tab
      ];

      if (forbidden.some(condition => condition)) {
        e.preventDefault();
        reportViolation('keyboard_shortcut');
      }

      // Update last activity
      lastActivityRef.current = Date.now();
    };

    // 8. Inactivity detection (5 minutes)
    const checkInactivity = setInterval(() => {
      const inactive = Date.now() - lastActivityRef.current;
      if (inactive > 5 * 60 * 1000) { // 5 minutes
        reportViolation('inactivity');
      }
    }, 60000); // Check every minute

    // 9. Print screen detection (best effort)
    const handleKeyUp = (e) => {
      if (e.key === 'PrintScreen') {
        reportViolation('screenshot_attempt');
      }
    };

    // Attach all event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearInterval(checkInactivity);
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
  }, [attemptId, navigate, examData, copyPasteAttempts, rightClickAttempts]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinishExam();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const reportViolation = async (type) => {
    try {
      const response = await api.post('/exams/violation', {
        attemptId,
        violationType: type,
      });

      if (response.data.data.banned) {
        alert('You have been banned from this exam due to violations.');
        navigate('/student/exam-center');
      } else if (response.data.data.warning) {
        setViolations(prev => prev + 1);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      }
    } catch (error) {
      console.error('Failed to report violation:', error);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Submit answer to backend
    try {
      await api.post('/exams/submit', {
        attemptId,
        questionId,
        answer,
      });
    } catch (error) {
      console.error('Failed to submit answer:', error);
    }
  };

  const handleFinishExam = async () => {
    setSubmitting(true);
    try {
      const response = await api.post('/exams/finish', { attemptId });
      localStorage.removeItem(`exam_${attemptId}`);
      
      // Navigate to results page with data
      navigate('/student/exam-center', {
        state: { results: response.data.data }
      });
    } catch (error) {
      console.error('Failed to finish exam:', error);
      alert('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-gray-50">
      {/* Warning Banner */}
      {showWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-3 text-center font-medium z-50 animate-pulse">
          <AlertTriangle className="inline w-5 h-5 mr-2" />
          Warning! Violation detected. Next violation will result in exam termination.
        </div>
      )}

      {/* Monitoring Indicators */}
      <div className="fixed top-4 right-4 flex flex-col gap-2 z-40">
        {/* Fullscreen Status */}
        <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
          document.fullscreenElement ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Shield className="w-4 h-4" />
          {document.fullscreenElement ? 'Fullscreen Active' : 'Fullscreen Required'}
        </div>

        {/* Focus Status */}
        {!isFocused && (
          <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-500 text-white animate-pulse">
            <Eye className="w-4 h-4" />
            Window Not Focused
          </div>
        )}

        {/* Mouse Status */}
        {mouseLeft && examData?.mode === 'strict' && (
          <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-orange-500 text-white">
            <AlertTriangle className="w-4 h-4" />
            Mouse Outside Window
          </div>
        )}

        {/* Violation Counter */}
        {violations > 0 && (
          <div className="px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 bg-red-600 text-white">
            <AlertTriangle className="w-4 h-4" />
            {violations} Violation(s)
          </div>
        )}
      </div>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {examData.title || `${examData.level} Exam`}
            </h1>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {examData.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            {violations > 0 && (
              <div className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">{violations} Warning(s)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Question */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Code'}
              </span>
              <span className="text-sm text-gray-600">
                {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
              </span>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Answer Input */}
          {currentQuestion.type === 'mcq' ? (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion._id] === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion._id}
                    value={option}
                    checked={answers[currentQuestion._id] === option}
                    onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                    className="mr-3"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <Code className="w-4 h-4" />
                <span>Language: {currentQuestion.language}</span>
              </div>
              <textarea
                value={answers[currentQuestion._id] || currentQuestion.codeTemplate || ''}
                onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Write your code here..."
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {examData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 text-white'
                      : answers[examData.questions[index]._id]
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === examData.questions.length - 1 ? (
              <button
                onClick={handleFinishExam}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {submitting ? 'Submitting...' : 'Finish Exam'}
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(examData.questions.length - 1, prev + 1))}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
