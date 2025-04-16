import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LoginUser, reset } from '../features/authSlice'
import logo from '../assets/IQlogo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { user, isError, isSuccess, isLoading, message } = useSelector((state) => state.auth);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData ({
  //     ...formData,
  //     [name]: value
  //   });
  // };

  useEffect(() => {
    if(user || isSuccess) {
      navigate('/dashboard');
      dispatch(reset());
    }
  }, [user, isSuccess, dispatch, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    dispatch(LoginUser({email, password}));
  };

  return (
    <div className="min-h-screen bg-white-100 flex flex-col items-center pt-16 px-4">
      {/* Form Card */}
      <div className="bg-white rounded-lg w-full max-w-md p-8">
        {/* Logo - moved inside the card */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="DompetIQ Logo" className="h-12" />
        </div>
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-8">Masuk Akun</h1>
        
        <form onSubmit={handleSubmit}>
          {isError && <p className='block text-sm text-gray-600 mb-2'>{message}</p>}
          {/* Email Field */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm text-gray-600 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          
          {/* Password Field */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm text-gray-600">Kata Sandi</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-500 flex items-center hover:text-green-500 transition duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                </svg>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition duration-300 mb-4"
          >
            {isLoading ? 'Loading...' : 'Masuk'}
          </button>
          
          {/* Terms of Service */}
          <p className="text-xs text-center text-gray-600 mb-6">
            By continuing, you agree to the <a href="#" className="text-gray-800 hover:text-green-500 transition duration-300">Terms of use</a> and <a href="#" className="text-gray-800 hover:text-green-500 transition duration-300">Privacy Policy</a>.
          </p>
        </form>
        
        {/* Register and Forgot Password Links */}
        <div className="flex justify-between text-sm">
          <Link to="/Register" className="text-gray-800 hover:text-green-500 transition duration-300 group">
            Belum Punya Akun?<br />
            <span className="font-semibold group-hover:underline">Daftar di sini</span>
          </Link>
          <Link to="/forgot-password" className="text-gray-800 hover:text-green-500 transition duration-300 hover:underline">
            Lupa Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;