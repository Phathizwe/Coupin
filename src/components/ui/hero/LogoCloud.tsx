// src/components/ui/hero/LogoCloud.tsx
import React from 'react'
import { InfiniteSlider } from '../infinite-slider'
import { ProgressiveBlur } from '../progressive-blur'

export function LogoCloud() {
    return (
        <section className="bg-background pb-16 md:pb-32">
            <div className="group relative m-auto max-w-6xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="inline md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm">Trusted by local businesses</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            duration={40}
                            gap={112}>
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                alt="Yoco Logo"
                                height="20"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/column.svg"
                                alt="SnapScan Logo"
                                height="16"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/github.svg"
                                alt="Zapper Logo"
                                height="16"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/nike.svg"
                                alt="Local Business Logo"
                                height="20"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/lemonsqueezy.svg"
                                alt="South African Business Logo"
                                height="20"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/laravel.svg"
                                alt="Local Shop Logo"
                                height="16"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/lilly.svg"
                                alt="Cape Town Business Logo"
                                height="28"
                            />
                            <PartnerLogo 
                                src="https://html.tailus.io/blocks/customers/openai.svg"
                                alt="Johannesburg Business Logo"
                                height="24"
                            />
                        </InfiniteSlider>
                        <SliderGradients />
                    </div>
                </div>
            </div>
        </section>
    )
}

function PartnerLogo({ src, alt, height }: { src: string, alt: string, height: string }) {
    return (
        <div className="flex">
            <img
                className={`mx-auto h-${height === '28' ? '7' : height === '24' ? '6' : height === '20' ? '5' : '4'} w-fit dark:invert`}
                src={src}
                alt={alt}
                height={height}
                width="auto"
            />
        </div>
    )
}

function SliderGradients() {
    return (
        <>
            <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
            <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
            <ProgressiveBlur
                className="pointer-events-none absolute left-0 top-0 h-full w-20"
                direction="left"
                blurIntensity={1}
            />
            <ProgressiveBlur
                className="pointer-events-none absolute right-0 top-0 h-full w-20"
                direction="right"
                blurIntensity={1}
            />
        </>
    )
}