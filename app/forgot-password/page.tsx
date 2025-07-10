"use client"
import { useState } from "react"
import { Mail, ArrowLeft, CheckCircle, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Enhanced email validation
    if (!email.trim()) {
      setError('Email address is required')
      return
    }
    
    if (!validateEmail(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    try {
      // In a real application, you would call your API here
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 
      //     'Content-Type': 'application/json',
      //     'Accept': 'application/json'
      //   },
      //   body: JSON.stringify({ email: email.trim().toLowerCase() }),
      // })
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // if (!response.ok) {
      //   const errorData = await response.json()
      //   throw new Error(errorData.message || 'Failed to process request')
      // }
      
      setSuccess(true)
    } catch (err) {
      setError('Unable to process your request. Please try again or contact support if the problem persists.')
      console.error('Password reset error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setSuccess(false)
    setEmail("")
    setError(null)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 before:content-[''] before:absolute before:inset-0 before:bg-[linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px)] before:bg-[length:40px_40px] before:opacity-70">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 15 }}
        className="relative z-10 w-full max-w-sm bg-white shadow-xl rounded-2xl overflow-hidden border border-dCblue/10"
      >
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex flex-col items-center space-y-3"
          >
            <Image 
              src="/logo2.png" 
              alt="Logo" 
              width={150} 
              height={50} 
              className="mb-2 object-contain"
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='60' viewBox='0 0 180 60'%3E%3Crect width='180' height='60' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' font-size='18' text-anchor='middle' fill='white' dominant-baseline='middle'%3ECompany%3C/text%3E%3C/svg%3E"
              }}
            />
            <h1 className="text-2xl font-bold text-dCblue">Reset Password</h1>
            <p className="text-dCblack/70 text-center text-sm">Enter your email to receive reset instructions</p>
          </motion.div>

          {success ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center space-y-4"
            >
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="flex justify-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </motion.div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-dCblue">
                  Check Your Email
                </h2>
                <p className="text-dCblack/70 text-sm">
                  We&apos;ve sent password reset instructions to:
                </p>
                <p className="text-dCblue font-medium text-sm">
                  {email}
                </p>
              </div>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <p className="text-dCblue/80 text-sm">
                  If you don&apos;t see the email in your inbox, please check your spam folder. 
                  The link will expire in 24 hours for security reasons.
                </p>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTryAgain}
                className="text-dCblue hover:text-dCorange text-sm font-medium transition-colors underline"
              >
                Try a different email address
              </motion.button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg flex items-start space-x-3 text-sm"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
              
              <motion.div 
                initial={{ x: -20, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dCblue/70 group-focus-within:text-dCorange transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-12 pr-3 py-2 rounded-lg border border-dCblue/30 focus:border-dCorange focus:ring-2 focus:ring-dCorange/30 transition duration-300 text-dCblack text-sm"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full py-2 bg-dCblue text-white rounded-lg hover:bg-dCorange group transition duration-300 flex items-center justify-center text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending Instructions...
                  </>
                ) : (
                  <>
                    Send Reset Instructions
                    <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
          )}

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Link 
              href="/signin" 
              className="inline-flex items-center text-sm text-dCblue hover:text-dCorange font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}