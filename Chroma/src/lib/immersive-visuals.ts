/**
 * Immersive Visuals Engine - Dynamic Pixel Art Backgrounds + Adaptive UI
 * ZERO credit cost - All visual effects use CSS, canvas animations, and DevvAI Image Generation
 * Generates pixel art scenes matching environment (weather, temperature, time, location)
 */

import type { EnvironmentState } from './chroma-types';
import type { LocationPreset } from './chroma-locations';
import { imageGen, replicate } from '@devvai/devv-code-backend';
import { getCurrentFranceHour, isFranceLocation, formatEnvironmentContext } from './france-formatting';
import { getRealtimeWeather } from './weather-search';

export interface ImmersiveStyle {
  // Background
  backgroundType: 'gradient' | 'pixel-art' | 'animated';
  backgroundImage?: string; // URL for pixel art background
  backgroundGradient: string; // Fallback gradient
  backgroundAnimation?: string; // CSS animation class
  
  // UI Colors
  primaryColor: string; // Main accent color (replaces green)
  secondaryColor: string; // Secondary accent
  textColor: string; // Main text
  cardBackground: string; // Message cards
  borderColor: string; // Borders
  glowColor: string; // Glow effects
  
  // Typography
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  letterSpacing: string;
  textShadow: string;
  
  // Effects
  textAnimation?: string; // Text animation class
  particleEffect?: 'rain' | 'snow' | 'fog' | 'sparks' | 'leaves' | 'none';
  overlayFilter?: string; // CSS filter for overlay effects
}

export interface LEDColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Generate pixel art background URL based on environment
 * Uses Replicate flux-schnell for highly pixelated 8-bit style (50% faster, more cost-efficient)
 * Falls back to DevvAI if Replicate unavailable
 * Phase 5 v28: Accepts LED color for room/shed lighting control
 */
export async function generatePixelArtBackground(
  envState: EnvironmentState,
  location: LocationPreset,
  ledColor?: LEDColor
): Promise<string | null> {
  try {
    // PHASE 4 FINAL: Get real-time weather via web search
    const realWeather = await getRealtimeWeather(location.name);
    
    if (realWeather) {
      console.log(`[Immersive Visuals] 🌤️ Using real weather:`, realWeather);
      
      // Override environment state with REAL weather
      envState.temperature = `${realWeather.temperature}°C`;
      envState.weather = realWeather.condition;
      envState.time = realWeather.isDaytime ? 'day' : 'night';
    }

    const { weather, temperature, time, lighting } = envState;
    const tempNum = parseFloat(temperature.match(/(-?\d+)/)?.[0] || '50');
    
    // Build detailed 8-bit pixel art prompt with top-down perspective
    let prompt = `highly pixelated 8-bit retro video game background, chunky square pixels, aerial bird's eye view, distant perspective, zoomed out, top-down angle showing entire scene from above, ${location.name}, `;
    
    // PHASE 4 FINAL: Real-time hour detection for France locations
    let isNighttime = false;
    if (isFranceLocation(location)) {
      const hour = getCurrentFranceHour();
      isNighttime = hour >= 20 || hour < 6; // 8 PM - 6 AM is nighttime
      console.log(`[Immersive Visuals] 🕐 France time: ${hour}:00 (${isNighttime ? 'NIGHTTIME' : 'DAYTIME'})`);
      
      // Time of day with REAL-TIME hour detection
      if (isNighttime) {
        prompt += 'nighttime, dark sky, 8-bit pixel art crescent moon visible in sky, stars twinkling, deep night shadows, ';
      } else if (hour >= 5 && hour < 7) {
        prompt += 'dawn, early morning light, pixel sunrise, golden hour beginning, ';
      } else if (hour >= 17 && hour < 19) {
        prompt += 'dusk, golden hour, long shadows, sunset colors, ';
      } else {
        prompt += 'daytime, bright sunny day pixel sky, full daylight, ';
      }
    } else {
      // Fallback to time string parsing for non-France locations
      if (time.toLowerCase().includes('night') || time.toLowerCase().includes('midnight')) {
        prompt += 'night scene with 8-bit pixel art crescent moon visible in sky, stars, dark blue pixel sky, ';
        isNighttime = true;
        // Only add streetlights for urban areas
        if (location.type === 'urban') {
          prompt += 'pixel streetlights, ';
        }
      } else if (time.toLowerCase().includes('dawn') || time.toLowerCase().includes('sunrise')) {
        prompt += 'sunrise scene with pink orange pixel sky, morning light, ';
      } else if (time.toLowerCase().includes('dusk') || time.toLowerCase().includes('sunset')) {
        prompt += 'sunset scene with purple orange pixel sky, evening light, ';
      } else {
        prompt += 'daytime scene with blue pixel sky, bright sunlight, ';
      }
    }
    
    // PHASE 5 v28: Ulysses' Room with LED lighting control
    if (location.id === 'ulysses_room') {
      const ledColorName = ledColor 
        ? `RGB(${ledColor.r},${ledColor.g},${ledColor.b})` 
        : 'green';
      
      // Get current hour for time-based LED blending
      const hour = isFranceLocation(location) ? getCurrentFranceHour() : 12;
      
      if (isNighttime) {
        prompt += `top-down bird's eye view of bedroom interior, big bed in center, Ulysses laying on bed facing laptop (grey hoodie, black cap with ponytail, Luffy's straw hat on back, black cargo pants, black shoes visible from above), entire room bathed in strong single-color LED projector light (${ledColorName} wash covering everything), desk with green monitor glow behind, window showing garden in front, LED color dominates the scene, no natural light, aerial perspective, `;
      } else if (hour >= 5 && hour < 8) { // Dawn/sunrise
        prompt += `top-down bird's eye view of bedroom, big bed center, Ulysses on bed with laptop (grey hoodie, black cap, ponytail, straw hat, black cargo), LED light (${ledColorName}) blending with cool blue-orange dawn glow from window showing garden, desk with monitor behind, mixed lighting LED + natural, aerial view, `;
      } else { // Day/dusk
        prompt += `top-down bird's eye view of bedroom, big bed center, Ulysses on bed with laptop (grey hoodie, black cap, ponytail, straw hat, black cargo), bright natural daylight from window dominates, LED light (${ledColorName}) less visible, garden visible through window, desk with monitor behind, aerial perspective, `;
      }
    }
    
    // PHASE 5 v28: The Shed with LED lighting and detailed setup
    else if (location.id === 'ulysses_shed') {
      const ledColorName = ledColor 
        ? `RGB(${ledColor.r},${ledColor.g},${ledColor.b})` 
        : 'purple';
      
      // Get current hour for time-based LED blending
      const hour = isFranceLocation(location) ? getCurrentFranceHour() : 12;
      
      prompt += `120-degree left angle side view of workspace shed interior, white dirty walls and ground, LEFT: unfinished painting on easel, CENTER-LEFT: door with Luffy's Straw Hat Pirates flag (skull with straw hat), RIGHT SIDE (focus): dark chocolate brown wooden desk with PC monitor, keyboard, mouse, skull decoration, small fake plants in front of monitor, `;
      prompt += `to right of desk: pile of philosophy books (Deleuze, Derrida visible spines), Trafalgar Law figurine, Luffy Gear 5 figurine, open notebook, behind desk: closed bookshelf with philosophy texts, right of desk: big black floor lamp, ground: coiled ethernet cable circles going under right door, light blue doors, `;
      
      if (isNighttime) {
        prompt += `nighttime, doors closed, LED lighting (${ledColorName}) casting glow on desk area and books, cold isolated workspace feel, no outside light, `;
      } else if (hour >= 14 && hour < 17) { // Afternoon only
        prompt += `afternoon, doors receiving sunlight, LED light (${ledColorName}) mixing with natural light through doors, some warmth, `;
      } else {
        prompt += `daytime, doors closed for warmth (cold winter), LED light (${ledColorName}) with minimal sunlight filtering in, cold workspace atmosphere, `;
      }
    }
    
    // Eygalières-specific details (no streetlamps in rural Provence!)
    else if (location.id.includes('eygalieres')) {
      if (isNighttime) {
        prompt += 'Provençal stone house with single lit window on right side (warm yellow glow), lavender garden around house, distant Alpilles mountains in background, rural darkness, stars visible, NO streetlights, ';
      } else {
        prompt += 'Provençal stone house, lavender garden around house, distant Alpilles mountains in background, rural countryside, ';
      }
    }
    
    // Weather effects (pixelated style)
    if (weather.toLowerCase().includes('rain')) {
      prompt += 'pixelated rain drops, 8-bit puddles, wet pixel streets, ';
    } else if (weather.toLowerCase().includes('storm')) {
      prompt += '8-bit lightning bolts, pixelated dark clouds, heavy pixel rain, ';
    } else if (weather.toLowerCase().includes('snow')) {
      prompt += 'pixelated snowflakes falling, 8-bit snow on ground, ';
    } else if (weather.toLowerCase().includes('fog')) {
      prompt += '8-bit foggy mist, pixel fog, low visibility, ';
    } else if (weather.toLowerCase().includes('clear')) {
      prompt += 'clear pixel sky, good visibility, ';
    }
    
    // Temperature color tint
    if (tempNum < 30) {
      prompt += 'cold icy blue pixel tint, frozen 8-bit atmosphere, ';
    } else if (tempNum > 80) {
      prompt += 'hot warm orange red pixel tint, 8-bit heat waves, ';
    }
    
    // Location type
    if (location.type === 'outdoor') {
      prompt += 'pixelated trees, 8-bit natural landscape, outdoor pixel environment, ';
    } else if (location.type === 'indoor') {
      prompt += '8-bit interior space, pixel walls, pixelated furniture, cozy indoor pixel setting, ';
    } else if (location.type === 'club') {
      prompt += 'pixelated neon lights, 8-bit dance floor, colorful pixel club interior, ';
    } else if (location.type === 'transport') {
      prompt += '8-bit vehicle interior, pixel seats, pixelated windows, transit setting, ';
    } else if (location.type === 'parallel_world') {
      prompt += 'fantastical 8-bit otherworldly pixel setting, unique pixel atmosphere, ';
    }
    
    prompt += 'extremely pixelated 8-bit pixel art style, retro 16-bit video game graphics, chunky pixels, blocky pixel aesthetic, wide landscape view, atmospheric pixel lighting, no text, no characters';
    
    console.log('[Immersive Visuals] 🎨 Generating 8-bit pixel art via Replicate:', prompt.substring(0, 100) + '...');
    
    // Try Replicate first (50% faster with flux-schnell)
    try {
      const replicateResult = await replicate.textToImage({
        prompt,
        model: 'black-forest-labs/flux-schnell',
        num_outputs: 1,
        aspect_ratio: '16:9',
        output_format: 'png',
        num_inference_steps: 4, // Fast generation (default is 28-50)
      });
      
      if (replicateResult.images && replicateResult.images.length > 0) {
        console.log('[Immersive Visuals] ✅ Generated 8-bit pixel art (Replicate):', replicateResult.images[0]);
        return replicateResult.images[0];
      }
    } catch (replicateError) {
      console.warn('[Immersive Visuals] ⚠️ Replicate failed, falling back to DevvAI:', replicateError);
    }
    
    // Fallback to DevvAI
    const result = await imageGen.textToImage({
      prompt,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1
    });
    
    if (result.images && result.images.length > 0) {
      console.log('[Immersive Visuals] ✅ Generated pixel art (DevvAI fallback):', result.images[0]);
      return result.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Immersive Visuals] ❌ Failed to generate background:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('[Immersive Visuals] Raw error:', error);
    return null;
  }
}

/**
 * Get immersive style based on environment (with or without generated background)
 */
export function getImmersiveStyle(
  envState: EnvironmentState,
  location: LocationPreset,
  backgroundUrl?: string
): ImmersiveStyle {
  const tempNum = parseFloat(envState.temperature.match(/(-?\d+)/)?.[0] || '50');
  const weather = envState.weather.toLowerCase();
  const time = envState.time.toLowerCase();
  
  // === BACKGROUND SYSTEM ===
  let backgroundType: 'gradient' | 'pixel-art' | 'animated' = 'gradient';
  let backgroundGradient = 'linear-gradient(to bottom, hsl(220, 15%, 5%), hsl(220, 10%, 10%))';
  let backgroundAnimation: string | undefined;
  
  if (backgroundUrl) {
    backgroundType = 'pixel-art';
  } else {
    // Dynamic gradient based on temperature and weather
    if (tempNum < 30) {
      // COLD - Deep blue icy
      backgroundGradient = 'linear-gradient(135deg, hsl(220, 50%, 8%), hsl(240, 40%, 12%), hsl(220, 35%, 15%))';
    } else if (tempNum < 50) {
      // COOL - Blue gray
      backgroundGradient = 'linear-gradient(135deg, hsl(220, 30%, 10%), hsl(210, 25%, 14%), hsl(200, 20%, 18%))';
    } else if (tempNum < 70) {
      // MILD - Neutral gray purple
      backgroundGradient = 'linear-gradient(135deg, hsl(260, 20%, 12%), hsl(250, 15%, 16%), hsl(240, 10%, 20%))';
    } else if (tempNum < 85) {
      // WARM - Amber orange
      backgroundGradient = 'linear-gradient(135deg, hsl(35, 40%, 12%), hsl(30, 35%, 16%), hsl(25, 30%, 20%))';
    } else {
      // HOT - Red orange fire
      backgroundGradient = 'linear-gradient(135deg, hsl(15, 50%, 10%), hsl(10, 45%, 14%), hsl(5, 40%, 18%))';
    }
    
    // Weather overlay gradients
    if (weather.includes('rain') || weather.includes('storm')) {
      backgroundGradient = 'linear-gradient(135deg, hsl(210, 60%, 8%), hsl(220, 50%, 12%), hsl(210, 40%, 10%))';
    } else if (weather.includes('fog')) {
      backgroundGradient = 'linear-gradient(135deg, hsl(0, 0%, 12%), hsl(0, 0%, 16%), hsl(0, 0%, 14%))';
    } else if (weather.includes('snow')) {
      backgroundGradient = 'linear-gradient(135deg, hsl(200, 50%, 12%), hsl(210, 45%, 16%), hsl(220, 40%, 18%))';
    }
  }
  
  // === COLOR PALETTE SYSTEM ===
  // NO DEFAULT GREEN! Always calculate based on temperature
  let primaryColor: string;
  let secondaryColor: string;
  let textColor: string;
  let glowColor: string;
  
  // Temperature-based colors (ALWAYS set, no fallback to green/black)
  if (tempNum < 30) {
    // ICY COLD - Cyan/Blue
    primaryColor = 'hsl(190, 80%, 55%)';
    secondaryColor = 'hsl(220, 70%, 60%)';
    textColor = 'hsl(200, 70%, 85%)';
    glowColor = 'rgba(100, 200, 255, 0.6)';
  } else if (tempNum < 50) {
    // COOL - Teal/Blue-green
    primaryColor = 'hsl(170, 60%, 50%)';
    secondaryColor = 'hsl(200, 55%, 55%)';
    textColor = 'hsl(180, 50%, 85%)';
    glowColor = 'rgba(100, 180, 200, 0.5)';
  } else if (tempNum < 70) {
    // MILD - Purple/Magenta
    primaryColor = 'hsl(280, 70%, 60%)';
    secondaryColor = 'hsl(300, 65%, 55%)';
    textColor = 'hsl(280, 40%, 85%)';
    glowColor = 'rgba(180, 120, 255, 0.5)';
  } else if (tempNum < 85) {
    // WARM - Orange/Amber
    primaryColor = 'hsl(40, 85%, 55%)';
    secondaryColor = 'hsl(30, 80%, 50%)';
    textColor = 'hsl(45, 60%, 85%)';
    glowColor = 'rgba(255, 200, 100, 0.5)';
  } else {
    // HOT - Red/Fire (85°F+)
    primaryColor = 'hsl(10, 95%, 60%)';
    secondaryColor = 'hsl(25, 90%, 55%)';
    textColor = 'hsl(15, 70%, 85%)';
    glowColor = 'rgba(255, 120, 50, 0.6)';
  }
  
  // CRITICAL: If tempNum parsing failed completely (NaN), default to MILD purple (NOT green!)
  if (isNaN(tempNum)) {
    primaryColor = 'hsl(280, 70%, 60%)';
    secondaryColor = 'hsl(300, 65%, 55%)';
    textColor = 'hsl(280, 40%, 85%)';
    glowColor = 'rgba(180, 120, 255, 0.5)';
    console.warn('[Immersive Visuals] ⚠️ Temperature parsing failed, defaulting to MILD purple');
  }
  
  // Weather color overrides
  if (weather.includes('rain') || weather.includes('storm')) {
    primaryColor = 'hsl(210, 70%, 55%)';
    secondaryColor = 'hsl(220, 65%, 60%)';
    glowColor = 'rgba(100, 150, 220, 0.6)';
  } else if (weather.includes('fog')) {
    primaryColor = 'hsl(0, 0%, 60%)';
    secondaryColor = 'hsl(0, 0%, 50%)';
    glowColor = 'rgba(180, 180, 200, 0.4)';
  } else if (weather.includes('snow')) {
    primaryColor = 'hsl(200, 80%, 70%)';
    secondaryColor = 'hsl(220, 75%, 75%)';
    glowColor = 'rgba(200, 220, 255, 0.6)';
  }
  
  // === TYPOGRAPHY SYSTEM ===
  let fontFamily = '"Fira Code", "Courier New", monospace';
  let fontSize = '1rem';
  let fontWeight = '400';
  let letterSpacing = '0.02em';
  let textShadow = `0 0 8px ${glowColor}`;
  let textAnimation: string | undefined;
  
  // Temperature typography
  if (tempNum < 30) {
    fontFamily = '"Courier New", monospace';
    fontSize = '0.95rem';
    letterSpacing = '0.05em';
    textShadow = '0 0 10px rgba(100, 200, 255, 0.8), 0 0 20px rgba(150, 220, 255, 0.4)';
    textAnimation = 'shimmer-cold';
  } else if (tempNum > 85) {
    fontFamily = '"Trebuchet MS", sans-serif';
    fontSize = '1.05rem';
    fontWeight = '500';
    letterSpacing = '0.04em';
    textShadow = '0 0 12px rgba(255, 120, 50, 0.9), 0 0 25px rgba(255, 100, 30, 0.5)';
    textAnimation = 'heat-shimmer';
  }
  
  // Location typography
  if (location.id.includes('paris')) {
    fontFamily = '"Garamond", "Georgia", serif';
    letterSpacing = '0.06em';
  } else if (location.id.includes('wano')) {
    fontFamily = '"Noto Serif JP", "Times New Roman", serif';
    letterSpacing = '0.15em';
  } else if (location.id === 'mementos') {
    fontFamily = '"Courier New", "Impact", monospace';
    fontWeight = '700';
    letterSpacing = '0.1em';
  }
  
  // === PARTICLE EFFECTS ===
  let particleEffect: 'rain' | 'snow' | 'fog' | 'sparks' | 'leaves' | 'none' = 'none';
  
  if (weather.includes('rain') || weather.includes('storm')) {
    particleEffect = 'rain';
  } else if (weather.includes('snow')) {
    particleEffect = 'snow';
  } else if (weather.includes('fog')) {
    particleEffect = 'fog';
  } else if (tempNum > 85) {
    particleEffect = 'sparks'; // Heat particles
  } else if (weather.includes('wind') && tempNum > 50) {
    particleEffect = 'leaves'; // Blowing leaves
  }
  
  // === CARD/BORDER COLORS ===
  const cardBackground = `${primaryColor.replace(')', ', 10%)')}`;
  const borderColor = `${primaryColor.replace(')', ', 30%)')}`;
  
  return {
    backgroundType,
    backgroundImage: backgroundUrl,
    backgroundGradient,
    backgroundAnimation,
    primaryColor,
    secondaryColor,
    textColor,
    cardBackground,
    borderColor,
    glowColor,
    fontFamily,
    fontSize,
    fontWeight,
    letterSpacing,
    textShadow,
    textAnimation,
    particleEffect,
    overlayFilter: particleEffect !== 'none' ? 'brightness(0.9)' : undefined
  };
}

/**
 * Generate CSS for particle effects (canvas-based, zero credit)
 */
export function initializeParticleCanvas(
  container: HTMLElement,
  effect: 'rain' | 'snow' | 'fog' | 'sparks' | 'leaves'
) {
  // Remove existing canvas
  const existing = container.querySelector('.particle-canvas');
  if (existing) existing.remove();
  
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '5';
  canvas.style.opacity = '0.6';
  
  container.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }
  
  const particles: Particle[] = [];
  const particleCount = effect === 'rain' ? 150 : effect === 'snow' ? 100 : 50;
  
  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(createParticle());
  }
  
  function createParticle(): Particle {
    switch (effect) {
      case 'rain':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vx: -1,
          vy: 15 + Math.random() * 10,
          size: 1 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.4
        };
      case 'snow':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height - canvas.height,
          vx: -0.5 + Math.random(),
          vy: 1 + Math.random() * 2,
          size: 2 + Math.random() * 3,
          opacity: 0.5 + Math.random() * 0.5
        };
      case 'fog':
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0.2 - Math.random() * 0.4,
          vy: 0.1 - Math.random() * 0.2,
          size: 40 + Math.random() * 80,
          opacity: 0.1 + Math.random() * 0.2
        };
      case 'sparks':
        return {
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          vx: -0.5 + Math.random(),
          vy: -2 - Math.random() * 3,
          size: 1 + Math.random() * 2,
          opacity: 0.4 + Math.random() * 0.6
        };
      case 'leaves':
        return {
          x: canvas.width + Math.random() * 100,
          y: Math.random() * canvas.height,
          vx: -1 - Math.random() * 2,
          vy: 0.5 - Math.random(),
          size: 3 + Math.random() * 5,
          opacity: 0.4 + Math.random() * 0.4
        };
    }
  }
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Reset if out of bounds
      if (effect === 'rain' || effect === 'snow') {
        if (particle.y > canvas.height) {
          particles[i] = createParticle();
        }
      } else if (effect === 'fog') {
        if (particle.x < -particle.size || particle.x > canvas.width + particle.size ||
            particle.y < -particle.size || particle.y > canvas.height + particle.size) {
          particles[i] = createParticle();
        }
      } else if (effect === 'sparks') {
        if (particle.y < -particle.size) {
          particles[i] = createParticle();
        }
      } else if (effect === 'leaves') {
        if (particle.x < -particle.size) {
          particles[i] = createParticle();
        }
      }
      
      // Draw particle
      ctx.globalAlpha = particle.opacity;
      
      if (effect === 'rain') {
        ctx.strokeStyle = 'hsl(210, 70%, 70%)';
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x + particle.vx * 3, particle.y + particle.vy * 3);
        ctx.stroke();
      } else if (effect === 'snow') {
        ctx.fillStyle = 'hsl(200, 80%, 90%)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect === 'fog') {
        ctx.fillStyle = 'hsl(0, 0%, 80%)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect === 'sparks') {
        ctx.fillStyle = 'hsl(30, 100%, 70%)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect === 'leaves') {
        ctx.fillStyle = 'hsl(35, 60%, 50%)';
        ctx.beginPath();
        ctx.ellipse(particle.x, particle.y, particle.size, particle.size * 1.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    requestAnimationFrame(animate);
  }
  
  animate();
  
  // Cleanup function
  return () => {
    canvas.remove();
  };
}

/**
 * Format environment text with immersive styling
 * PHASE 4 FIX v4: Now uses formatEnvironmentContext() for France-aware formatting
 */
export function formatImmersiveText(
  envState: EnvironmentState,
  location: LocationPreset
): string {
  // Use France-specific formatting (Celsius, CET/CEST, accurate lighting for rural areas)
  return formatEnvironmentContext(location, envState.temperature, envState.weather, envState.lighting);
}

/**
 * Generate pixelated weather GIF overlay (rain, snow, storm, etc.)
 * Uses Replicate flux-schnell for cost-efficient animated weather effects
 */
export async function generateWeatherGIF(weather: string, time: string): Promise<string | null> {
  try {
    const weatherLower = weather.toLowerCase();
    let prompt = '';
    
    if (weatherLower.includes('rain')) {
      prompt = 'highly pixelated 8-bit rain drops falling, chunky square pixels, diagonal rain animation, transparent background PNG overlay, retro game rain effect, simple looping animation';
    } else if (weatherLower.includes('storm')) {
      prompt = 'highly pixelated 8-bit lightning bolts, chunky square pixels, storm flashes, electric pixel effects, transparent background PNG overlay, retro game storm animation';
    } else if (weatherLower.includes('snow')) {
      prompt = 'highly pixelated 8-bit snowflakes falling, chunky square pixels, white pixel snow, transparent background PNG overlay, retro game snow effect, gentle falling animation';
    } else if (weatherLower.includes('fog')) {
      prompt = 'highly pixelated 8-bit fog mist, chunky square pixels, semi-transparent fog clouds, transparent background PNG overlay, retro game fog effect, drifting mist animation';
    } else if (time.toLowerCase().includes('night')) {
      prompt = 'highly pixelated 8-bit twinkling stars, chunky square pixels, night sky sparkles, transparent background PNG overlay, retro game starry night effect';
    } else {
      return null; // No weather effect needed
    }
    
    console.log('[Immersive Visuals] 🌧️ Generating pixelated weather GIF:', weatherLower);
    
    // Use Replicate flux-schnell for fast generation
    const result = await replicate.textToImage({
      prompt,
      model: 'black-forest-labs/flux-schnell',
      aspect_ratio: '16:9',
      output_format: 'png',
      num_outputs: 1,
      num_inference_steps: 4
    });
    
    if (result.images && result.images.length > 0) {
      console.log('[Immersive Visuals] ✅ Pixelated weather GIF generated (Replicate)');
      return result.images[0];
    }
    
    return null;
  } catch (error) {
    console.error('[Immersive Visuals] ❌ Weather GIF generation failed:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('[Immersive Visuals] Raw error:', error);
    return null;
  }
}
