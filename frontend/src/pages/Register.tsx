import { ErrorMessage, Field, Formik } from 'formik'
import { Button } from 'primereact/button'
import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import { useRegisterUserMutation } from '../provider/queries/Auth.query'
import { toast } from 'sonner'
import ReCAPTCHA from 'react-google-recaptcha'
import { motion } from 'framer-motion'

const Register = () => {
  const [registerUser, registerUserResponse] = useRegisterUserMutation()
  const navigate = useNavigate()
  const RecaptchaRef = useRef<any>()

  type User = {
    token: string
    name: string
    email: string
    password: string
  }

  const initialValues: User = {
    name: '',
    token: '',
    email: '',
    password: ''
  }

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Email must be valid").required("Email is required"),
    password: yup.string().min(5, "Password must be greater than 5 characters").required("Password is required"),
  })

  const OnSubmitHandler = async (e: User, { resetForm }: any) => {
    try {
      const { data, error }: any = await registerUser(e)
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
    <div className='min-h-screen flex items-center justify-center w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6"
      >
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={OnSubmitHandler}>
          {({ values, setFieldValue, handleSubmit }) => (
            <form onSubmit={handleSubmit} className="backdrop-blur-lg bg-white/90 shadow-2xl rounded-2xl p-8 space-y-6">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Create Account</h2>
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                <Field
                  id='name'
                  name='name'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='Enter your name'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='name' />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <Field
                  id='email'
                  name='email'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 ease-in-out'
                  placeholder='Enter your email'
                />
                <ErrorMessage component={'p'} className='text-red-500 text-sm mt-1' name='email' />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <Field
                  name='password'
                  id='password'
                  type='password'
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-200 ease-in-out'
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
                  loading={registerUserResponse.isLoading}
                  type='submit'
                  className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ease-in-out
                    ${!values.token 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                >
                  Create Account
                </Button>
              </motion.div>

              <p className="text-center text-gray-600 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </Formik>
      </motion.div>
    </div>
  )
}

export default Register