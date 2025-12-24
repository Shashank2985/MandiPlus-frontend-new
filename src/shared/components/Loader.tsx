import React from 'react';

interface LoaderProps {
    size?: number;        // diameter in px
    color?: string;       // tailwind color class
    className?: string;   // extra styles
}

const Loader: React.FC<LoaderProps> = ({
    size = 40,
    color = 'border-purple-600',
    className = '',
}) => {
    return (
        <div
            className={`flex items-center justify-center ${className}`}
            role="status"
            aria-label="loading"
        >
            <div
                className={`
          animate-spin
          rounded-full
          border-4
          border-gray-200
          ${color}
          border-t-transparent
        `}
                style={{
                    width: size,
                    height: size,
                }}
            />
        </div>
    );
};

export default Loader;
