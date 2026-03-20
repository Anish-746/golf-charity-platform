'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

// Renamed to LoginFields to avoid collision with browser's built-in FormData
type LoginFields = z.infer<typeof loginSchema>

export default function LoginForm({ action }: { action: (formData: globalThis.FormData) => Promise<void> }) {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFields) => {
    setIsLoading(true)
    const formData = new globalThis.FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    await action(formData)
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
        <input {...register('email')} type="email" placeholder="john@example.com" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
        <input {...register('password')} type="password" placeholder="Your password" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors" />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>
      <button type="submit" disabled={isLoading} className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold py-3 px-6 rounded-lg transition-colors mt-2">
        {isLoading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  )
}