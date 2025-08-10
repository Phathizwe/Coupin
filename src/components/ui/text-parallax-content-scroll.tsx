import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { BRAND, BRAND_COLORS, BRAND_MESSAGES } from "../../constants/brandConstants";
import Logo from "./Logo";

export const TextParallaxContentExample = () => {
  return (
    <div className="bg-white mt-0 pt-0">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading={BRAND.tagline}
        heading="Built for South African businesses."
        bgOverlayColor="bg-primary-700/70"
      >
        <ExampleContent 
          title="Grow your business with loyal customers"
          description={BRAND_MESSAGES.value.loyalty}
          buttonText="Learn more about TYCA"
          buttonLink="/about"
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Customer Retention"
        heading={BRAND_MESSAGES.value.retention}
        bgOverlayColor="bg-secondary-600/70"
      >
        <ExampleContent 
          title="Keep your customers coming back"
          description="Our proven strategies help local businesses increase customer retention by up to 40%, turning first-time visitors into loyal regulars."
          buttonText="See our features"
          buttonLink="/features"
        />
      </TextParallaxContent>
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1504610926078-a1611febcad3?q=80&w=2416&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Local Solutions"
        heading="Made for South Africa."
        bgOverlayColor="bg-accent-700/70"
      >
        <ExampleContent 
          title="Local payment methods & support"
          description="Integrate with popular South African payment providers like Yoco, SnapScan, and Zapper to provide a seamless experience for your customers."
          buttonText="Get started for free"
          buttonLink="/register"
        />
      </TextParallaxContent>
    </div>
  );
};

const IMG_PADDING = 12;

interface TextParallaxContentProps {
  imgUrl: string;
  subheading: string;
  heading: string;
  bgOverlayColor?: string;
  children: React.ReactNode;
}

const TextParallaxContent: React.FC<TextParallaxContentProps> = ({ 
  imgUrl, 
  subheading, 
  heading, 
  bgOverlayColor = "bg-neutral-950/70",
  children 
}) => {
  return (
    <div
      style={{
        paddingLeft: IMG_PADDING,
        paddingRight: IMG_PADDING,
      }}
      className="mb-16"
    >
      <div className="relative h-[150vh]">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy 
          heading={heading} 
          subheading={subheading} 
          bgOverlayColor={bgOverlayColor}
        />
      </div>
      {children}
    </div>
  );
};

interface StickyImageProps {
  imgUrl: string;
}

const StickyImage: React.FC<StickyImageProps> = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  
  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl"
    >
      {/* This div intentionally left empty for the background image */}
    </motion.div>
  );
};

interface OverlayCopyProps {
  subheading: string;
  heading: string;
  bgOverlayColor: string;
}

const OverlayCopy: React.FC<OverlayCopyProps> = ({ subheading, heading, bgOverlayColor }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);
  
  return (
    <>
      <motion.div
        className={`absolute inset-0 ${bgOverlayColor}`}
        style={{
          opacity,
        }}
      />
      <motion.div
        style={{
          y,
          opacity,
        }}
        ref={targetRef}
        className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white"
      >
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Logo variant="white" className="h-16 md:h-20" />
          </div>
          <p className="mb-2 text-center text-xl md:mb-4 md:text-3xl">
            {subheading}
          </p>
          <p className="text-center text-4xl font-bold md:text-7xl">{heading}</p>
        </div>
      </motion.div>
    </>
  );
};

interface ExampleContentProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const ExampleContent: React.FC<ExampleContentProps> = ({ 
  title, 
  description, 
  buttonText, 
  buttonLink 
}) => (
  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 pb-24 pt-12 md:grid-cols-12">
    <h2 className="col-span-1 text-3xl font-bold text-primary-800 md:col-span-4">
      {title}
    </h2>
    <div className="col-span-1 md:col-span-8">
      <p className="mb-4 text-xl text-gray-600 md:text-2xl">
        {description}
      </p>
      <a 
        href={buttonLink}
        className="inline-flex w-full items-center justify-center rounded bg-primary-700 px-9 py-4 text-xl text-white transition-colors hover:bg-primary-600 md:w-fit"
      >
        {buttonText} 
        <span className="ml-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="h-5 w-5"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </span>
      </a>
    </div>
  </div>
);

export default TextParallaxContent;