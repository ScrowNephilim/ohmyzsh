import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCachedPortal, getChromaPortalConfig } from '@/lib/portal-transition-generator';

export function ChromaPortal() {
  const [isHovered, setIsHovered] = useState(false);
  const [portalImage, setPortalImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Generate pixel art portal on mount
  useEffect(() => {
    let mounted = true;

    async function generatePortal() {
      try {
        const config = getChromaPortalConfig();
        const imageUrl = await getCachedPortal(config);
        
        if (mounted && imageUrl) {
          setPortalImage(imageUrl);
        }
      } catch (error) {
        console.error('[ChromaPortal] Failed to generate portal image:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    generatePortal();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => navigate('/chroma')}
      >
        {/* Pixel Art Portal Image or SVG Fallback */}
        {portalImage && !isLoading ? (
          <div className="relative w-[300px] h-[300px]">
            <img
              src={portalImage}
              alt="Chroma Portal"
              className={`w-full h-full object-contain rounded-full transition-all duration-500 ${
                isHovered ? 'scale-110 matrix-glow' : 'scale-100'
              }`}
              style={{
                filter: isHovered
                  ? 'brightness(1.2) drop-shadow(0 0 30px rgba(100, 255, 150, 0.8))'
                  : 'brightness(1.0) drop-shadow(0 0 10px rgba(100, 255, 150, 0.4))'
              }}
            />
            {/* Matrix particles on hover */}
            {isHovered && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-xs font-mono text-[hsl(142,90%,60%)] matrix-cascade"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  >
                    {Math.random() > 0.5 ? '01' : '10'}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <svg
          width="300"
          height="300"
          viewBox="0 0 200 200"
          className={`transition-all duration-500 ${isHovered ? 'wormhole-animation matrix-glow scale-110' : 'scale-100'}`}
        >
          {/* Outer rings */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(142, 70%, 45%)"
            strokeWidth="2"
            opacity="0.3"
          />
          <circle
            cx="100"
            cy="100"
            r="75"
            fill="none"
            stroke="hsl(142, 90%, 60%)"
            strokeWidth="2"
            opacity="0.4"
          />
          <circle
            cx="100"
            cy="100"
            r="60"
            fill="none"
            stroke="hsl(142, 70%, 45%)"
            strokeWidth="3"
            opacity="0.5"
          />
          <circle
            cx="100"
            cy="100"
            r="45"
            fill="none"
            stroke="hsl(142, 90%, 60%)"
            strokeWidth="3"
            opacity="0.6"
          />
          
          {/* Center vortex */}
          <circle
            cx="100"
            cy="100"
            r="30"
            fill="hsl(142, 100%, 35%)"
            opacity="0.8"
          />
          <circle
            cx="100"
            cy="100"
            r="20"
            fill="hsl(142, 90%, 60%)"
            opacity="0.9"
          />
          <circle
            cx="100"
            cy="100"
            r="10"
            fill="hsl(0, 0%, 0%)"
          />
          
          {/* Matrix particles flowing in */}
          {isHovered && (
            <>
              {[...Array(20)].map((_, i) => (
                <g key={i}>
                  <text
                    x={100 + Math.cos((i * Math.PI) / 10) * 80}
                    y={100 + Math.sin((i * Math.PI) / 10) * 80}
                    fontSize="12"
                    fill="hsl(142, 90%, 60%)"
                    className="matrix-cascade"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {Math.random() > 0.5 ? '01' : '10'}
                  </text>
                </g>
              ))}
            </>
          )}
          </svg>
        )}
        
        <p className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-center text-xs text-[hsl(142,70%,45%)] tracking-widest font-mono whitespace-nowrap">
          {isLoading
            ? '[ LOADING PORTAL... ]'
            : isHovered
            ? '>>> ENTERING HYPERSPACE <<<'
            : '[ CLICK TO ENTER ]'}
        </p>
      </div>
    </div>
  );
}
