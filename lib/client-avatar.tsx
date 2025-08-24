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
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center bg-gray-100`}>
          <img
            src={client.image_url}
            alt={`${client.name} avatar`}
            className="object-contain"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-shrink-0 ${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full ${getClientAvatarColor(client.name)} flex items-center justify-center`}>
        <span className={`${textSizeClasses[size]} font-medium text-white`}>
          {client.name.charAt(0).toUpperCase()}
        </span>
      </div>
    </div>
  );
}
