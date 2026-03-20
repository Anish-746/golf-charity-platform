'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain one uppercase letter').regex(/[0-9]/, 'Must contain one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

// Renamed from FormData → SignupFields to avoid collision with browser's built-in FormData
type SignupFields = z.infer<typeof signupSchema>

// The action prop explicitly uses the browser's native FormData (globalThis.FormData)
export default function SignupForm({ action }: { action: (formData: globalThis.FormData) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFields) => {
    setIsLoading(true)
    // Build a native FormData object to pass to the server action
    const formData = new globalThis.FormData()
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    formData.append('password', data.password)
    await action(formData)
    setIsLoading(false)
  }

  // Note: all classNames are now single-line strings — fixes the hydration error
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
        <input {...register('fullName')} type="text" placeholder="John Smith" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
        <input {...register('email')} type="email" placeholder="john@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
        <input {...register('password')} type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
        <input {...register('confirmPassword')} type="password" placeholder="Repeat your password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>
      <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors mt-2">
        {isLoading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}