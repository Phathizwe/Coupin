import React from 'react';
import { EmotionalChartContainer } from './EmotionalAnimations';
import './emotionalDesign.css';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  height?: string;
  index?: number;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ 
  title, 
  children, 
  height = 'h-64',
  index = 0
}) => {
  return (
    <EmotionalChartContainer
      title={title}
      index={index}
      className="transition-all duration-300"
    >
      <div className={`${height} flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden`}>
        {children}
      </div>
    </EmotionalChartContainer>
  );
};

export default ChartContainer;