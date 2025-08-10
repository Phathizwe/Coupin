import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function BentoGrid({
  className,
  children,
  ...props
}: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  name: string;
  description: string;
  Icon: React.ElementType;
  href?: string;
  cta?: string;
  background?: React.ReactNode;
}

export function BentoCard({
  className,
  name,
  description,
  Icon,
  href,
  cta = "Learn more",
  background,
  ...props
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black dark:border-white/[0.2] bg-white border border-transparent justify-between flex flex-col space-y-4 relative overflow-hidden",
        className
      )}
      {...props}
    >
      {background && <div className="absolute inset-0 z-0">{background}</div>}
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="p-2 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <h3 className="mt-4 font-bold text-lg text-gray-900 dark:text-white">{name}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{description}</p>
      </div>
      {href && (
        <div className="relative z-10">
          <Button
            variant="outline"
            size="sm"
            className="border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950/50"
            asChild
          >
            <a href={href}>{cta}</a>
          </Button>
        </div>
      )}
    </div>
  );
}