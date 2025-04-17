import { ErrorMessage, Field, Formik } from 'formik'
import { Button } from 'primereact/button'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { useLoginUserMutation } from '../provider/queries/Auth.query'
import { toast } from 'sonner'
import ReCAPTCHA from "react-google-recaptcha"
import { motion } from 'framer-motion'
import { auth } from '../config/firebase'
import { GoogleAuthProvider, GithubAuthProvider, FacebookAuthProvider, signInWithPopup } from 'firebase/auth'
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa'

interface LoginFormValues {
  token: string;
  email: string;
  password: string;
}

const googleProvider = new GoogleAuthProvider()
const githubProvider = new GithubAuthProvider()
const facebookProvider = new FacebookAuthProvider()

const Login = () => {
  const [LoginUser] = useLoginUserMutation()
  const navigate = useNavigate()
  const RecaptchaRef = useRef<any>()

  const initialValues: LoginFormValues = {
    token: '',
    email: '',
    password: ''
  }

  const validationSchema = yup.object({
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup.string().min(5, "Password must be greater than 5 characters").required("Password is required"),
  })

  const OnSubmitHandler = async (values: LoginFormValues, { resetForm }: any) => {
    try {
      // Log the values being sent
      console.log('Submitting values:', values);

      const result = await LoginUser({
        email: values.email,
        password: values.password,
        token: values.token
      });

      // Log the entire result
      console.log('Login result:', result);

      if ('error' in result) {
        const error = result.error as any;
        console.error('Login error details:', error);
        
        // Check for specific error structures
        if (error.data?.message) {
          toast.error(error.data.message);
        } else if (error.status === 400) {
          toast.error("Invalid credentials");
        } else if (error.status === 401) {
          toast.error("Unauthorized access");
        } else {
          toast.error("Login failed. Please try again.");
        }
        return;
      }

      // If we have a successful response
      if (result.data) {
        console.log('Success response:', result.data);
        
        if (result.data.token) {
          localStorage.setItem("token", result.data.token);
          toast.success("Login successful!");
          resetForm();
          navigate("/");
        } else {
          console.error('No token in response:', result.data);
          toast.error("Login failed: No authentication token received");
        }
      } else {
        console.error('No data in response');
        toast.error("Login failed: No response data");
      }
    } catch (error) {
      // Log any unexpected errors
      console.error('Unexpected error during login:', error);
      toast.error("An unexpected error occurred");
    } finally {
      RecaptchaRef.current?.reset();
    }
  }

  const handleSocialLogin = async (provider: any, providerName: string) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();
      
      // Call your backend API with the Firebase token
      const response = await LoginUser({
        email: user.email,
        isSocialLogin: true,
        provider: providerName,
        token: idToken
      });

      if ('error' in response) {
        toast.error("Social login failed. Please try again.");
        return;
      }

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      console.error('Social login error:', error);
      toast.error(error.message || "Social login failed");
    }
  };

  // Add these handler functions
  const handleGoogleLogin = () => handleSocialLogin(googleProvider, 'google');
  const handleGithubLogin = () => handleSocialLogin(githubProvider, 'github');
  const handleFacebookLogin = () => handleSocialLogin(facebookProvider, 'facebook');

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <Formik 
          initialValues={initialValues} 
          validationSchema={validationSchema} 
          onSubmit={OnSubmitHandler}
        >
          {({ values, setFieldValue, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/90 shadow-2xl rounded-2xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>

              {/* Email/Password Form */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Field
                  id='email'
                  name='email'
                  type='email'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='Enter your email'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='email' />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Field
                  id='password'
                  name='password'
                  type='password'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='••••••••'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='password' />
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={RecaptchaRef}
                  sitekey={import.meta.env.VITE_SITE_KEY}
                  onChange={(token) => setFieldValue('token', token)}
                  theme="light"
                  className="transform scale-90 md:scale-100"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  type="submit"
                  disabled={!values.token}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ease-in-out
                    ${!values.token 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    }`}
                >
                  Sign In
                </Button>
              </motion.div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white transition-all duration-200"
                >
                  <FaGoogle className="text-xl text-red-500" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleGithubLogin}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white transition-all duration-200"
                >
                  <FaGithub className="text-xl" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleFacebookLogin}
                  className="flex items-center justify-center p-3 rounded-lg border border-gray-300 hover:border-gray-400 bg-white transition-all duration-200"
                >
                  <FaFacebook className="text-xl text-blue-600" />
                </motion.button>
              </div>

              <div className="space-y-4 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                    Create Account
                  </Link>
                </p>
                
                <Link to="/forgot-password" className="block text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                  Forgot Password?
                </Link>
              </div>
            </form>
          )}
        </Formik>
      </motion.div>
    </div>
  )
}

export default Login