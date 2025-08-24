import React from 'react';

// Color palette for client avatars
const avatarColors = [
  'bg-red-500',
  'bg-blue-500', 
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-lime-500'
];

// Function to generate consistent color for a client based on their name
export function getClientAvatarColor(clientName: string): string {
  const hash = clientName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

interface ClientAvatarProps {
  client: {
    name: string;
    image_url?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ClientAvatar({ client, size = 'md', className = '' }: ClientAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  if (client.image_url) {
    return (
      <div className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}>
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100`}>
          <img
            src={client.image_url}
            alt={`${client.name} avatar`}
            className="w-full h-full object-contain"
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
        style={{
          backgroundColor: getClientAvatarColor(client.name) === 'bg-rose-500' ? '#f43f5e' : 
                           getClientAvatarColor(client.name) === 'bg-blue-500' ? '#3b82f6' :
                           getClientAvatarColor(client.name) === 'bg-green-500' ? '#22c55e' :
                           getClientAvatarColor(client.name) === 'bg-yellow-500' ? '#eab308' :
                           getClientAvatarColor(client.name) === 'bg-purple-500' ? '#a855f7' :
                           getClientAvatarColor(client.name) === 'bg-pink-500' ? '#ec4899' :
                           getClientAvatarColor(client.name) === 'bg-indigo-500' ? '#6366f1' :
                           getClientAvatarColor(client.name) === 'bg-teal-500' ? '#14b8a6' :
                           getClientAvatarColor(client.name) === 'bg-orange-500' ? '#f97316' :
                           getClientAvatarColor(client.name) === 'bg-cyan-500' ? '#06b6d4' :
                           getClientAvatarColor(client.name) === 'bg-emerald-500' ? '#10b981' :
                           getClientAvatarColor(client.name) === 'bg-violet-500' ? '#8b5cf6' :
                           getClientAvatarColor(client.name) === 'bg-sky-500' ? '#0ea5e9' :
                           getClientAvatarColor(client.name) === 'bg-lime-500' ? '#84cc16' :
                           getClientAvatarColor(client.name) === 'bg-red-500' ? '#ef4444' : '#f43f5e',
          width: size === 'md' ? '40px' : size === 'sm' ? '32px' : '48px',
          height: size === 'md' ? '40px' : size === 'sm' ? '32px' : '48px'
        }}
      >
        <span className={`${textSizeClasses[size]} font-medium text-white`}>
          {client.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
