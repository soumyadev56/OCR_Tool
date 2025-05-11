import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';  // Add axios import

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    kpmgId: '',
    location: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simple validation to check if all fields are filled
    const allFieldsFilled = Object.values(formData).every(field => field !== '');
    if (!allFieldsFilled) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }
    
    try {
      // Make the API request
      const response = await axios.post('http://your-backend-api-url/register', formData);

      // Handle successful registration
      toast({
        title: "Success",
        description: "Registration successful",
      });
      navigate('/login');
    } catch (error) {
      // Handle errors during registration
      toast({
        title: "Error",
        description: "Something went wrong, please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

        <div className="bg-white p-8 rounded-md shadow-lg overflow-y-auto max-h-[80vh]">
          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl font-bold text-kpmg-blue mb-6 text-center">Register</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="designation" className="block text-gray-700 font-medium mb-1">Designation</label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.designation}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="department" className="block text-gray-700 font-medium mb-1">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="kpmgId" className="block text-gray-700 font-medium mb-1">KPMG ID</label>
                <input
                  id="kpmgId"
                  name="kpmgId"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.kpmgId}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="location" className="block text-gray-700 font-medium mb-1">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-kpmg-blue"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-kpmg-blue text-white font-medium py-3 rounded-md hover:bg-opacity-90 transition-colors mt-4"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Register'}
              </button>
              
              <div className="mt-4 text-center">
                <span className="text-gray-600">Already have a Account? </span>
                <Link to="/login" className="text-kpmg-blue hover:underline font-medium">
                  Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
