
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Simple validation
      if (!username || !password) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive",
        });
        return;
      }
      
      // For demo purposes - normally would validate with a real backend
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-kpmg-blue flex items-center justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full max-w-5xl">
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-xs">
            <div className="flex justify-center">
              <div className="grid grid-cols-2 gap-1">
                <div className="w-14 h-14 border-2 border-white"></div>
                <div className="w-14 h-14 border-2 border-white"></div>
                <div className="w-14 h-14 border-2 border-white"></div>
                <div className="w-14 h-14 border-2 border-white"></div>
              </div>
            </div>
            <div className="text-white text-center text-6xl font-bold mt-4">KPMG</div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-md shadow-lg">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-kpmg-blue mb-8 text-center">Login</h1>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 font-medium mb-2">Username</label>
                <input
                  id="username"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="mb-2">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">Password</label>
                <input
                  id="password"
                  type="password"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end mb-4">
                <Link to="/forgot-password" className="text-kpmg-blue hover:underline text-sm">
                  Forgot Password?
                </Link>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-kpmg-blue text-white font-medium py-3 rounded-md hover:bg-opacity-90 transition-colors"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-600">Not a Member? </span>
                <Link to="/register" className="text-kpmg-blue hover:underline font-medium">
                  Register
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
