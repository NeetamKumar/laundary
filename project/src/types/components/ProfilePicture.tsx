import React from 'react';
import { UserCircle } from 'lucide-react';

interface ProfilePictureProps {
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePicture({ src, size = 'md', className = '' }: ProfilePictureProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-24 w-24'
  };

  if (!src) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 rounded-full flex items-center justify-center`}>
        <UserCircle className={`${size === 'lg' ? 'h-16 w-16' : 'h-6 w-6'} text-gray-400`} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt="Profile"
      className={`${sizeClasses[size]} ${className} rounded-full object-cover`}
    />
  );
}