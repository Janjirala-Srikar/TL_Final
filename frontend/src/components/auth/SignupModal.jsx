import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function SignupModal({ isOpen, onClose, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await register(formData);

      if (result.success) {
        console.log("Signed up:", result.data);
        onClose(); // Close modal on success
      } else {
        setError(result.error || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong");
    }
  };

  // Google Sign-up logic
  useEffect(() => {
    const handleCredentialResponse = (response) => {
      const idToken = response.credential;

      fetch("http://localhost:5000/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: idToken }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.token) {
            localStorage.setItem("token", data.token);
            onClose(); // Close modal on success
          } else {
            setError(data.message || "Google sign-up failed");
          }
        })
        .catch(() => setError("Google sign-up failed"));
    };

    if (isOpen && window.google) {
      // Small delay to ensure DOM element exists
      setTimeout(() => {
        const googleDiv = document.getElementById("googleSignupDiv");
        if (googleDiv) {
          window.google.accounts.id.initialize({
            client_id: "292576736578-g02qvp9ss7qj3jht2ghso1aqgoil22gp.apps.googleusercontent.com",
            callback: handleCredentialResponse,
          });

          window.google.accounts.id.renderButton(googleDiv, { 
            theme: "outline", 
            size: "large" 
          });
        }
      }, 100);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md mx-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20 max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-6 text-center">Sign Up</h2>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username@gmail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Create account
            </button>

            <div className="flex items-center justify-center my-4 text-gray-500 dark:text-gray-400">
              <span className="border-t border-gray-400 dark:border-gray-600 w-full"></span>
              <span className="px-3 text-sm whitespace-nowrap">or continue with</span>
              <span className="border-t border-gray-400 dark:border-gray-600 w-full"></span>
            </div>

            {/* Google Sign-Up Button */}
            <div className="flex justify-center mt-4">
              <div className="rounded-full overflow-hidden w-12 h-12 shadow-md hover:shadow-lg transition-shadow bg-white flex items-center justify-center">
                <div id="googleSignupDiv" className="w-10 h-10"></div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-center mt-6 text-sm">
              Already have an account?
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
