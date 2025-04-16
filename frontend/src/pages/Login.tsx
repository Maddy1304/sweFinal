import { ErrorMessage, Field, Formik } from 'formik'
import { Button } from 'primereact/button'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { useLoginUserMutation } from '../provider/queries/Auth.query'
import { toast } from 'sonner'
import ReCAPTCHA from "react-google-recaptcha"
import { motion } from 'framer-motion'

const Login = () => {
  const [LoginUser, LoginUserResponse] = useLoginUserMutation()
  const navigate = useNavigate()
  const RecaptchaRef = useRef<any>()

  type User = {
    token: string,
    email: string,
    password: string
  }

  const initialValues: User = {
    token: '',
    email: '',
    password: ''
  }

  const validationSchema = yup.object({
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup.string().min(5, "Password must be greater than 5 characters").required("Password is required"),
  })

  const OnSubmitHandler = async (e: User, { resetForm }: any) => {
    try {
      const { data, error }: any = await LoginUser(e)
      if (error) {
        toast.error(error.data.message)
        return
      }
      localStorage.setItem("token", data.token)
      resetForm()
      navigate("/")
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      RecaptchaRef.current.reset()
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 animate-gradient'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={OnSubmitHandler}>
          {({ values, setFieldValue, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/90 shadow-2xl rounded-2xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Field
                  id='email'
                  name='email'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='Enter your email'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='email' />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Field
                  name='password'
                  type='password'
                  id='password'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='••••••••'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='password' />
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={RecaptchaRef}
                  sitekey={import.meta.env.VITE_SITE_KEY}
                  onChange={(e) => { setFieldValue('token', e) }}
                  theme="light"
                  className="transform scale-90 md:scale-100"
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Button
                  disabled={!values.token}
                  loading={LoginUserResponse.isLoading}
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ease-in-out
                    ${!values.token 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl'
                    }`}
                >
                  Sign In
                </Button>
              </motion.div>

              <div className="space-y-4 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
                    Create Account
                  </Link>
                </p>
                
                <Link to="#" className="block text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200">
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