'use client';

import { useState, useEffect, useRef } from 'react';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';

interface AnimatedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  animateText?: string;
}

export default function AnimatedTextarea({ 
  value, 
  onChange, 
  placeholder, 
  className,
  animateText 
}: AnimatedTextareaProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayText, setDisplayText] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (animateText && animateText !== value) {
      setIsAnimating(true);
      setDisplayText(animateText);
      
      // Simulate typing effect
      let currentIndex = 0;
      const words = animateText.split(' ');
      
      const typeInterval = setInterval(() => {
        if (currentIndex < words.length) {
          const currentText = words.slice(0, currentIndex + 1).join(' ');
          onChange(currentText);
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsAnimating(false);
          onChange(animateText);
        }
      }, 100);

      return () => clearInterval(typeInterval);
    }
  }, [animateText]);

  if (isAnimating) {
    return (
      <div className={`${className} relative`}>
        <div className="absolute inset-0 p-4 pointer-events-none z-10">
          <TextGenerateEffect 
            words={animateText || ''} 
            className="font-mono text-sm text-white"
            duration={0.1}
          />
        </div>
        <textarea
          ref={textareaRef}
          value=""
          readOnly
          className={className}
          style={{ color: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}
