'use client'

import { useFormStatus } from 'react-dom'
import React from 'react'

interface SubmitButtonProps {
  children: React.ReactNode
  pendingText?: React.ReactNode
  className?: string
}

export function SubmitButton({ children, pendingText = 'Loading...', className }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2`}
    >
      {pending ? (
        <>
            <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}
