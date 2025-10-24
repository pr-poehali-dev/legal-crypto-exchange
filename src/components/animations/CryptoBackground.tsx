import { useEffect, useState } from 'react';

interface ParticleData {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  icon: string;
  opacity: number;
}

const CryptoBackground = () => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  useEffect(() => {
    const cryptoIcons = [
      'https://assets.coincap.io/assets/icons/btc@2x.png',
      'https://assets.coincap.io/assets/icons/eth@2x.png',
      'https://assets.coincap.io/assets/icons/usdt@2x.png',
      'https://assets.coincap.io/assets/icons/bnb@2x.png',
      'https://assets.coincap.io/assets/icons/sol@2x.png',
      'https://assets.coincap.io/assets/icons/xrp@2x.png',
    ];

    const newParticles: ParticleData[] = [];
    const particleCount = 25;

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 30,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 5,
        icon: cryptoIcons[Math.floor(Math.random() * cryptoIcons.length)],
        opacity: Math.random() * 0.15 + 0.05,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <img
            src={particle.icon}
            alt="crypto"
            className="w-full h-full object-contain animate-spin-slow"
            style={{
              animationDuration: `${particle.duration * 2}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -30px) rotate(90deg);
          }
          50% {
            transform: translate(-20px, -60px) rotate(180deg);
          }
          75% {
            transform: translate(-40px, -30px) rotate(270deg);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-spin-slow {
          animation: spin linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoBackground;
