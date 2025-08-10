// src/components/ui/hero/HeroContent.tsx
import React, { useState } from 'react'
import { Mail, SendHorizonal } from 'lucide-react'
import { Button } from '../button'
import { AnimatedGroup } from '../animated-group'
import { LoyaltyComponent } from './LoyaltyComponent'
import { BRAND_MESSAGES } from '../../../constants/brandConstants'
import { heroTransitionVariants } from './hero-animation-utils'
import { useNavigate } from 'react-router-dom'
import { db } from '../../../firebase/config'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export function HeroContent() {
    return (
        <section>
            <div className="relative mx-auto max-w-6xl px-6 pt-32 lg:pb-16 lg:pt-48">
                <div className="relative z-10 mx-auto max-w-4xl text-center">
                    <AnimatedGroup
                        variants={{
                            container: {
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
                                    },
                                },
                            },
                            item: heroTransitionVariants.item,
                        }}
                    >
                        <h1 className="text-balance text-4xl font-medium sm:text-5xl md:text-6xl">
                            {BRAND_MESSAGES.value.retention}
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg">
                            {BRAND_MESSAGES.value.loyalty}
                        </p>
                        <EmailSubscribeForm />
                        <HeroVisual />
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}

function EmailSubscribeForm() {
    const [email, setEmail] = useState('')
    const navigate = useNavigate()

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email || !email.includes('@')) {
            return // Basic validation
        }

        try {
            console.log("Submitting email:", email);
            
            // Store the email and timestamp in Firestore
            await addDoc(collection(db, 'leadCapture'), {
                email,
                timestamp: serverTimestamp(),
                source: 'hero_form',
                completed: false
            }).catch(error => {
                console.error("Error adding document to Firestore:", error);
            });

            console.log("Email stored, redirecting to register page");
            
            // Directly navigate to register page with email pre-populated and business type selected
            window.location.href = `/register?email=${encodeURIComponent(email)}&type=business`;
        } catch (error) {
            console.error('Error in form submission:', error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-12 mx-auto max-w-sm">
            <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] pr-1.5 items-center rounded-[1rem] border shadow shadow-zinc-950/5 has-[input:focus]:ring-2 lg:pr-0">
                <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />
                <input
                    placeholder="Your email address"
                    className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                />
                <div className="md:pr-1.5 lg:pr-0">
                    <Button
                        type="submit"
                        aria-label="submit"
                        size="sm"
                        variant="default"
                        className="rounded-[0.5rem] bg-primary-700 hover:bg-primary-600 text-white">
                        <span className="hidden md:block">Get Started</span>
                        <SendHorizonal
                            className="relative mx-auto size-5 md:hidden"
                            strokeWidth={2}
                        />
                    </Button>
                </div>
            </div>
        </form>
    )
}

function HeroVisual() {
    return (
        <div
            aria-hidden
            className="bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-32 max-w-2xl to-transparent to-55% text-left"
        >
            <div className="bg-background border-border/50 absolute inset-0 mx-auto w-80 -translate-x-3 -translate-y-12 rounded-[2rem] border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                <div className="relative h-96 overflow-hidden rounded-[1.5rem] border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--border),var(--border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
            </div>
            <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-80 translate-x-4 rounded-[2rem] border p-2 backdrop-blur-3xl [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                <div className="bg-background space-y-2 overflow-hidden rounded-[1.5rem] border p-2 shadow-xl dark:bg-white/5 dark:shadow-black dark:backdrop-blur-3xl">
                    <LoyaltyComponent />
                    <div className="bg-muted rounded-[1rem] p-4 pb-16 dark:bg-white/5"></div>
                </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5" />
        </div>
    )
}