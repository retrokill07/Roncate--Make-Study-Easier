import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { Logo } from './Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userProfile: any) => void;
}

type UserType = 'school' | 'college';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('school');
  
  // School Specific
  const [standard, setStandard] = useState(''); // Class/Grade

  // College Specific
  const [collegeName, setCollegeName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Display Name
        await updateProfile(user, { displayName: name });

        // 3. Prepare Profile Data
        const profileData: any = {
          uid: user.uid,
          email: user.email,
          name: name,
          userType: userType,
          createdAt: Date.now(),
        };

        if (userType === 'school') {
          profileData.standard = standard;
        } else {
          profileData.collegeName = collegeName;
          profileData.branch = branch;
          profileData.year = year;
        }

        // 4. Save to Firestore
        await setDoc(doc(db, "users", user.uid), profileData);
        onLoginSuccess(profileData);

      } else {
        // Login Logic
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Note: In a real app, you would fetch the user profile from Firestore here
        // For now, we pass basic info
        onLoginSuccess({ 
          uid: userCredential.user.uid, 
          email: userCredential.user.email,
          name: userCredential.user.displayName 
        });
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-center">
          <div className="flex justify-center mb-2 text-white">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-white">{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-indigo-100 text-sm">
            {isSignup ? 'Start your adaptive learning journey' : 'Login to access your dashboard'}
          </p>
        </div>

        {/* Form Scrollable Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">I am a Student at:</label>
                <div className="flex gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setUserType('school')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                      userType === 'school'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    School
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('college')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition ${
                      userType === 'college'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    College
                  </button>
                </div>

                {userType === 'school' ? (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class / Grade</label>
                    <select
                      required
                      value={standard}
                      onChange={(e) => setStandard(e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Grade</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i + 1}>Class {i + 1}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">College / University Name</label>
                      <input
                        type="text"
                        required
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        placeholder="e.g. MIT"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Branch / Major</label>
                        <input
                          type="text"
                          required
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          placeholder="e.g. CS"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                        <select
                          required
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="">Select</option>
                          <option value="1">1st Year</option>
                          <option value="2">2nd Year</option>
                          <option value="3">3rd Year</option>
                          <option value="4">4th Year</option>
                          <option value="5+">5+ Year</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Login')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600 dark:text-slate-400">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isSignup ? 'Login' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
        
        {/* Footer Close */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center">
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-sm">
                Cancel
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;