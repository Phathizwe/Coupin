// src/components/ui/hero/HeroSection.tsx
'use client'
import React from 'react'
import { HeroContent } from './HeroContent'
import { LogoCloud } from './LogoCloud'

export function HeroSection() {
    return (
        <main className="overflow-hidden">
            <HeroContent />
            <LogoCloud />
        </main>
    )
}