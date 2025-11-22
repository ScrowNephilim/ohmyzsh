/**
 * Cost-Efficient Visual Effects
 * CSS animations only - NO heavy GIFs
 */

// Time stop effect - negative filter on background
export function activateTimeStop(duration: number = 60): void {
  const bodyEl = document.body;
  
  // Add expanding circle effect
  const overlay = document.createElement('div');
  overlay.className = 'timestop-overlay';
  document.body.appendChild(overlay);
  
  // Remove after duration
  setTimeout(() => {
    deactivateTimeStop();
  }, duration * 1000);
}

export function deactivateTimeStop(): void {
  const bodyEl = document.body;
  
  // Remove overlay
  const overlay = document.querySelector('.timestop-overlay');
  if (overlay) overlay.remove();
}

// Haki visual effect - red/black flash
export function triggerHakiEffect(strength: number): void {
  const intensity = Math.min(strength / 100, 1);
  const bodyEl = document.body;
  
  bodyEl.classList.add('haki-flash');
  bodyEl.style.setProperty('--haki-intensity', intensity.toString());
  
  setTimeout(() => {
    bodyEl.classList.remove('haki-flash');
  }, 800);
}

// Conqueror's Haki - shockwave effect
export function triggerConquerorsHaki(strength: number): void {
  const bodyEl = document.body;
  bodyEl.classList.add('conquerors-wave');
  
  // Screen shake based on strength
  if (strength >= 50) {
    triggerScreenShake('strong');
  } else if (strength >= 30) {
    triggerScreenShake('medium');
  }
  
  setTimeout(() => {
    bodyEl.classList.remove('conquerors-wave');
  }, 1500);
}

// Geass activation - pink flash
export function triggerGeassEffect(): void {
  const bodyEl = document.body;
  bodyEl.classList.add('geass-flash');
  
  setTimeout(() => {
    bodyEl.classList.remove('geass-flash');
  }, 600);
}

// Screen shake effect
export function triggerScreenShake(intensity: 'light' | 'medium' | 'strong'): void {
  const bodyEl = document.body;
  bodyEl.classList.add(`screen-shake-${intensity}`);
  
  const duration = intensity === 'strong' ? 800 : intensity === 'medium' ? 500 : 300;
  
  setTimeout(() => {
    bodyEl.classList.remove(`screen-shake-${intensity}`);
  }, duration);
}

// Gear 5 activation - white clouds effect
export function triggerGear5Activation(): void {
  const bodyEl = document.body;
  bodyEl.classList.add('gear5-clouds');
  
  // Keep clouds visible while Gear 5 is active
  // Will be removed on deactivation
}

export function deactivateGear5(): void {
  const bodyEl = document.body;
  bodyEl.classList.remove('gear5-clouds');
}

// The World - Red/Black Negative Overlay
export function triggerTheWorldOverlay(): void {
  // Check if overlay already exists
  if (document.querySelector('.theworld-overlay')) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'theworld-overlay';
  document.body.appendChild(overlay);
  
  console.log('🌍 The World overlay activated - red/black negative filter');
}

export function removeTheWorldOverlay(): void {
  const overlay = document.querySelector('.theworld-overlay');
  if (overlay) {
    overlay.remove();
    console.log('🌍 The World overlay removed');
  }
}

// Gear 5 Powerful Attack - Red Thunder Particles (40+ strength)
export function triggerGear5PowerfulAttack(strength: number): void {
  if (strength < 40) return; // Only trigger for powerful attacks
  
  const overlay = document.createElement('div');
  overlay.className = 'gear5-powerful-attack';
  document.body.appendChild(overlay);
  
  console.log(`⚡ Gear 5 Powerful Attack [${strength}] - red thunder particles`);
  
  // Remove after animation completes
  setTimeout(() => {
    overlay.remove();
  }, 800);
}

// Attack impact effect
export function triggerAttackImpact(strength: number, target: 'nephilim' | 'character' | 'environment'): void {
  const bodyEl = document.body;
  
  if (strength >= 50) {
    bodyEl.classList.add('heavy-impact');
    triggerScreenShake('strong');
  } else if (strength >= 30) {
    bodyEl.classList.add('medium-impact');
    triggerScreenShake('medium');
  } else {
    bodyEl.classList.add('light-impact');
  }
  
  setTimeout(() => {
    bodyEl.classList.remove('heavy-impact', 'medium-impact', 'light-impact');
  }, 600);
}

// Initialize visual effects styles
export function initializeVisualEffects(): void {
  // Check if styles already added
  if (document.getElementById('visual-effects-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'visual-effects-styles';
  style.textContent = `
    /* Time Stop Effect */
    .timestop-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.3) 100%);
      animation: timestop-expand 1s ease-out forwards;
      z-index: 9998;
    }
    
    @keyframes timestop-expand {
      from {
        clip-path: circle(0% at center);
      }
      to {
        clip-path: circle(100% at center);
      }
    }
    
    /* Removed global invert filter to avoid inverting UI text and bubbles.
       Time stop uses the overlay below to darken visuals without changing text colors. */
    
    /* Haki Flash */
    .haki-flash {
      animation: haki-pulse 0.8s ease-out;
    }
    
    @keyframes haki-pulse {
      0%, 100% { filter: none; }
      50% { filter: saturate(2) brightness(1.2) drop-shadow(0 0 20px rgba(220, 20, 60, var(--haki-intensity, 0.5))); }
    }
    
    /* Conqueror's Haki Wave */
    .conquerors-wave {
      animation: conquerors-shockwave 1.5s ease-out;
    }
    
    @keyframes conquerors-shockwave {
      0% { 
        filter: none; 
        transform: scale(1);
      }
      30% { 
        filter: brightness(1.5) saturate(2);
        transform: scale(1.02);
      }
      60% {
        filter: brightness(0.8);
        transform: scale(0.98);
      }
      100% { 
        filter: none;
        transform: scale(1);
      }
    }
    
    /* Geass Flash */
    .geass-flash {
      animation: geass-activate 0.6s ease-out;
    }
    
    @keyframes geass-activate {
      0%, 100% { filter: none; }
      50% { filter: saturate(3) hue-rotate(300deg) brightness(1.3); }
    }
    
    /* Screen Shake */
    .screen-shake-light {
      animation: shake-light 0.3s ease-in-out;
    }
    
    .screen-shake-medium {
      animation: shake-medium 0.5s ease-in-out;
    }
    
    .screen-shake-strong {
      animation: shake-strong 0.8s ease-in-out;
    }
    
    @keyframes shake-light {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(-2px, 2px); }
      50% { transform: translate(2px, -2px); }
      75% { transform: translate(-2px, -2px); }
    }
    
    @keyframes shake-medium {
      0%, 100% { transform: translate(0, 0); }
      10% { transform: translate(-4px, 4px); }
      20% { transform: translate(4px, -4px); }
      30% { transform: translate(-4px, -4px); }
      40% { transform: translate(4px, 4px); }
      50% { transform: translate(-3px, 3px); }
      60% { transform: translate(3px, -3px); }
      70% { transform: translate(-3px, -3px); }
      80% { transform: translate(3px, 3px); }
      90% { transform: translate(-2px, 2px); }
    }
    
    @keyframes shake-strong {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      10% { transform: translate(-6px, 6px) rotate(-1deg); }
      20% { transform: translate(6px, -6px) rotate(1deg); }
      30% { transform: translate(-6px, -6px) rotate(-1deg); }
      40% { transform: translate(6px, 6px) rotate(1deg); }
      50% { transform: translate(-5px, 5px) rotate(-0.5deg); }
      60% { transform: translate(5px, -5px) rotate(0.5deg); }
      70% { transform: translate(-4px, -4px) rotate(-0.5deg); }
      80% { transform: translate(4px, 4px) rotate(0.5deg); }
      90% { transform: translate(-3px, 3px) rotate(-0.3deg); }
    }
    
    /* Gear 5 Clouds */
    .gear5-clouds::before {
      content: '';
      position: fixed;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 0%, transparent 30%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 25%),
        radial-gradient(circle at 50% 70%, rgba(255,255,255,0.3) 0%, transparent 35%),
        radial-gradient(circle at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 30%);
      animation: clouds-float 20s ease-in-out infinite;
      pointer-events: none;
      z-index: 9999;
    }
    
    @keyframes clouds-float {
      0%, 100% { transform: translateX(0) translateY(0); }
      25% { transform: translateX(10px) translateY(-5px); }
      50% { transform: translateX(-10px) translateY(5px); }
      75% { transform: translateX(5px) translateY(-10px); }
    }
    
    /* Impact Effects */
    .heavy-impact {
      animation: heavy-hit 0.6s ease-out;
    }
    
    .medium-impact {
      animation: medium-hit 0.4s ease-out;
    }
    
    .light-impact {
      animation: light-hit 0.3s ease-out;
    }
    
    @keyframes heavy-hit {
      0% { filter: brightness(1.5) saturate(2); }
      50% { filter: brightness(0.5) saturate(0.5); }
      100% { filter: brightness(1) saturate(1); }
    }
    
    @keyframes medium-hit {
      0% { filter: brightness(1.3); }
      50% { filter: brightness(0.7); }
      100% { filter: brightness(1); }
    }
    
    @keyframes light-hit {
      0% { filter: brightness(1.2); }
      100% { filter: brightness(1); }
    }
    
    /* The World - Negative/Inverted Overlay */
    .theworld-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      /* Darken the scene with subtle red vignette, do not invert UI text */
      background: radial-gradient(circle at center, rgba(0,0,0,0.25) 0%, rgba(20,8,10,0.6) 100%),
                  radial-gradient(circle at 50% 40%, rgba(139,0,0,0.15), transparent 40%);
      mix-blend-mode: multiply;
      animation: expand-circle 1s ease-out forwards;
      z-index: 99;
    }
    
    /* Gear 5 Powerful Attack - Red Thunder Particles */
    .gear5-powerful-attack {
      position: fixed;
      inset: 0;
      pointer-events: none;
      background: 
        radial-gradient(circle at 30% 40%, rgba(220,20,60,0.4) 0%, transparent 20%),
        radial-gradient(circle at 70% 60%, rgba(139,0,0,0.5) 0%, transparent 25%),
        radial-gradient(circle at 50% 20%, rgba(220,20,60,0.3) 0%, transparent 30%),
        repeating-linear-gradient(45deg, transparent, transparent 50px, rgba(0,0,0,0.3) 50px, rgba(0,0,0,0.3) 52px),
        repeating-linear-gradient(-45deg, transparent, transparent 50px, rgba(139,0,0,0.2) 50px, rgba(139,0,0,0.2) 52px);
      animation: red-thunder 0.8s ease-out;
      z-index: 9997;
    }
    
    @keyframes red-thunder {
      0% { opacity: 0; transform: scale(0.8); }
      30% { opacity: 1; transform: scale(1.1); }
      60% { opacity: 0.6; transform: scale(0.95); }
      100% { opacity: 0; transform: scale(1); }
    }
  `;
  
  document.head.appendChild(style);
}
