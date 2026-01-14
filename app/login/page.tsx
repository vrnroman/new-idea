'use client'

import { useActionState, useState } from 'react'
import { login, signup } from './actions'
import { SubmitButton } from '../components/SubmitButton'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-lg shadow-md dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  )
}

function LoginForm() {
  const [state, action] = useActionState(login, null)
  return (
    <form action={action} className="space-y-6">
       {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input type="email" name="email" required className="w-full mt-1 p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input type="password" name="password" required className="w-full mt-1 p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
      </div>
      <SubmitButton
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-500"
        pendingText="Signing in..."
      >
        Sign in
      </SubmitButton>
    </form>
  )
}

function SignupForm() {
  const [state, action] = useActionState(signup, null)
  return (
    <form action={action} className="space-y-6">
       {state?.error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md dark:bg-red-900/20">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input type="email" name="email" required className="w-full mt-1 p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input type="password" name="password" required className="w-full mt-1 p-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700" />
      </div>
       <SubmitButton
        className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-500"
        pendingText="Signing up..."
      >
        Sign up
      </SubmitButton>
    </form>
  )
}
