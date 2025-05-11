
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import KPMGLogo from '@/components/KPMGLogo';

const OtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    if (value.length > 1) {
      return; // Only allow one character
    }
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // On backspace, clear current field and move to previous
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Simple validation
      if (otp.some(digit => digit === '')) {
        toast({
          title: "Error",
          description: "Please enter the complete OTP",
          variant: "destructive",
        });
        return;
      }
      
      // For demo purposes
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
      navigate('/dashboard');
    }, 1000);
  };

  const handleResend = () => {
    if (timer === 0) {
      setTimer(60);
      toast({
        title: "Success",
        description: "OTP resent successfully",
      });
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-side">
        <KPMGLogo />
      </div>
      <div className="auth-form-side">
        <div className="auth-form">
          <h1 className="auth-heading">OTP Verification</h1>
          <p className="text-center text-gray-600 mb-6">
            Please enter the 4-digit code sent to your email/phone
          </p>
          <form onSubmit={handleSubmit}>
            <div className="flex justify-center gap-4 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength={1}
                  className="w-12 h-14 text-center text-xl border-2 border-gray-300 rounded-md focus:outline-none focus:border-kpmg-blue"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>
            
            <div className="mt-6">
              <button 
                type="submit" 
                className="primary-button"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Didn't receive code? {
                  timer > 0 ? 
                  <span>Resend in {timer}s</span> :
                  <span className="text-link cursor-pointer" onClick={handleResend}>Resend</span>
                }
              </p>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/login" className="text-link">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
