import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose, onSwitchToSignup }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const result = await login(formData);

      if (result.success) {
        console.log("Logged in:", result.data);
        onClose(); // Close modal on success
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  const handleGoogleResponse = (response) => {
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
          console.log("Google login success:", data);
          onClose(); // Close modal on success
        } else {
          setError(data.message || "Google login failed");
        }
      })
      .catch(() => setError("Google login failed"));
  };

  useEffect(() => {
    if (isOpen && window.google) {
      // Small delay to ensure DOM element exists
      setTimeout(() => {
        const googleDiv = document.getElementById("googleSignInDiv");
        if (googleDiv) {
          google.accounts.id.initialize({
            client_id: "292576736578-g02qvp9ss7qj3jht2ghso1aqgoil22gp.apps.googleusercontent.com",
            callback: handleGoogleResponse,
          });

          google.accounts.id.renderButton(googleDiv, { 
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
      setFormData({ email: '', password: '' });
      setError("");
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
          className="relative w-full max-w-md mx-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>

          <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-400 mb-6 text-center">Login</h2>

          {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="username@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 rounded-lg text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="text-center text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
              Forgot Password?
            </div>
            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Sign in
            </button>

            <div className="flex items-center justify-center my-4 text-gray-500 dark:text-gray-400">
              <span className="border-t border-gray-400 dark:border-gray-600 w-full"></span>
              <span className="px-3 text-sm whitespace-nowrap">or continue with</span>
              <span className="border-t border-gray-400 dark:border-gray-600 w-full"></span>
            </div>

            <div className="flex justify-center mt-4">
              <div className="rounded-full overflow-hidden w-12 h-12 shadow-md hover:shadow-lg transition-shadow bg-white flex items-center justify-center">
                <div id="googleSignInDiv" className="w-10 h-10"></div>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-center mt-6 text-sm">
              Don't have an account?
              <button
                type="button"
                onClick={onSwitchToSignup}
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1 font-medium"
              >
                Sign up for free
              </button>
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
