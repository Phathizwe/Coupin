// src/components/ui/hero/LoyaltyComponent.tsx
import React from 'react'

export function LoyaltyComponent() {
    return (
        <div className="relative space-y-3 rounded-[1rem] bg-white/5 p-4">
            <div className="flex items-center gap-1.5 text-orange-400">
                <LoyaltyIcon />
                <div className="text-sm font-medium">Loyalty Rewards</div>
            </div>
            <div className="space-y-3">
                <div className="text-foreground border-b border-white/10 pb-3 text-sm font-medium">
                    Your customers are returning more often with TYCA loyalty programs.
                </div>
                <div className="space-y-3">
                    <StatisticItem 
                        value="+28%" 
                        label="Return Rate" 
                        withTyca={true} 
                    />
                    <StatisticItem 
                        value="+42%" 
                        label="Customer Value" 
                        withTyca={false} 
                    />
                </div>
            </div>
        </div>
    )
}

function StatisticItem({ value, label, withTyca }: { value: string, label: string, withTyca: boolean }) {
    return (
        <div className="space-y-1">
            <div className="space-x-1">
                <span className="text-foreground align-baseline text-xl font-medium">{value}</span>
                <span className="text-muted-foreground text-xs">{label}</span>
            </div>
            {withTyca ? (
                <div className="flex h-5 items-center rounded bg-gradient-to-l from-emerald-400 to-indigo-600 px-2 text-xs text-white">
                    With TYCA
                </div>
            ) : (
                <div className="text-foreground bg-muted flex h-5 w-2/3 items-center rounded px-2 text-xs dark:bg-white/20">
                    Without TYCA
                </div>
            )}
        </div>
    )
}

function LoyaltyIcon() {
    return (
        <svg
            className="size-5"
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24">
            <path
                fill="currentColor"
                d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.87.59-1.41s-.23-1.06-.59-1.42M13 20.01L4 11V4h7v-.01l9 9z"
            />
            <circle
                fill="currentColor"
                cx="6.5"
                cy="6.5"
                r="1.5"
            />
        </svg>
    )
}