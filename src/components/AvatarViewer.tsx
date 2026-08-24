import React from 'react';
import { AvatarConfig } from '../types';

interface AvatarViewerProps {
  config: AvatarConfig;
  className?: string;
  animate?: boolean;
  activityType?: string;
}

export const AvatarViewer: React.FC<AvatarViewerProps> = ({
  config,
  className = "w-24 h-24",
  animate = false,
  activityType
}) => {
  const { bodyType, skinTone, outfitColor, accessory, hairColor, hairStyle, displayName } = config;

  // Determine shoulder width and height based on bodyType
  let shoulderWidth = 46;
  let shoulderY = 70;
  let torsoWidth = 42;
  let neckWidth = 12;

  if (bodyType === 'muscular') {
    shoulderWidth = 56;
    torsoWidth = 48;
    neckWidth = 15;
  } else if (bodyType === 'slim') {
    shoulderWidth = 38;
    torsoWidth = 34;
    neckWidth = 10;
  } else if (bodyType === 'athletic') {
    shoulderWidth = 48;
    torsoWidth = 40;
    neckWidth = 12;
  }

  // Animation CSS
  const animationClass = animate ? "animate-bounce duration-1000" : "";

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full overflow-visible select-none drop-shadow-md ${animationClass}`}
        id={`avatar-${displayName || 'unnamed'}`}
      >
        <g>
          {/* Subtle Back Shadow */}
          <ellipse cx="50" cy="95" rx="30" ry="4" fill="rgba(0,0,0,0.15)" />

          {/* BACKGROUND ENERGY FIELD (based on activity or accessory) */}
          <circle cx="50" cy="50" r="42" fill="none" stroke={outfitColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.4" className="animate-spin duration-10000" />

          {/* NECK */}
          <rect
            x={50 - neckWidth / 2}
            y="54"
            width={neckWidth}
            height="18"
            rx="4"
            fill={skinTone}
          />
          {/* Neck shadow */}
          <rect
            x={50 - neckWidth / 2}
            y="58"
            width={neckWidth}
            height="6"
            fill="black"
            opacity="0.12"
          />

          {/* TORSO / SHIRT */}
          <path
            d={`M ${50 - shoulderWidth / 2} 75 
               C ${50 - shoulderWidth / 3} ${shoulderY}, ${50 + shoulderWidth / 3} ${shoulderY}, ${50 + shoulderWidth / 2} 75 
               L ${50 + torsoWidth / 2} 100 
               L ${50 - torsoWidth / 2} 100 Z`}
            fill={outfitColor}
          />

          {/* COLLAR DETAIL */}
          <path
            d={`M ${50 - neckWidth} 74 C 50 80, 50 80, ${50 + neckWidth} 74`}
            fill="none"
            stroke={skinTone}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* HEAD */}
          <circle cx="50" cy="40" r="16" fill={skinTone} />

          {/* HAIR STYLE */}
          {hairStyle !== 'none' && (
            <g>
              {hairStyle === 'short' && (
                <path
                  d="M 33 38 C 32 25, 68 25, 67 38 C 64 34, 58 30, 50 32 C 42 30, 36 34, 33 38 Z"
                  fill={hairColor}
                />
              )}
              {hairStyle === 'long' && (
                <g>
                  {/* Ponytail behind head */}
                  <path
                    d="M 45 42 C 34 52, 36 68, 42 74 C 44 74, 44 65, 48 55"
                    fill={hairColor}
                  />
                  {/* Main Hair Cap */}
                  <path
                    d="M 33 38 C 32 25, 68 25, 67 38 C 64 32, 58 29, 50 31 C 42 29, 36 32, 33 38 Z"
                    fill={hairColor}
                  />
                </g>
              )}
              {hairStyle === 'curly' && (
                <g fill={hairColor}>
                  <circle cx="34" cy="36" r="5" />
                  <circle cx="42" cy="28" r="6" />
                  <circle cx="50" cy="25" r="6" />
                  <circle cx="58" cy="28" r="6" />
                  <circle cx="66" cy="36" r="5" />
                  <circle cx="36" cy="28" r="5" />
                  <circle cx="64" cy="28" r="5" />
                </g>
              )}
            </g>
          )}

          {/* FACE DETAILS (Eyes and Mouth) */}
          <g>
            {/* Eyes */}
            <circle cx="44" cy="40" r="2" fill="#1e293b" />
            <circle cx="56" cy="40" r="2" fill="#1e293b" />
            
            {/* Friendly smile */}
            <path
              d="M 45 46 Q 50 51, 55 46"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* ACCESSORY OVERLAYS */}
          {accessory !== 'none' && (
            <g>
              {accessory === 'helmet' && (
                <g>
                  {/* Outer Helmet */}
                  <path
                    d="M 32 35 C 32 18, 68 18, 68 35 L 68 37 C 68 37, 50 35, 32 37 Z"
                    fill="#1e293b"
                  />
                  {/* Helmet Stripe (reflects outfit or accent) */}
                  <path
                    d="M 46 22 C 48 20, 52 20, 54 22 L 54 36 C 52 36, 48 36, 46 36 Z"
                    fill="#f97316"
                  />
                  {/* Chin strap */}
                  <path
                    d="M 36 40 L 50 52 L 64 40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1.5"
                  />
                  {/* Helmet Visor */}
                  <path
                    d="M 31 35 L 69 35 L 67 38 L 33 38 Z"
                    fill="#475569"
                  />
                </g>
              )}

              {accessory === 'cap' && (
                <g>
                  {/* Cap dome */}
                  <path
                    d="M 33 36 C 33 22, 67 22, 67 36 Z"
                    fill="#475569"
                  />
                  {/* Cap visor/brim */}
                  <path
                    d="M 30 36 C 30 36, 50 33, 70 36 L 68 39 C 50 37, 50 37, 32 39 Z"
                    fill="#334155"
                  />
                  {/* Cap badge */}
                  <circle cx="50" cy="28" r="3" fill="#f97316" />
                </g>
              )}

              {accessory === 'sunglasses' && (
                <g>
                  {/* Sunglasses lens */}
                  <path
                    d="M 36 38 C 36 36, 48 36, 48 39 C 48 41, 45 44, 38 44 C 36 44, 36 40, 36 38 Z"
                    fill="#0f172a"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                  />
                  <path
                    d="M 64 38 C 64 36, 52 36, 52 39 C 52 41, 55 44, 62 44 C 64 44, 64 40, 64 38 Z"
                    fill="#0f172a"
                    stroke="#e2e8f0"
                    strokeWidth="0.5"
                  />
                  {/* Bridge */}
                  <rect x="47" y="38" width="6" height="2" fill="#0f172a" />
                  {/* Sport Reflective Gradient Accent */}
                  <path
                    d="M 38 42 L 46 39 M 54 39 L 62 42"
                    stroke="#f97316"
                    strokeWidth="1"
                    opacity="0.8"
                  />
                </g>
              )}

              {accessory === 'headband' && (
                <g>
                  {/* Headband band */}
                  <path
                    d="M 33 32 L 67 32 L 66 36 L 34 36 Z"
                    fill="#f97316"
                  />
                  {/* Logo or center block */}
                  <rect x="47" y="33" width="6" height="2" fill="white" rx="0.5" />
                </g>
              )}
            </g>
          )}

          {/* ATHLETIC CHEST GRAPHIC (Optional sports shirt stripe) */}
          <path
            d={`M ${50 - torsoWidth / 3} 85 L ${50 + torsoWidth / 3} 85`}
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      {/* Small badge overlay if requested */}
      {activityType && (
        <span className="absolute bottom-0 right-0 p-1 bg-zinc-950/80 backdrop-blur-md text-white rounded-full shadow-md text-xs border border-zinc-800">
          {activityType === 'running' && '🏃'}
          {activityType === 'hiking' && '🥾'}
          {activityType === 'biking' && '🚴'}
          {activityType === 'mountain_biking' && '🚵'}
          {activityType === 'skateboard' && '🛹'}
          {activityType === 'water_sports' && '🛶'}
        </span>
      )}
    </div>
  );
};
