// src/components/ui/hero/Logo.tsx
import React from 'react'
import { cn } from '../../../lib/utils'
import { BRAND } from '../../../constants/brandConstants'

export function Logo({ className }: { className?: string }) {
    return (
        <div className={cn('flex items-center', className)}>
            <img 
                src="/logo.png" 
                alt={BRAND.name + " logo"} 
                className="h-10 w-auto" 
            />
        </div>
    )
}