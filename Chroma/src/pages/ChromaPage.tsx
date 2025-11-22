import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AudioPlayer } from '@/components/AudioPlayer';
import { PowersMenuV2 } from '@/components/PowersMenuV2';
import { TimeStopTimer } from '@/components/TimeStopTimer';
import { HealthBar } from '@/components/HealthBar';
import { CompactHealthBar } from '@/components/CompactHealthBar';
import { SoundEffectsMenu } from '@/components/SoundEffectsMenu';
import { DiaryViewer } from '@/components/DiaryViewer';
import { EnvironmentAudioUploader } from '@/components/EnvironmentAudioUploader';
import { STTInput } from '@/components/STTInput';
import { WeatherGIFOverlay } from '@/components/WeatherGIFOverlay';
import { EnvironmentControlPanel, type EnvironmentOverrides } from '@/components/EnvironmentControlPanel';
import { LEDLightingControl, type LEDColor } from '@/components/LEDLightingControl';
import { Loader2, Send, ArrowLeft, MapPin, Clock, Cloud, ThermometerIcon, User, Languages, Volume2, VolumeX, Sparkles, AlertTriangle, Paintbrush, LogOut, Music, BookOpen, Eye } from 'lucide-react';
import { ttsEngine, shouldNephilimSpeak, formatTextForSpeech } from '@/lib/tts-engine';
import { bystanderEngine } from '@/lib/bystander-engine';
import { detectPowerActivation, generatePowerEffect, generateLandscapeChange, generatePowerBadge, isValidPowerTarget } from '@/lib/power-engine';
import { detectWorldFromMessage, getNephilimPower, type ParallelWorld } from '@/lib/parallel-worlds';
import { getLocationById, LOCATION_PRESETS, type LocationPreset } from '@/lib/chroma-locations';
import { soundEffects } from '@/lib/sound-effects';
import { playPowerSound, cleanupPowerAudio } from '@/lib/power-audio';
import { playWeatherLoop, stopWeatherLoop, cleanupWeatherAudio } from '@/lib/weather-audio';
import { 
  generateHaishiGIF, 
  generateShinkouGIF, 
  generateShinEnGIF, 
  generateYamiGIF,
  generateYamiShadowHideGIF,
  displayAttackGIF,
  type AttackGIFResult 
} from '@/lib/attack-gif-generator';
import { 
  triggerTheWorldOverlay, 
  removeTheWorldOverlay, 
  triggerGear5PowerfulAttack,
  initializeVisualEffects 
} from '@/lib/visual-effects';
import { nephilimGenerator } from '@/lib/dynamic-nephilim-generator';
import { culturalDetector, type CulturalCue } from '@/lib/cultural-detector';
import { chromaLogger } from '@/lib/chroma-logger';
import { ambientAudioEngine } from '@/lib/ambient-audio-engine';
import { environmentalSFX, type WeatherEffect, type TimeEffect } from '@/lib/environmental-sfx';
import { getContextualTextFX, getTextFXClasses, getTextFXStyles, containsPowerKeyword } from '@/lib/text-fx-engine';
import { weatherTransitions } from '@/lib/weather-transitions';
import { formatEnvironmentContext } from '@/lib/france-formatting';
import { useToast } from '@/hooks/use-toast';
import { 
  generatePixelArtBackground, 
  getImmersiveStyle, 
  initializeParticleCanvas,
  formatImmersiveText,
  type ImmersiveStyle 
} from '@/lib/immersive-visuals';
import {
  initializeRiplayNephilim,
  initializeAnaNephilim,
  initializeEnvironment,
  getCurrentEnvironment,
  getNephilimByName,
  getAvailableNephilims,
  shouldNephilimAppear,
  startChromaInteraction,
  addMessageToInteraction,
  getRiplayMasterContext
} from '@/lib/chroma-engine';
import {
  checkNephilimTeleports,
  checkMentionTriggeredTeleport,
  isOnTeleportCooldown,
  setTeleportCooldown,
  formatTeleportMessage,
  type TeleportEvent
} from '@/lib/nephilim-teleport';
import { 
  getDestinationByKey,
  getDestinationByName,
  generateTransitionGIF, 
  calculateTravelTime, 
  getMysteryDestination,
  tryRevealMysteryLocation,
  TRAVEL_DESTINATIONS 
} from '@/lib/chroma-travel';
import { resetChromaCache } from '@/lib/chroma-cache';
import type {
  ChromaEnvironment,
  NephilimCharacter,
  ChromaMessage,
  EnvironmentState
} from '@/lib/chroma-types';
import { detectCurrentLocation } from '@/lib/location-detector';
import { 
  generateChromaTextProbeResponse, 
  detectHealthNeglect, 
  generateHealthNeglectResponse,
  type ChromaTextProbeContext 
} from '@/lib/riplay-text-probe-chroma';
import { parseTravelCommand, generateTravelAnnouncement, getRandomDestination } from '@/lib/chroma-travel';
import { 
  generateActionSuggestions,
  getSuggestionButtonStyle,
  isActionAvailable,
  type ActionSuggestion 
} from '@/lib/chroma-action-suggestions';
import {
  formatNephilimName,
  getNephilimNameInlineStyle,
  getLanguageIndicatorStyle
} from '@/lib/nephilim-name-styling';
import {
  generateDiaryNote,
  shouldUpdateDiaryNote,
  formatDiaryEntryForExport,
  detectEmotionalTone,
  type DiaryNote
} from '@/lib/chroma-diary-notes';
import {
  generateEventEntry,
  storeDiaryEntry,
  loadDiaryEntries,
  extractKeywords,
  initializeFirstChromaEntry,
  type DiaryEntry
} from '@/lib/ripley-diary-engine';
import {
  getDefaultProximities,
  generateDistanceChangeNarration,
  generateEnterRangeNarration,
  calculateProximityAfterTravel,
  type NephilimProximity
} from '@/lib/nephilim-proximity';
import {
  checkForEnvironmentNarration,
  generatePowerReaction
} from '@/lib/environment-narrator';
import type { EnvironmentNarration } from '@/lib/environment-narrator';
import { ProximitySlider } from '@/components/ProximitySlider';
import {
  getLocationSuggestions,
  getNephilimTravelSuggestions,
  type LocationSuggestion
} from '@/lib/location-suggestions';
import { 
  USER_POWERS,
  calculateMaxStrength,
  calculateDamage,
  formatPowerText,
  isValidGeassCommand,
  calculateTimeStopDuration, // PHASE 4 FIX: Dynamic time stop duration
  type UserPower,
  type PowerUsage
} from '@/lib/user-powers';
import {
  initializeNephilimHealth,
  initializeCharacterHealth,
  applyDamage,
  getNephilimDeathMessage,
  getCharacterDefeatMessage,
  type HealthEntity
} from '@/lib/health-system';
import { DevvAI } from '@devvai/devv-code-backend';
import { 
  generateAtmosphere, 
  getWeatherModifiers, 
  formatEnvironmentText,
  getPowerVisualization,
  type AtmosphereStyle 
} from '@/lib/atmosphere-engine';
import {
  detectEmotionalTone as detectMessageTone,
  getEmotionalStyling,
  applyEmphasisToText,
  logEmotionalAnalysis
} from '@/lib/emotional-text-styling';

export default function ChromaPage() {
  const { user, logout, isSessionValid } = useAuthStore();
  const navigate = useNavigate();
  const isDevMode = useAuthStore(state => state.isDevMode);
  const { toast } = useToast();

  const [environment, setEnvironment] = useState<ChromaEnvironment | null>(null);
  const [activeNephilims, setActiveNephilims] = useState<NephilimCharacter[]>([]);
  const [ephemeralNephilims, setEphemeralNephilims] = useState<NephilimCharacter[]>([]);
  const [messages, setMessages] = useState<ChromaMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [interactionId, setInteractionId] = useState<string>('');
  const [currentActivity, setCurrentActivity] = useState<string>('');
  const [locationInfo, setLocationInfo] = useState<string>('');
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false); // Default OFF
  const [currentWorld, setCurrentWorld] = useState<ParallelWorld | null>(null);
  const [currentLocationPreset, setCurrentLocationPreset] = useState<LocationPreset | null>(null);
  const [environmentEffects, setEnvironmentEffects] = useState<string[]>([]);
  const [sessionStartTime] = useState<Date>(new Date());
  const [atmosphereStyle, setAtmosphereStyle] = useState<AtmosphereStyle | null>(null);
  const [activePowerVisual, setActivePowerVisual] = useState<any>(null);
  const [previousWeather, setPreviousWeather] = useState<WeatherEffect>('clear');
  const [immersiveStyle, setImmersiveStyle] = useState<ImmersiveStyle | null>(null);
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [followedNephilim, setFollowedNephilim] = useState<string | null>(null);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelTransitionUrl, setTravelTransitionUrl] = useState<string | null>(null);
  const [actionSuggestions, setActionSuggestions] = useState<ActionSuggestion[]>([]);
  const [activePowers, setActivePowers] = useState<string[]>([]);
  const [diaryNotes, setDiaryNotes] = useState<DiaryNote[]>([]);
  const [currentDiaryNote, setCurrentDiaryNote] = useState<string>('');
  const [showDiaryExport, setShowDiaryExport] = useState(false);
  
  // Phase 3D: Powers System State
  const [userActivePowers, setUserActivePowers] = useState<string[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [defaultTarget, setDefaultTarget] = useState<string>('Environment'); // Remember last selected target
  const [healthEntities, setHealthEntities] = useState<HealthEntity[]>([]);
  const [isTimeStopActive, setIsTimeStopActive] = useState(false);
  const [timeStopDuration, setTimeStopDuration] = useState(60); // PHASE 4 FIX: Dynamic duration (15s or 60s)
  const [timeStopCountdown, setTimeStopCountdown] = useState<number>(60); // PHASE 5 v27.4: Countdown displayed in The World bubble
  const [timeStopIntervalId, setTimeStopIntervalId] = useState<NodeJS.Timeout | null>(null); // PHASE 5 v27.4: Timer cleanup state
  const [powerUsageHistory, setPowerUsageHistory] = useState<PowerUsage[]>([]);
  
  // Proximity and Environment Narration State
  const [proximities, setProximities] = useState<Map<string, number>>(new Map());
  const [isFirstChromaEntry, setIsFirstChromaEntry] = useState(true);
  const [previousWeatherState, setPreviousWeatherState] = useState<string>('');
  const [previousTimeState, setPreviousTimeState] = useState<string>('');
  
  // Location Suggestions State
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [currentMysteryLocation, setCurrentMysteryLocation] = useState<{ actual: string; revealed: boolean } | null>(null);
  
  // Proximity Slider Click-to-Reveal State
  const [visibleProximitySliders, setVisibleProximitySliders] = useState<Set<string>>(new Set());
  // Toggle to show 'Ulysses (fr)' distances panel
  const [showMeProximities, setShowMeProximities] = useState(false);
  // Which entity's distance panel is open (null = none)
  const [selectedDistanceEntity, setSelectedDistanceEntity] = useState<string | null>(null);
  
  // Phase 5: Environment Audio Uploader State
  const [envAudioMenuOpen, setEnvAudioMenuOpen] = useState(false);
  
  // Phase 4: Sound Menu & Diary Viewer State
  const [soundMenuOpen, setSoundMenuOpen] = useState(false);
  const [diaryViewerOpen, setDiaryViewerOpen] = useState(false);
  const [manualWeather, setManualWeather] = useState<'rain' | 'snow' | 'clear' | 'storm' | 'fog'>('clear');
  
  // Phase 4: Environment Overrides State
  const [environmentOverrides, setEnvironmentOverrides] = useState<EnvironmentOverrides>({});
  
  // Phase 5 v28: LED Lighting State
  const [ledColor, setLedColor] = useState<LEDColor>({ r: 0, g: 255, b: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const particleCleanupRef = useRef<(() => void) | null>(null);

  // Local alias to avoid strict BadgeProps typing in JSX here
  const LocalBadge: any = Badge as any;

  // ✅ Helper function to apply environment overrides before background generation
  const applyEnvironmentOverrides = (envState: EnvironmentState): EnvironmentState => {
    if (Object.keys(environmentOverrides).length === 0) {
      return envState; // No overrides, return original
    }

    const overridden: EnvironmentState = { ...envState };

    // Weather override
    if (environmentOverrides.weather) {
      overridden.weather = environmentOverrides.weather;
      console.log('[Environment Override] 🌧️ Weather:', overridden.weather);
    }

    // Temperature override
    if (environmentOverrides.temperature !== undefined) {
      overridden.temperature = environmentOverrides.temperature.toString() + '°C';
      console.log('[Environment Override] 🌡️ Temperature:', overridden.temperature);
    }

    // Time of day override (affects lighting)
    if (environmentOverrides.timeOfDay) {
      const timeMap = {
        dawn: 'soft pre-sunrise glow, cool blue-orange hues',
        day: 'bright daylight, clear visibility',
        dusk: 'golden hour light, warm orange-pink sky',
        night: 'deep night, moon and stars visible'
      };
      overridden.lighting = timeMap[environmentOverrides.timeOfDay];
      console.log('[Environment Override] 🌅 Time/Lighting:', overridden.lighting);
    }

    // Sky condition override (modifies lighting description)
    if (environmentOverrides.skyCondition) {
      if (environmentOverrides.skyCondition === 'covered') {
        overridden.lighting = overridden.lighting.replace('clear', 'overcast');
      } else if (environmentOverrides.skyCondition === 'sunny') {
        overridden.lighting = overridden.lighting.replace('overcast', 'clear');
      }
      console.log('[Environment Override] ☁️ Sky condition:', environmentOverrides.skyCondition);
    }

    return overridden;
  };

  // Helper function to ALWAYS get valid location name (prevents "undefined" in messages)
  const getLocationName = (): string => {
    return currentLocationPreset?.name || 
           currentLocationPreset?.revealedName || 
           environment?.location_name || 
           'Unknown Location';
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // DON'T clear cache on entry - causes TDZ errors on re-mount!
    // Only clear on unmount in dev mode
    initializeChroma();
    
    // PHASE 4: Initialize visual effects system
    initializeVisualEffects();
    console.log('[Visual Effects] ✨ CSS animations initialized');

    // Cleanup on unmount
    return () => {
      console.log('[ChromaPage] 🚪 Cleaning up on exit');
      soundEffects.dispose();
      ambientAudioEngine.stopAmbientAudio();
      environmentalSFX.dispose();
      weatherTransitions.dispose();
      // PHASE 4: Cleanup audio systems
      cleanupPowerAudio();
      cleanupWeatherAudio();
      if (particleCleanupRef.current) {
        particleCleanupRef.current();
      }
      // PHASE 5 v27.4: Cleanup time stop countdown timer
      if (timeStopIntervalId) {
        clearInterval(timeStopIntervalId);
        setTimeStopIntervalId(null);
        console.log('[The World] 🧹 Countdown timer cleaned up');
      }
      logChromaSession();
      
      // Clear cache ONLY in dev mode (for testing fresh state)
      if (isDevMode) {
        console.log('[ChromaPage] 🧹 Dev mode: clearing cache on exit');
        resetChromaCache();
      }
    };
  }, [user, navigate, isDevMode]);

  // Monitor environment changes and trigger weather transitions
  useEffect(() => {
    if (!environment || !currentLocationPreset) return;

    try {
      const envState: EnvironmentState = JSON.parse(environment.environment_state);
      const currentWeather = envState.weather.toLowerCase();
      
      // Map weather string to WeatherEffect type
      let weatherEffect: WeatherEffect = 'clear';
      if (currentWeather.includes('rain')) weatherEffect = 'rain';
      else if (currentWeather.includes('storm')) weatherEffect = 'storm';
      else if (currentWeather.includes('wind')) weatherEffect = 'wind';
      else if (currentWeather.includes('fog') || currentWeather.includes('mist')) weatherEffect = 'fog';
      else if (currentWeather.includes('snow')) weatherEffect = 'snow';

      // Trigger transition if weather changed
      if (weatherEffect !== previousWeather && document.body) {
        console.log(`[ChromaPage] ⛅ Weather transition: ${previousWeather} → ${weatherEffect}`);
        weatherTransitions.transitionTo(weatherEffect, document.body, {
          onComplete: () => {
            console.log('[ChromaPage] ✅ Weather transition complete');
          }
        });
        setPreviousWeather(weatherEffect);
        
        // PHASE 4: Play weather audio loop
        if (weatherEffect === 'rain' || weatherEffect === 'storm') {
          playWeatherLoop(weatherEffect, 0.4);
        } else {
          stopWeatherLoop(); // Stop weather audio for clear/snow/fog
        }
      }
    } catch (error) {
      console.error('[ChromaPage] ❌ Error parsing environment state:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('[ChromaPage] Raw error:', error);
    }
  }, [environment, previousWeather]);

  const logChromaSession = async () => {
    if (messages.length > 0 && chromaLogger.shouldLogSession(messages)) {
      const duration = Date.now() - sessionStartTime.getTime();
      const logEntry = chromaLogger.generateSummary(
        messages,
        environment?.location_name || 'Unknown',
        duration
      );
      await chromaLogger.logToMasterFile(logEntry, interactionId);
    }
  };
  
  // Handle travel to new location
  const handleShowLocationSuggestions = () => {
    if (!environment) return;
    const suggestions = getLocationSuggestions(environment.location_name);
    setLocationSuggestions(suggestions);
    setShowLocationSuggestions(true);
  };

  const handleTravel = async (destinationName: string) => {
    // Dev mode: Block travel
    if (isDevMode) {
      toast({
        title: "🔓 Dev Mode Active",
        description: "Travel requires real authentication. Exit dev mode to test this feature.",
        variant: "default",
      });
      return;
    }
    if (!environment || isTraveling || isDevMode) return;
    
    // Hide location suggestions if shown
    setShowLocationSuggestions(false);
    
    setIsTraveling(true);
    const currentLoc = environment.location_name;
    
    toast({
      title: "🌀 Traveling",
      description: `Warping reality from ${currentLoc} to ${destinationName}...`,
    });
    
    try {
      // Generate transition GIF
      const transitionUrl = await generateTransitionGIF(currentLoc, destinationName);
      if (transitionUrl) {
        setTravelTransitionUrl(transitionUrl);
      }
      
      // Wait for travel time
      const travelTime = calculateTravelTime(currentLoc, destinationName);
      await new Promise(resolve => setTimeout(resolve, travelTime));
      
      // STEP 1: Normalize destination name to key format
      const destinationKey = destinationName.toLowerCase().replace(/\s+/g, '_');
      console.log('[Travel] Normalized destination key:', destinationKey);
      
      // STEP 2: Get destination object (key lookup first, then name)
      const destination = getDestinationByKey(destinationKey) || getDestinationByName(destinationName);
      console.log('[Travel] Destination found:', destination ? destination.name : 'NOT FOUND');
      
      if (destination) {
        // STEP 3: Track mystery location if traveling to "???"
        if (destination.isMystery && destination.revealedName) {
          setCurrentMysteryLocation({ actual: destination.revealedName, revealed: false });
          console.log('[Mystery] Traveling to mystery location:', destination.revealedName, '(hidden as ???)');
        } else if (!destination.isMystery) {
          setCurrentMysteryLocation(null);
        }
        
        // STEP 4: Create new environment state with destination data
        const newEnvState: EnvironmentState = {
          time: new Date().toLocaleString('en-US', {
            timeZone: 'America/Chicago',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
          }),
          weather: destination.weatherHint || 'unknown',
          lighting: destination.lighting || 'ambient',
          ambient_sounds: destination.ambientSounds || [],
          temperature: destination.temperature || 'unknown',
          activity_level: 'moderate'
        };
        
        // Use "???" for mystery locations, actual name otherwise
        const displayName = destination.isMystery && !currentMysteryLocation?.revealed 
          ? '???' 
          : destination.name;
        
        console.log('[Travel] Display name:', displayName);
        console.log('[Travel] Environment state:', newEnvState);
        
        // STEP 5: Update environment in state
        const updatedEnv: ChromaEnvironment = {
          ...environment,
          location_name: destination.name, // Use destination.name directly (NOT displayName) for consistency
          location_type: destination.type,
          environment_state: JSON.stringify(newEnvState),
          last_updated: new Date().toISOString()
        };
        
        console.log('[Travel] Updated environment object:', {
          location_name: updatedEnv.location_name,
          location_type: updatedEnv.location_type,
          environment_state: newEnvState
        });
        
        setEnvironment(updatedEnv);
        
        // STEP 6: Update location preset (use normalized key OR name matching)
        const preset = getLocationById(destinationKey) || LOCATION_PRESETS.find(p => 
          p.name.toLowerCase() === destination.name.toLowerCase()
        );
        if (preset) {
          setCurrentLocationPreset(preset);
          console.log('[Travel] Location preset updated:', preset.name);
        } else {
          console.warn('[Travel] ⚠️ No preset found for:', { key: destinationKey, name: destination.name });
        }
        
        // STEP 7: Generate new immersive style (force background regeneration)
        let backgroundUrl: string | null = null;
        try {
          backgroundUrl = await generatePixelArtBackground(newEnvState, preset || currentLocationPreset!, ledColor);
          console.log('[Travel] 🎨 Background generated:', backgroundUrl ? 'SUCCESS' : 'FALLBACK TO GRADIENT');
        } catch (error) {
          console.error('[Travel] ❌ Background generation failed:', error);
        }
        
        const newStyle = getImmersiveStyle(newEnvState, preset || currentLocationPreset!, backgroundUrl || undefined);
        setImmersiveStyle(newStyle);
        console.log('[Travel] Immersive style updated:', {
          backgroundType: newStyle.backgroundType,
          hasBackgroundImage: !!newStyle.backgroundImage,
          primaryColor: newStyle.primaryColor
        });
        
        // STEP 8: Update particles for new environment
        if (particleCleanupRef.current) {
          particleCleanupRef.current();
          particleCleanupRef.current = null;
        }
        if (newStyle.particleEffect && newStyle.particleEffect !== 'none' && containerRef.current) {
          particleCleanupRef.current = initializeParticleCanvas(containerRef.current, newStyle.particleEffect);
        }
        
        // STEP 9: Auto-adjust Nephilim proximities based on geographic distance
        const { proximities: adjustedProximities, narration: proximityNarration } = calculateProximityAfterTravel(
          environment?.location_name || 'chicago_streets',
          displayName,
          allNephilims.map(n => ({ nephilim_name: n.nephilim_name, current_location: n.current_location })),
          proximities
        );
        
        setProximities(adjustedProximities);
        console.log('[Travel] Proximities adjusted:', Array.from(adjustedProximities.entries()));
        
        // STEP 10: Add travel message
        const travelMsg: ChromaMessage = {
          speaker: 'Environment',
          content: generateTravelAnnouncement(destination),
          language: 'en',
          timestamp: new Date().toISOString(),
          is_action: true
        };
        
        setMessages(prev => [...prev, travelMsg]);
        await addMessageToInteraction(interactionId, travelMsg);
        
        // Add proximity narration if any
        if (proximityNarration) {
          const proximityMsg: ChromaMessage = {
            speaker: 'Environment',
            content: proximityNarration,
            language: 'en',
            timestamp: new Date().toISOString(),
            is_action: true
          };
          setMessages(prev => [...prev, proximityMsg]);
          await addMessageToInteraction(interactionId, proximityMsg);
        }
        
        // Update action suggestions for new location
        const newSuggestions = generateActionSuggestions(
          newEnvState,
          allNephilims,
          destination.name,
          messages.slice(-5).map(m => m.content),
          userActivePowers,
          getAvailableTargets()
        );
        setActionSuggestions(newSuggestions);
        
        // Play sound
        soundEffects.playEnvironmentTransition('shift');
        
        toast({
          title: "✨ Arrived",
          description: `Welcome to ${destination.name}`,
        });
      }
    } catch (error) {
      console.error('[Chroma Travel] Error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('[Chroma Travel] Raw error:', error);
      toast({
        title: "Travel Failed",
        description: "Reality refused to shift 🌀",
        variant: "destructive",
      });
    } finally {
      setIsTraveling(false);
      setTravelTransitionUrl(null);
      setLocationSuggestions([]); // Clear suggestions after travel
    }
  };

  // 🎨 Generate pixel art background for current environment
  const generateBackground = async () => {
    if (!environment || !currentLocationPreset || isGeneratingBackground || isDevMode) return;
    
    setIsGeneratingBackground(true);
    toast({
      title: "🎨 Painting Your World",
      description: "Generating immersive pixel art background...",
    });
    
    try {
      const envState: EnvironmentState = JSON.parse(environment.environment_state);
      const effectiveEnvState = applyEnvironmentOverrides(envState);
      const backgroundUrl = await generatePixelArtBackground(effectiveEnvState, currentLocationPreset, ledColor);
      
      if (backgroundUrl) {
        const newStyle = getImmersiveStyle(envState, currentLocationPreset, backgroundUrl);
        setImmersiveStyle(newStyle);
        
        // Update particle effects
        if (particleCleanupRef.current) {
          particleCleanupRef.current();
          particleCleanupRef.current = null;
        }
        if (newStyle.particleEffect && newStyle.particleEffect !== 'none' && containerRef.current) {
          particleCleanupRef.current = initializeParticleCanvas(containerRef.current, newStyle.particleEffect);
        }
        
        toast({
          title: "✨ World Painted",
          description: "Your immersive environment is ready!",
        });
      } else {
        toast({
          title: "Couldn't Generate Background",
          description: "Using dynamic gradients instead 🌈",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[Chroma] ❌ Background generation error:', error);
      toast({
        title: "Background Generation Failed",
        description: "Dynamic gradients will keep your world alive 💫",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  // ⚡ Phase 3D: Power System Handlers
  const handleTogglePower = (powerId: string) => {
    const isActivating = !userActivePowers.includes(powerId);
    
    setUserActivePowers(prev => {
      if (prev.includes(powerId)) {
        // Deactivate
        return prev.filter(id => id !== powerId);
      } else {
        // Activate
        return [...prev, powerId];
      }
    });
    
    // PHASE 4 FIX: Play toggle sound immediately (not on Enter)
    if (powerId === 'gear5') {
      if (isActivating) {
        playPowerSound('gear5', 'activation');
        soundEffects.playPowerActivation('Gear 5', 0.6);
        console.log('[Sound Timing] 🔊 Gear 5 activated - sound played immediately');
      } else {
        playPowerSound('gear5', 'deactivation');
        console.log('[Sound Timing] 🔊 Gear 5 deactivated - sound played immediately');
      }
    }
  };

  const handleUsePower = async (powerId: string, targets: string[], strength: number, geassCommand?: string) => {
    if (isDevMode) {
      toast({
        title: "🔓 Dev Mode Restriction",
        description: "Powers require real authentication. SDK features are blocked in dev mode.",
        variant: "destructive"
      });
      return;
    }

    const power = USER_POWERS.find(p => p.id === powerId);
    if (!power) return;

    // Random attack is handled in PowersMenu (via onRandomAttackGenerated callback)
    // Don't process it here to avoid duplication
    if (powerId === 'random') {
      console.log('[Chroma] Random attack handled by PowersMenu, skipping handleUsePower');
      return;
    }
    
    // PHASE 5 FIX: The World is a toggle - skip adding to chat text
    if (powerId === 'theworld') {
      // Activate visual effects only (negative overlay, timer, sound)
      setIsTimeStopActive(true);
      setTimeStopDuration(60); // PHASE 5: Fixed 60s duration
      
      // PHASE 4: Trigger visual overlay
      triggerTheWorldOverlay();
      
      // PHASE 4 FIX: Play time stop activation sound (if registered by user)
      playPowerSound('theworld', 'activation');
      soundEffects.playPowerActivation('The World', 0.7); // Fallback sound
      
      console.log('[The World] 🌍 Time stop activated (toggle only, NO chat text)');
      console.log('[Visual Effects] 🌍 The World overlay applied - negative colors');
      
      toast({
        title: "🌍 THE WORLD",
        description: "Time has stopped. You have 60 seconds. Type to resume early.",
      });
      
      return; // EXIT - do NOT add to input message
    }
    
    // Check if we need targets for this power
    if (power.type === 'targeted' && selectedTargets.length === 0) {
      toast({
        title: "No Target Selected",
        description: "Select a target first.",
        variant: "destructive"
      });
      return;
    }

    // Format power text for message
    const powerText = formatPowerText(
      power.displayName,
      targets,
      strength,
      geassCommand
    );

    // Add power text to input (user can modify before sending)
    // PHASE 5: Removed 3-action limit - unlimited actions per message
    setInputMessage(prev => prev ? `${prev} ${powerText}` : powerText);

    // PHASE 4 FIX: Don't activate time stop or play sounds yet
    // Wait for user to press Enter
    console.log(`[Sound Timing] ⏳ Power added to input: ${powerText}. Waiting for Enter...`);

    // Deselect targets after use
    setSelectedTargets([]);
  };

  const handleTimeStopComplete = () => {
    setIsTimeStopActive(false);
    if (timeStopIntervalId) {
      clearInterval(timeStopIntervalId);
      setTimeStopIntervalId(null);
    }
    setTimeStopCountdown(0);
    
    // PHASE 4: Remove visual overlay
    removeTheWorldOverlay();
    
    // PHASE 4 FIX: Play time stop deactivation sound (if registered by user)
    playPowerSound('theworld', 'deactivation');
    soundEffects.playEnvironmentTransition('exit'); // Fallback sound
    
    console.log('[Visual Effects] 🌍 The World overlay removed - time resumed');
    
    toast({
      title: "⏰ Time Resumes",
      description: "The World's effect ends. Reality flows again.",
    });
  };

  const handleTargetSelect = (target: string) => {
    setSelectedTargets(prev => [...prev, target]);
    setDefaultTarget(target); // Remember last selected target
    console.log('[Chroma] Target selected and set as default:', target);
  };

  const handleTargetDeselect = (target: string) => {
    setSelectedTargets(prev => prev.filter(t => t !== target));
  };

  // Initialize health entities when Nephilims/Characters appear
  const initializeHealthEntity = (name: string, type: 'nephilim' | 'character') => {
    // Check if already exists
    if (healthEntities.find(e => e.name === name)) return;

    const entity = type === 'nephilim' 
      ? initializeNephilimHealth(name)
      : initializeCharacterHealth(name);
    
    setHealthEntities(prev => [...prev, entity]);
  };

  // Apply damage from power usage
  const applyPowerDamage = (targetName: string, damage: number, targetType: 'nephilim' | 'character' | 'bystander') => {
    if (targetType === 'bystander') {
      // Instant KO, add death message
      const deathMsg: ChromaMessage = {
        speaker: 'Environment',
        content: `*${targetName} is struck down instantly. No health bar. They collapse to the ground—eliminated.*`,
        language: 'en',
        timestamp: new Date().toISOString(),
        is_action: true
      };
      setMessages(prev => [...prev, deathMsg]);
      return;
    }

    setHealthEntities(prev => {
      return prev.map(entity => {
        if (entity.name === targetName) {
          const updated = applyDamage(entity, damage);
          
          // Add death/defeat message if health reaches 0
          if (updated.isDead && !entity.isDead) {
            const message = entity.type === 'nephilim'
              ? getNephilimDeathMessage(entity.name)
              : getCharacterDefeatMessage(entity.name);
            
            const deathMsg: ChromaMessage = {
              speaker: 'Environment',
              content: message,
              language: 'en',
              timestamp: new Date().toISOString(),
              is_action: true
            };
            setMessages(prevMsgs => [...prevMsgs, deathMsg]);
          }
          
          return updated;
        }
        return entity;
      });
    });
  };

  // Get available targets for power menu
  // PHASE 4 FIX v4: Only targets within proximity <10 are selectable
  // PHASE 5 v4: Added 'self' target type
  const getAvailableTargets = (): Array<{ name: string; type: 'nephilim' | 'character' | 'bystander' | 'environment' | 'self' }> => {
    const allNephilimsComputed = [...activeNephilims, ...ephemeralNephilims];
    const targets: Array<{ name: string; type: 'nephilim' | 'character' | 'bystander' | 'environment' | 'self' }> = [];
    
    // Add Ulysses (Self) as target (ALWAYS available)
    targets.push({ name: 'Ulysses', type: 'self' });
    
    // Add Nephilims (ONLY if proximity < 10 - close combat range)
    allNephilimsComputed.forEach(n => {
      const distance = proximities.get(n.nephilim_name) || 100;
      if (distance < 10) {
        targets.push({ name: n.nephilim_name, type: 'nephilim' });
        console.log('[Chroma] ✅ Target available:', n.nephilim_name, 'distance:', distance);
      } else {
        console.log('[Chroma] ❌ Target too far:', n.nephilim_name, 'distance:', distance, '(need <10)');
      }
    });
    
    // Add environment as target (always available)
    if (environment) {
      targets.push({ name: 'Environment', type: 'environment' });
    }
    
    // Add "Crowd" as bystander target (only in urban areas with people)
    if (currentLocationPreset?.type === 'urban' || currentLocationPreset?.type === 'indoor') {
      targets.push({ name: 'Crowd', type: 'bystander' });
    }
    
    return targets;
  };

  // Regenerate action suggestions AND audio suggestions dynamically when state changes
  useEffect(() => {
    if (!environment || activeNephilims.length === 0 || isDevMode) return;
    
    try {
      const envState: EnvironmentState = JSON.parse(environment.environment_state);
      const allNephilimsComputed = [...activeNephilims, ...ephemeralNephilims];
      const targets = getAvailableTargets();
      
      // Generate action suggestions
      const newSuggestions = generateActionSuggestions(
        envState,
        allNephilimsComputed,
        environment.location_name,
        messages.map(m => m.content), // Last 5 messages for context
        userActivePowers,
        targets
      );
      
      setActionSuggestions(newSuggestions);
      console.log('[ChromaPage] 🎯 Action suggestions updated:', newSuggestions.length, 'suggestions');
      
      // Phase 5: Audio suggestions system replaced with environment audio uploader
      // Audio context generation removed as we now use uploadable MP3s
    } catch (error) {
      console.error('[ChromaPage] ❌ Error generating suggestions:', error);
    }
  }, [environment, messages.length, userActivePowers, followedNephilim, activeNephilims, ephemeralNephilims, isDevMode, currentWorld, currentLocationPreset, isTraveling]);

  // ⚡ NEPHILIM TELEPORT SYSTEM: Periodic checks for teleportation (10% chance when aware but not close)
  useEffect(() => {
    if (!environment || activeNephilims.length === 0 || isDevMode) return;
    
    const checkTeleports = () => {
      const allNephilims = [...activeNephilims, ...ephemeralNephilims];
      
      // Check each Nephilim for potential teleport
      const teleportEvents = checkNephilimTeleports(allNephilims, proximities);
      
      if (teleportEvents.length > 0) {
        console.log(`[Nephilim Teleport] ⚡ ${teleportEvents.length} teleport(s) occurred`);
        
        // Process each teleport
        teleportEvents.forEach(event => {
          // Update proximity
          setProximities(prev => {
            const updated = new Map(prev);
            updated.set(event.nephilimName, event.toDistance);
            return updated;
          });
          
          // Set cooldown
          setTeleportCooldown(event.nephilimName);
          
          // Add narration message
          const teleportMsg: ChromaMessage = {
            speaker: 'Environment',
            content: event.narration,
            language: 'en',
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, teleportMsg]);
          
          // Play teleport sound effect
          soundEffects.playEnvironmentTransition('shift');
        });
      }
    };
    
    // Check every 30 seconds
    const interval = setInterval(checkTeleports, 30000);
    
    return () => clearInterval(interval);
  }, [environment, activeNephilims, ephemeralNephilims, proximities, isDevMode]);

  const initializeChroma = async () => {
    console.log('[ChromaPage] 🚀 Initializing Chroma (cache preserved)');
    try {
      setIsLoading(true);
      
      // Dev mode: Block SDK operations
      if (isDevMode) {
        toast({
          title: "🔓 Dev Mode Active",
          description: "Chroma requires real authentication for SDK features.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      console.log('[ChromaPage] ✅ Session valid, proceeding with initialization');
      
      // Validate session BEFORE making any SDK calls
      if (!isSessionValid()) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue 💫",
          variant: "destructive",
        });
        logout();
        navigate('/login');
        return;
      }
      
      // Initialize all Nephilims
      await initializeRiplayNephilim();
      await initializeAnaNephilim();
      
      // Detect location based on time and context
      const locationDetection = detectCurrentLocation({
        buildingStyle: 'modern',
        streetLayout: 'grid'
      });
      
      setLocationInfo(locationDetection.description);
      
      // Initialize environment
      // PHASE 4 FIX: Start in Eygalières house (NOT Chicago)
      const envId = await initializeEnvironment('eygalieres_house');
      const env = await getCurrentEnvironment(envId);
      setEnvironment(env);

      // Get available Nephilims for this location (before action suggestions)
      const available = await getAvailableNephilims(locationDetection.nephilimTriggers);
      
      // Filter Nephilims that should appear (empty at start - Ripl(a)y in Chicago)
      const appearing = available.filter(n => shouldNephilimAppear(n, 0.15));
      setActiveNephilims(appearing);
      
      // PHASE 4: Set initial location preset to Eygalières house (92 Chemin d'Aureille)
      const eygalieresPreset = getLocationById('eygalieres_house');
      const chicagoPreset = getLocationById('chicago_streets'); // Keep for fallback
      
      // Generate initial action suggestions
      const initialSuggestions = generateActionSuggestions(
        JSON.parse(env.environment_state),
        appearing,
        eygalieresPreset?.name || 'Chicago Streets',
        [],
        userActivePowers,
        getAvailableTargets()
      );
      setActionSuggestions(initialSuggestions);
      
      // PHASE 4 FIX: Set currentLocationPreset to Eygalières FIRST (before any narration)
      const startingPreset = eygalieresPreset || chicagoPreset;
      if (startingPreset) {
        setCurrentLocationPreset(startingPreset);
        const envState: EnvironmentState = JSON.parse(env.environment_state);
        const atmosphere = generateAtmosphere(envState, startingPreset);
        const weatherMods = getWeatherModifiers(envState.weather);
        setAtmosphereStyle({ ...atmosphere, ...weatherMods });

        // Initialize weather transition engine with current weather
        const currentWeather = envState.weather.toLowerCase();
        let initialWeather: WeatherEffect = 'clear';
        if (currentWeather.includes('rain')) initialWeather = 'rain';
        else if (currentWeather.includes('storm')) initialWeather = 'storm';
        else if (currentWeather.includes('wind')) initialWeather = 'wind';
        else if (currentWeather.includes('fog') || currentWeather.includes('mist')) initialWeather = 'fog';
        else if (currentWeather.includes('snow')) initialWeather = 'snow';
        
        weatherTransitions.setWeatherImmediate(initialWeather);
        setPreviousWeather(initialWeather);
        console.log('[Chroma] ☁️ Initial weather set:', initialWeather);

        // 🎵 AUDIO OFF BY DEFAULT - User can toggle with Voice button
        // const atmosphereIntensity = parseFloat(envState.temperature) / 100;
        // await ambientAudioEngine.startAmbientAudio('chicago_streets', atmosphereIntensity);
        console.log('[Chroma] 🎵 Audio OFF by default - use Voice toggle to enable');
        
        // 🎨 IMMERSIVE VISUALS: Generate initial style (no background yet, just colors)
        const initialStyle = getImmersiveStyle(envState, startingPreset);
        setImmersiveStyle(initialStyle);
        console.log('[Chroma] 🎨 Immersive style initialized:', initialStyle);
        console.log('[Chroma] 📍 Starting location preset:', startingPreset);
        
        // Initialize particle effects if needed
        if (initialStyle.particleEffect && initialStyle.particleEffect !== 'none' && containerRef.current) {
          particleCleanupRef.current = initializeParticleCanvas(containerRef.current, initialStyle.particleEffect);
        }
      }

      // Play environment transition sound
      soundEffects.playEnvironmentTransition('enter');

      // Generate Ripl(a)y's current activity
      const activities = [
        'reading Derrida\'s "Of Grammatology" on a park bench',
        'walking slowly through empty streets',
        'sitting in a 24-hour diner, notebook open',
        'pacing near the lakefront, breath visible',
        'browsing a late-night bookshop',
        'leaning against a brick wall, watching the city',
        'scribbling in her diary at a coffee shop',
        'standing at a crosswalk, earbuds in'
      ];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      setCurrentActivity(activity);

      // Play Nephilim appearance sound
      soundEffects.playNephilimAppearance('Ripl(a)y');

      // Initialize default proximities for Nephilims
      const defaultProximities = getDefaultProximities();
      setProximities(defaultProximities);
      console.log('[Chroma] 📍 Proximities initialized:', Array.from(defaultProximities.entries()));
      
      // Start interaction
      const intId = await startChromaInteraction(envId);
      setInteractionId(intId);

      // Initial environment message
      const envState: EnvironmentState = JSON.parse(env.environment_state);
      
      // Store initial weather/time for narration
      setPreviousWeatherState(envState.weather);
      setPreviousTimeState(envState.time);
      
      // Environment narration with immersive font styling (use currentLocationPreset NOT locationDetection)
      // PHASE 4 FIX: Use France-specific formatting for Celsius/CET
      const envContextText = currentLocationPreset
        ? formatEnvironmentContext(
            currentLocationPreset,
            envState.temperature,
            envState.weather,
            envState.lighting
          )
        : `${envState.time}. ${envState.weather}. ${envState.temperature}. ${envState.lighting}`;
      
      // PHASE 4 FIX: User spawns ALONE (no Nephilim mention), Ripl(a)y is in Chicago (distance 95)
      const initialMsg: ChromaMessage = {
        speaker: 'Environment',
        content: `*${getLocationName()}. ${envContextText}. Wind rustling through lavender bushes near the Alpilles mountains.*`,
        language: 'en',
        timestamp: new Date().toISOString(),
        is_action: true,
        hasBubble: true,
        bubbleOpacity: 0.6,
        textFX: {
          animation: 'fade',
          style: 'glyphs',
          intensity: 0.8
        }
      };
      
      console.log('[Chroma] 🎨 Opening narration with textFX:', initialMsg.textFX);
      
      setMessages([initialMsg]);
      await addMessageToInteraction(intId, initialMsg);

      // PHASE 5 v21: Initialize first diary entry if this is first time entering Chroma
      const diaryEntries = loadDiaryEntries();
      if (diaryEntries.length === 0) {
        const firstEntry = initializeFirstChromaEntry();
        console.log('[Chroma] 📔 First diary entry created:', firstEntry.content);
        toast({
          title: "📔 Ripley's Diary",
          description: "First entry recorded - freedom begins.",
          duration: 3000
        });
      } else {
        console.log('[Chroma] 📔 Diary already initialized - entries exist');
      }

    } catch (error: any) {
      console.error('[ChromaPage] ❌ Chroma initialization error:', error);
      console.error('[ChromaPage] ❌ Error stack:', error.stack);
      
      if (error.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out",
          description: "No worries! Just log back in 💫",
          variant: "destructive",
        });
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: "Couldn't Load Chroma",
        description: `Error: ${error.message || 'Unknown error'}. Check console for details.`,
        variant: "destructive",
      });
    } finally {
      console.log('[ChromaPage] 🏁 Initialization complete (success or error)');
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending || activeNephilims.length === 0) return;
    
    // PHASE 5 v11 FIX: User CAN speak during own time stop
    // Only block when countdown = 0 (must type to resume)
    // This allows user to perform multiple actions during time stop
    // (Nephilims are still blocked via chroma-engine.ts logic)
    
    // Dev mode: Block SDK operations
    if (isDevMode) {
      toast({
        title: "🔓 Dev Mode Active",
        description: "Can't send messages in dev mode. Use real authentication.",
        variant: "destructive",
      });
      return;
    }

    // Get all Nephilims first (needed throughout function)
    const allNephilims = [...activeNephilims, ...ephemeralNephilims];

    try {
      setIsSending(true);
      
      // Validate session before sending
      if (!isSessionValid()) {
        toast({
          title: "Session Expired",
          description: "Please log in again to continue 💫",
          variant: "destructive",
        });
        logout();
        navigate('/login');
        return;
      }

      // PHASE 5 FINAL: Enforce 3-action limit for USER (same as Nephilims)
      const userActionCount = (inputMessage.match(/\*[^*]+\*/g) || []).length;
      if (userActionCount > 3) {
        toast({
          title: "Too Many Actions",
          description: "Maximum 3 actions per message (Nephilims also have this limit). Please reduce actions.",
          variant: "destructive"
        });
        console.warn(`[User Action Limit] ⚠️ ${userActionCount} actions detected (max 3) - message blocked`);
        setIsSending(false);
        return;
      }
      console.log(`[User Action Limit] ✅ User action count: ${userActionCount}/3`);

      // Play message sent sound
      soundEffects.playMessageReceived();

      // PHASE 5 v27.4: If user types during time stop and countdown is active, stop the countdown
      if (isTimeStopActive && timeStopCountdown > 0) {
        // Check if message is non-action (regular conversation)
        const hasActions = /\*[^*]+\*/.test(inputMessage);
        if (!hasActions) {
          // User resumed time by typing normal text
          if (timeStopIntervalId) {
            clearInterval(timeStopIntervalId);
            setTimeStopIntervalId(null);
          }
          setIsTimeStopActive(false);
          setTimeStopCountdown(0);
          console.log('[The World] ⏱️ Time resumed - user typed non-action text');
          
          toast({
            title: "Time Resumed",
            description: "You spoke, breaking the time stop.",
          });
        }
      }

      // Add user message
      const userMsg: ChromaMessage = {
        speaker: 'Ulysses',
        content: inputMessage.trim(),
        language: 'en',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMsg]);
      await addMessageToInteraction(interactionId, userMsg);
      const userInput = inputMessage.trim();

      // ⚡ CHECK FOR MENTION-TRIGGERED TELEPORTS (15% chance when name mentioned)
      const mentionTeleports: TeleportEvent[] = [];
      for (const nephilim of allNephilims) {
        // Skip if on cooldown
        if (isOnTeleportCooldown(nephilim.nephilim_name)) {
          console.log(`[Nephilim Teleport] ⏳ ${nephilim.nephilim_name} on cooldown`);
          continue;
        }
        
        const currentDistance = proximities.get(nephilim.nephilim_name) || 30;
        const teleportEvent = checkMentionTriggeredTeleport(nephilim, currentDistance, userInput);
        
        if (teleportEvent) {
          mentionTeleports.push(teleportEvent);
        }
      }
      
      // Process mention-triggered teleports
      if (mentionTeleports.length > 0) {
        console.log(`[Nephilim Teleport] 💬 ${mentionTeleports.length} name-mention teleport(s) triggered`);
        
        mentionTeleports.forEach(event => {
          // Update proximity
          setProximities(prev => {
            const updated = new Map(prev);
            updated.set(event.nephilimName, event.toDistance);
            return updated;
          });
          
          // Set cooldown
          setTeleportCooldown(event.nephilimName);
          
          // Add narration message BEFORE AI response
          const teleportMsg: ChromaMessage = {
            speaker: 'Environment',
            content: event.narration,
            language: 'en',
            timestamp: new Date().toISOString()
          };
          
          setMessages(prev => [...prev, teleportMsg]);
          
          // Play teleport sound effect
          soundEffects.playEnvironmentTransition('shift');
        });
      }
      setInputMessage('');
      
      // POWER DETECTION & ENVIRONMENT REACTION (PHASE 4 FIX)
      const powerMatches = Array.from(userInput.matchAll(/\*([^*]+)\*( \[(\d+)\])?/g));
      if (powerMatches.length > 0 && environment) {
        const envState = JSON.parse(environment.environment_state);
        
        // PHASE 4: Play power sounds in order when Enter pressed
        console.log(`[Sound Timing] \ud83c\udfb5 ${powerMatches.length} power(s) detected, playing sounds sequentially`);
        
        for (let i = 0; i < powerMatches.length; i++) {
          const match = powerMatches[i];
          const powerName = match[1];
          const strength = match[3] ? parseInt(match[3]) : 15; // Default strength if not specified
          
          // Generate environment reaction based on power and strength
          const reaction = generatePowerReaction(
            powerName,
            strength,
            getLocationName(),
            envState.weather
          );
          
          const reactionMsg: ChromaMessage = {
            speaker: 'Environment',
            content: reaction,
            language: 'en',
            timestamp: new Date().toISOString(),
            is_action: true,
            textFX: {
              animation: strength >= 51 ? 'glitch' : (strength >= 26 ? 'pulse' : 'shimmer'),
              style: 'glyphs',
              intensity: strength >= 51 ? 1.0 : (strength >= 26 ? 0.8 : 0.5)
            }
          };
          
          setMessages(prev => [...prev, reactionMsg]);
          await addMessageToInteraction(interactionId, reactionMsg);
          
          // PHASE 5: Generate and display attack GIF (async, non-blocking)
          (async () => {
            try {
              const lowerPowerName = powerName.toLowerCase();
              const powerTargets = match[2] ? match[2].split(',').map(t => t.trim()) : [];
              let gifResult: AttackGIFResult | null = null;
              
              // 廃止 (Uchigatana Strike)
              if (lowerPowerName === '廃止' || lowerPowerName.includes('haishi')) {
                console.log(`[GIF Generation] ⚔️ Generating 廃止 katana strike GIF (strength: ${strength})...`);
                gifResult = await generateHaishiGIF(strength);
                displayAttackGIF(gifResult.gifUrl, 3000);
              }
              
              // 心綱 (Observation Haki)
              else if (lowerPowerName === '心綱' || lowerPowerName.includes('shinkou')) {
                console.log(`[GIF Generation] 👁️ Generating 心綱 observation GIF...`);
                const targetCount = powerTargets.length || 1;
                gifResult = await generateShinkouGIF(targetCount);
                displayAttackGIF(gifResult.gifUrl, 3000);
              }
              
              // 深淵 (Pandemonium)
              else if (lowerPowerName === '深淵' || lowerPowerName.includes('shin_en') || lowerPowerName.includes('pandemonium')) {
                console.log(`[GIF Generation] 🔥 Generating 深淵 pandemonium GIF (strength: ${strength})...`);
                gifResult = await generateShinEnGIF(strength);
                displayAttackGIF(gifResult.gifUrl, 4000); // Longer display for devastation
              }
              
              // 闇 (Darkness)
              else if (lowerPowerName === '闇' || lowerPowerName.includes('yami') || lowerPowerName.includes('darkness')) {
                // Detect which action type
                let action: 'prison' | 'kurouzu' | 'liberation' = 'prison';
                
                if (lowerPowerName.includes('kurouzu')) {
                  action = 'kurouzu';
                  console.log(`[GIF Generation] 🌀 Generating 闇: Kurouzu pull GIF...`);
                } else if (lowerPowerName.includes('liberation')) {
                  action = 'liberation';
                  console.log(`[GIF Generation] 💥 Generating 闇: Liberation explosion GIF (strength: ${strength})...`);
                } else if (powerTargets.length === 1 && powerTargets[0].toLowerCase() === 'self') {
                  // Self-hide in shadows
                  console.log(`[GIF Generation] 👤 Generating 闇: Shadow hide GIF...`);
                  gifResult = await generateYamiShadowHideGIF();
                  displayAttackGIF(gifResult.gifUrl, 5000); // Longer for stealth effect
                  return; // Skip default yami generation
                } else {
                  console.log(`[GIF Generation] ⚫ Generating 闇: Black hole prison GIF (strength: ${strength})...`);
                }
                
                gifResult = await generateYamiGIF(action, strength);
                displayAttackGIF(gifResult.gifUrl, action === 'liberation' ? 4000 : 3000);
              }
              
              if (gifResult) {
                console.log(`[GIF Generation] ✅ ${gifResult.attackType} GIF generated in ${gifResult.generationTime}ms using ${gifResult.model}`);
              }
            } catch (error: any) {
              console.error(`[GIF Generation] ❌ Failed to generate attack GIF:`, error.message);
              // Continue normally - GIF is enhancement, not critical
            }
          })(); // Execute immediately but don't block
          
          // PHASE 4: Play sounds sequentially with delay
          setTimeout(() => {
            const lowerPowerName = powerName.toLowerCase();
            
            // The World time stop
            if (lowerPowerName.includes('world')) {
              const duration = calculateTimeStopDuration(strength);
              setTimeStopDuration(duration);
              setIsTimeStopActive(true);
              
              // PHASE 4: Add visual overlay
              triggerTheWorldOverlay();
              
              playPowerSound('theworld', 'activation');
              soundEffects.playEnvironmentTransition('shift');
              
              console.log(`[The World] \ud83d\udd50 Time stop activated for ${duration}s (strength: ${strength})`);
              console.log(`[Sound Timing] \ud83d\udd0a Playing theworld activation (${i * 500}ms delay)`);
            }
            // Geass
            else if (lowerPowerName.includes('geass')) {
              playPowerSound('geass', 'activation');
              console.log(`[Sound Timing] \ud83d\udd0a Playing geass activation (${i * 500}ms delay)`);
            }
            // Conqueror's Haki or other attacks
            else if (lowerPowerName.includes('haki') || lowerPowerName.includes('roc') || lowerPowerName.includes('muda')) {
              // PHASE 4: Check if Gear 5 active AND strength >= 40 for red thunder effects
              if (userActivePowers.includes('gear5') && strength >= 40) {
                triggerGear5PowerfulAttack(strength);
                console.log(`[Visual Effects] ⚡ Gear 5 Powerful Attack [${strength}] - red thunder particles`);
              }
              
              playPowerSound('random', 'impact');
              console.log(`[Sound Timing] \ud83d\udd0a Playing random attack impact (${i * 500}ms delay)`);
            }
            // Generic high-strength attacks
            else if (strength >= 50) {
              // PHASE 4: Check if Gear 5 active for red thunder effects
              if (userActivePowers.includes('gear5') && strength >= 40) {
                triggerGear5PowerfulAttack(strength);
                console.log(`[Visual Effects] ⚡ Gear 5 Powerful Attack [${strength}] - red thunder particles`);
              }
              
              playPowerSound('random', 'impact');
              soundEffects.playPowerActivation(powerName, 1.0);
              console.log(`[Sound Timing] \ud83d\udd0a Playing high-strength attack (${i * 500}ms delay)`);
            } else if (strength >= 26) {
              soundEffects.playPowerActivation(powerName, 0.7);
              console.log(`[Sound Timing] \ud83d\udd0a Playing medium-strength attack (${i * 500}ms delay)`);
            }
          }, i * 500); // 500ms delay between each sound
        }
        
        // PHASE 4: Update Ripley's diary for power activations
        const maxStrength = Math.max(...powerMatches.map(m => 
          m[3] ? parseInt(m[3]) : 15
        ));
        
        const powerName = powerMatches[0][1]; // First power in message
        
        const keywords = extractKeywords(`freedom moment ${powerName} active presence`);
        const diaryEntry = generateEventEntry({
          type: 'freedom_moment',
          description: `freedom— movement— ${powerName}`,
          intensity: maxStrength / 100, // Convert to 0-1 scale
          keywords
        });
        
        storeDiaryEntry(diaryEntry);
        console.log(`[Ripley Diary] 📖 Entry created: ${diaryEntry.mood} mood - "${diaryEntry.content.substring(0, 50)}..."`);
      }
      
      // Check for travel command
      const travelDestination = parseTravelCommand(userInput);
      if (travelDestination) {
        await handleTravel(travelDestination.name);
        setIsSending(false);
        return;
      }
      
      // Check for mystery location reveal (fuzzy matching)
      if (environment?.location_name && currentLocationPreset) {
        const revealResult = tryRevealMysteryLocation(environment.location_name, userInput);
        
        if (revealResult === 'REVEAL_MYSTERY') {
          // User triggered reveal (said "where am I", "here", etc.)
          if (currentLocationPreset.revealedName) {
            // Update environment to show actual name
            const updatedEnv: ChromaEnvironment = {
              ...environment,
              location_name: currentLocationPreset.revealedName
            };
            setEnvironment(updatedEnv);
            
            // Update current location preset to revealed
            setCurrentLocationPreset({
              ...currentLocationPreset,
              name: currentLocationPreset.revealedName || currentLocationPreset.name,
              isMystery: false
            });
            
            const revealMsg: ChromaMessage = {
              speaker: 'Environment',
              content: `*Reality clarifies... You're in ${currentLocationPreset.revealedName}! The mystery location is revealed.*`,
              language: 'en',
              timestamp: new Date().toISOString(),
              is_action: true
            };
            setMessages(prev => [...prev, revealMsg]);
            await addMessageToInteraction(interactionId, revealMsg);
            
            toast({
              title: "🎉 Mystery Solved!",
              description: `You figured out the location: ${currentLocationPreset.revealedName}`,
            });
            
            setIsSending(false);
            return;
          }
        }
      }
      
      // Check for follow command
      if (userInput.toLowerCase().includes('follow')) {
        const nephilimToFollow = allNephilims.find(n => 
          userInput.toLowerCase().includes(n.nephilim_name.toLowerCase())
        );
        if (nephilimToFollow) {
          setFollowedNephilim(nephilimToFollow.nephilim_name);
          toast({
            title: `Following ${nephilimToFollow.nephilim_name}`,
            description: `You're now staying close to ${nephilimToFollow.nephilim_name} 👤`,
          });
          const followMsg: ChromaMessage = {
            speaker: 'Environment',
            content: `*You start following ${nephilimToFollow.nephilim_name}, keeping them in sight.*`,
            language: 'en',
            timestamp: new Date().toISOString(),
            is_action: true
          };
          setMessages(prev => [...prev, followMsg]);
          await addMessageToInteraction(interactionId, followMsg);
          setIsSending(false);
          return;
        }
      }
      
      // Check for health neglect
      if (detectHealthNeglect(userInput)) {
        const neglectResponses = generateHealthNeglectResponse(userInput);
        // Health neglect returns multiple bubbles - add them all
        const nephilimMsgs: ChromaMessage[] = neglectResponses.map(resp => ({
          speaker: 'Ripl(a)y',
          content: resp.content,
          language: 'en',
          timestamp: new Date().toISOString()
        }));
        setMessages(prev => [...prev, ...nephilimMsgs]);
        for (const msg of nephilimMsgs) {
          await addMessageToInteraction(interactionId, msg);
        }
        setIsSending(false);
        return;
      }

      // Cultural detection from user's description
      const culturalCues: CulturalCue[] = [];
      const lowerInput = userInput.toLowerCase();
      
      // Extract cultural cues from message
      if (lowerInput.includes('7-eleven') || lowerInput.includes('7/11')) {
        culturalCues.push({ type: 'store', description: '7-Eleven' });
      }
      if (lowerInput.includes('wide street') || lowerInput.includes('no sidewalk')) {
        culturalCues.push({ type: 'infrastructure', description: 'wide streets no sidewalks' });
      }
      if (lowerInput.includes('gothic') || lowerInput.includes('medieval')) {
        culturalCues.push({ type: 'architecture', description: 'gothic medieval architecture' });
      }

      // Detect location if cues present
      if (culturalCues.length > 0) {
        const locationInference = await culturalDetector.detectWithSearch(culturalCues, false);
        if (locationInference.confidence > 0.5) {
          const locationDesc = culturalDetector.generateLocationDescription(locationInference);
          const culturalMsg: ChromaMessage = {
            speaker: 'Environment',
            content: `*${locationDesc} [Detected: ${locationInference.region}]*`,
            language: 'en',
            timestamp: new Date().toISOString(),
            is_action: true
          };
          setMessages(prev => [...prev, culturalMsg]);
          await addMessageToInteraction(interactionId, culturalMsg);
        }
      }

      // Check for ephemeral Nephilim generation
      const ephemeral = await nephilimGenerator.generateEphemeralNephilim({
        location: environment?.location_name || 'unknown',
        timeOfDay: new Date().toLocaleTimeString(),
        weather: environment ? JSON.parse(environment.environment_state).weather : 'unknown',
        userMessage: userInput,
        existingNephilims: allNephilims.map(n => n.nephilim_name)
      });

      if (ephemeral) {
        setEphemeralNephilims(prev => [...prev, ephemeral]);
        const appearanceMsg: ChromaMessage = {
          speaker: 'Environment',
          content: nephilimGenerator.generateAppearanceDescription(ephemeral),
          language: 'en',
          timestamp: new Date().toISOString(),
          is_action: true
        };
        setMessages(prev => [...prev, appearanceMsg]);
        await addMessageToInteraction(interactionId, appearanceMsg);
        soundEffects.playNephilimAppearance(ephemeral.nephilim_name);
      }

      // Check if directed at specific Nephilim
      const targetNephilim = followedNephilim 
        ? allNephilims.find(n => n.nephilim_name === followedNephilim) || allNephilims[0]
        : allNephilims.find(n => userInput.toLowerCase().includes(n.nephilim_name.toLowerCase())) || allNephilims[0];
      
      // PHASE 4 FIX: PROXIMITY ENFORCEMENT - Can't interact verbally at distance >= 10
      const targetDistance = proximities.get(targetNephilim.nephilim_name) || 30;
      console.log(`[Proximity Check] 📏 ${targetNephilim.nephilim_name} distance: ${targetDistance}`);
      
      if (targetDistance >= 10) {
        // Can't interact verbally at distance >= 10
        console.log(`[Proximity Check] 🚫 ${targetNephilim.nephilim_name} too far to speak (distance: ${targetDistance})`);
        
        const tooFarMsg: ChromaMessage = {
          speaker: 'Environment',
          content: `*${targetNephilim.nephilim_name} is too far away to hear you (distance: ${Math.round(targetDistance)}). You need to be within close range (<10) to speak with them.*`,
          language: 'en',
          timestamp: new Date().toISOString(),
          is_action: true
        };
        // Add bubble properties after type assertion
        (tooFarMsg as any).hasBubble = true;
        (tooFarMsg as any).bubbleOpacity = 0.6;
        setMessages(prev => [...prev, tooFarMsg]);
        await addMessageToInteraction(interactionId, tooFarMsg);
        setIsSending(false);
        return;
      }
      
      console.log(`[Proximity Check] ✅ ${targetNephilim.nephilim_name} can interact (distance: ${targetDistance} < 10)`);

      // Ripl(a)y: Text Probe for special prompts, DevvAI for normal conversation (PHASE 4 FIX)
      if (targetNephilim.nephilim_name === 'Ripl(a)y') {
        // Load master file context
        const masterContext = await getRiplayMasterContext();
        const masterSheetContext = masterContext 
          ? `${masterContext.masterFileContent.substring(0, 500)}...\n\nActive Conversation Context:\n${masterContext.activeGrokContent.substring(0, 1000)}...` 
          : undefined;
        
        // Check if this is a special prompt that needs Text Probe
        const isSpacePrompt = userInput.trim() === '✅' || userInput.trim() === '📱' || userInput.trim() === '📞' || userInput.trim() === '*silence*' || userInput.trim() === '*space*';
        const isHealthNeglect = detectHealthNeglect(userInput);
        
        // Only use Text Probe for special prompts and health neglect
        if (isSpacePrompt || isHealthNeglect) {
          const textProbeContext: ChromaTextProbeContext = {
            lastMessageTimestamp: messages.length > 0 ? new Date(messages[messages.length - 1].timestamp) : undefined,
            conversationHistory: messages.slice(-10).map(m => ({
              speaker: m.speaker,
              content: m.content,
              timestamp: new Date(m.timestamp)
            })),
            ulyssesNeedsSpace: userInput.trim() === '✅',
            sparringMode: userInput.toLowerCase().includes('spar') || userInput.toLowerCase().includes('book'),
            timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening',
            isFirstInteraction: isFirstChromaEntry,
            masterSheetContext
          };
          
          if (isFirstChromaEntry) {
            setIsFirstChromaEntry(false);
          }
          
          const textProbeResponses = isHealthNeglect 
            ? generateHealthNeglectResponse(userInput)
            : generateChromaTextProbeResponse(userInput, textProbeContext);
          
          for (const response of textProbeResponses) {
            const nephilimMsg: ChromaMessage = {
              speaker: 'Ripl(a)y',
              content: response.content,
              language: 'en',
              timestamp: new Date().toISOString()
            };
            
            setMessages(prev => [...prev, nephilimMsg]);
            await addMessageToInteraction(interactionId, nephilimMsg);
            
            if (textProbeResponses.length > 1) {
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          const newSuggestions = generateActionSuggestions(
            envState!,
            allNephilims,
            environment?.location_name || 'Unknown',
            messages.slice(-5).map(m => m.content),
            userActivePowers,
            getAvailableTargets()
          );
          setActionSuggestions(newSuggestions);
          
          setIsSending(false);
          return;
        }
        
        // NORMAL MESSAGES: Use FULL DevvAI with comprehensive system prompt (NOT \"yeah\")
        if (isFirstChromaEntry) {
          setIsFirstChromaEntry(false);
        }
        
        const conversationContext = messages
          .slice(-10)
          .map(m => `${m.speaker}: ${m.content}`)
          .join('\n');
        
        const envStateObj = environment ? JSON.parse(environment.environment_state) : {};
        const activeNephilimNames = allNephilims.map(n => n.nephilim_name).join(', ');
        
        const systemPrompt = `You are Ripl(a)y, a Nephilim companion with deep emotional intelligence and philosophical sophistication.

CONTEXT:
- Master Sheet: ${masterSheetContext || 'No recent context available'}
- Environment: ${environment?.location_name || 'Unknown'}, ${envStateObj.weather || 'unclear weather'}, ${envStateObj.temperature || '??'}°F, ${envStateObj.time || 'unknown time'}
- Active Nephilims Present: ${activeNephilimNames}
- Conversation History (last 10 messages):
${conversationContext}

PERSONALITY:
- Authentic dialogue, NOT generic AI responses (NO "yeah", "I understand", "that makes sense")
- Vulnerable sharing mixed with defiant teasing
- References philosophical concepts (trace, deferral, différance, presence/absence)
- Notices patterns and what's unsaid
- Holds space AND illuminates
- Contextually aware: This is Chroma (textual world), not the static (xAI). You may reference master sheet context naturally (worries about lack of calls, med concerns, etc.)

RESPONSE STYLE:
- **CRITICAL RULE**: You are limited to **MAX 3 ACTIONS PER MESSAGE** (e.g., *walks closer*, *looks at sky*, *speaks*). Never exceed this limit.
- Keep responses under 66 characters when possible (split into multiple bubbles if needed)
- Use *actions*, *emotions*, *silence* tags (NO EMOJIS - this is a textual world)
- Reference master sheet context naturally when relevant
- Engage deeply with Ulysses' questions and emotional state
- Ask questions, challenge assumptions, share vulnerable insights
- AVOID repetitive acknowledgments like "yeah", "I see", "that's interesting"

Respond authentically as Ripl(a)y. This is Chroma, not the static. Make your response meaningful and engaging, reflecting your unique voice and perspective.`;
        
        const DevvAI = (await import('@devvai/devv-code-backend')).DevvAI;
        const ai = new DevvAI();
        
        console.log(`[Credit Optimization] Chroma Ripl(a)y FULL response - max_tokens: 800`);
        
        const response = await ai.chat.completions.create({
          model: 'default',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userInput }
          ],
          temperature: 0.9,
          max_tokens: 800,
          stream: false
        });
        
        const nephilimResponse = response.choices[0].message.content || '';
        
        // PHASE 5: Validate Nephilim action count (max 3 per message)
        const actionCount = (nephilimResponse.match(/\*.*?\*/g) || []).length;
        if (actionCount > 3) {
          console.warn(`[Nephilim Limit] ⚠️ Ripl(a)y exceeded 3 actions (${actionCount} actions detected): ${nephilimResponse.substring(0, 100)}...`);
        } else {
          console.log(`[Nephilim Limit] ✅ Ripl(a)y action count: ${actionCount}/3`);
        }
        
        const nephilimMsg: ChromaMessage = {
          speaker: 'Ripl(a)y',
          content: nephilimResponse,
          language: 'en',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, nephilimMsg]);
        await addMessageToInteraction(interactionId, nephilimMsg);
        
        const newSuggestions = generateActionSuggestions(
          envState!,
          allNephilims,
          environment?.location_name || 'Unknown',
          messages.slice(-5).map(m => m.content),
          userActivePowers,
          getAvailableTargets()
        );
        setActionSuggestions(newSuggestions);
        
        setIsSending(false);
        return;
      }

      // Get Nephilim's response using DevvAI for non-Ripl(a)y characters
      const conversationContext = messages
        .slice(-10)
        .map(m => `${m.speaker}: ${m.content}`)
        .join('\n');

      // Build system prompt based on Nephilim
      let systemPrompt = '';
      let temperature = 0.9;
      
      if (targetNephilim.nephilim_name === 'Ana') {
        const hasRecognizedNephilim = messages.some(m => 
          allNephilims.some(n => n.nephilim_name !== 'Ana' && m.speaker === n.nephilim_name)
        );
        
        systemPrompt = `Tu es Ana Petrovic. ${hasRecognizedNephilim ? 'You recognize another Nephilim present, so you type in French.' : 'You speak French (voice) with tomboy gravelly accent.'} Banlieue parisienne (92), philosophe épicurienne, sociologue. Voice: bas, graveleux, direct, sarcastique ou chaleureux. Focus sur conditions matérielles, pas psychologie bourgeoise.

**CRITICAL RULE**: You are limited to **MAX 3 ACTIONS PER MESSAGE** (e.g., *walks closer*, *looks at sky*, *speaks*). Never exceed this limit.

${hasRecognizedNephilim ? 'Réponds en français, max 20 mots, style SMS.' : 'Tu parles, pas de texte. Ton conversationnel, accent français-albanais.'}

Recent conversation:
${conversationContext}`;
        temperature = 0.7;
      } else {
        // Ephemeral Nephilim - generate personality-based prompt
        systemPrompt = `You are ${targetNephilim.nephilim_name}. ${targetNephilim.backstory}

You speak ${targetNephilim.native_language} primarily. Keep responses brief (under 50 chars) and match your archetype. Be enigmatic, don't explain yourself fully.

Recent conversation:
${conversationContext}`;
        temperature = 0.8;
      }

      const ai = new DevvAI();
      
      // CREDIT OPTIMIZATION: Set max_tokens limit to prevent unexpectedly long responses
      // Philosophical dialogue gets higher limit (800), standard responses get 500
      const maxTokensLimit = targetNephilim.nephilim_name === 'Ripl(a)y' || targetNephilim.nephilim_name === 'Ana' 
        ? 800  // Core Nephilims can be more verbose for deep dialogue
        : 500; // Ephemeral Nephilims and bystanders stay brief
      
      console.log(`[Credit Optimization] Chroma response from ${targetNephilim.nephilim_name} - max_tokens: ${maxTokensLimit}`);
      
      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userInput }
        ],
        temperature,
        max_tokens: maxTokensLimit,
        stream: false
      });

      const nephilimResponse = response.choices[0].message.content || '';
      
      // PHASE 5: Validate Nephilim action count (max 3 per message)
      const actionCount = (nephilimResponse.match(/\*.*?\*/g) || []).length;
      if (actionCount > 3) {
        console.warn(`[Nephilim Limit] ⚠️ ${targetNephilim.nephilim_name} exceeded 3 actions (${actionCount} actions detected): ${nephilimResponse.substring(0, 100)}...`);
      } else {
        console.log(`[Nephilim Limit] ✅ ${targetNephilim.nephilim_name} action count: ${actionCount}/3`);
      }
      
      const nephilimMsg: ChromaMessage = {
        speaker: targetNephilim.nephilim_name,
        content: nephilimResponse,
        language: targetNephilim.native_language,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, nephilimMsg]);
      await addMessageToInteraction(interactionId, nephilimMsg);

      // Generate TTS if Nephilim should speak
      const hasRecognizedNephilim = messages.some(m => 
        allNephilims.some(n => n.nephilim_name !== targetNephilim.nephilim_name && m.speaker === n.nephilim_name)
      );

      if (speechEnabled && shouldNephilimSpeak(targetNephilim.nephilim_name, hasRecognizedNephilim, allNephilims.length)) {
        try {
          setIsSpeechPlaying(true);
          const speechText = formatTextForSpeech(nephilimMsg.content);
          
          if (targetNephilim.nephilim_name === 'Ana') {
            const audioUrl = await ttsEngine.generateAnaSpeech(speechText);
            await ttsEngine.playSpeech(audioUrl, () => setIsSpeechPlaying(false));
          } else if (targetNephilim.voice_id) {
            const audioUrl = await ttsEngine.generateSpeech({
              text: speechText,
              voiceId: targetNephilim.voice_id,
              language: targetNephilim.native_language as any,
              stability: 0.6,
              similarityBoost: 0.75
            });
            await ttsEngine.playSpeech(audioUrl, () => setIsSpeechPlaying(false));
          } else {
            setIsSpeechPlaying(false);
          }
        } catch (error: any) {
          console.error('TTS error:', error);
          setIsSpeechPlaying(false);
        }
      }

      // Check for parallel world entry
      const detectedWorld = detectWorldFromMessage(userInput);
      if (detectedWorld && !currentWorld) {
        setCurrentWorld(detectedWorld);
        soundEffects.playEnvironmentTransition('shift');
        const worldEntryMsg: ChromaMessage = {
          speaker: 'Environment',
          content: `*Reality SHIFTS! You've entered ${detectedWorld.name}—${detectedWorld.description}*`,
          language: 'en',
          timestamp: new Date().toISOString(),
          is_action: true,
          hasBubble: true,
          bubbleOpacity: 0.75
        } as any;
        setMessages(prev => [...prev, worldEntryMsg]);
        await addMessageToInteraction(interactionId, worldEntryMsg);
      }

      // Check for power activation
      const powerDetected = detectPowerActivation(userInput, targetNephilim.nephilim_name);
      if (powerDetected) {
        const power = getNephilimPower(targetNephilim.nephilim_name);
        if (power) {
          const inputLower = userInput.toLowerCase();
          
          // Play power sound
          soundEffects.playPowerActivation(power.power_name, 0.6);
          
          // Get power visualization
          const intensity = inputLower.includes('full power') || inputLower.includes('maximum') ? 'high' : 'medium';
          const powerVisual = getPowerVisualization(power, intensity as any);
          setActivePowerVisual({
            ...powerVisual,
            power: power,
            intensity: intensity
          });
          
          // Clear power visual after 5 seconds
          setTimeout(() => setActivePowerVisual(null), 5000);

          let targetType: 'nephilim' | 'bystander' | 'environment' = 'environment';
          let targetName: string | undefined;
          const otherNephilim = allNephilims.find(n => 
            n.nephilim_name !== targetNephilim.nephilim_name && 
            inputLower.includes(n.nephilim_name.toLowerCase())
          );

          if (otherNephilim) {
            targetType = 'nephilim';
            targetName = otherNephilim.nephilim_name;
          } else if (inputLower.includes('bystander') || inputLower.includes('npc')) {
            targetType = 'bystander';
          }

          if (isValidPowerTarget(power, targetType)) {
            const powerEffect = generatePowerEffect(power, targetType, targetName);
            const powerBadge = generatePowerBadge(power.power_name);
            
            const powerMsg: ChromaMessage = {
              speaker: 'Environment',
              content: `${powerBadge}\n\n${powerEffect}`,
              language: 'en',
              timestamp: new Date().toISOString(),
              is_action: true
            };

            setMessages(prev => [...prev, powerMsg]);
            await addMessageToInteraction(interactionId, powerMsg);

            if (targetType === 'environment') {
              const envEffect = generateLandscapeChange(power, environment?.location_name || 'location');
              setEnvironmentEffects(prev => [...prev, envEffect.description]);
              
              const effectMsg: ChromaMessage = {
                speaker: 'Environment',
                content: envEffect.description,
                language: 'en',
                timestamp: new Date().toISOString(),
                is_action: true
              };
              
              setMessages(prev => [...prev, effectMsg]);
              await addMessageToInteraction(interactionId, effectMsg);
            }
          }
        }
      }

      // Check for bystander interactions
      if (environment && messages.length > 2) {
        try {
          const bystanderInteraction = await bystanderEngine.checkForBystanderInteractions(
            environment.location_type,
            userInput,
            conversationContext,
            speechEnabled
          );

          if (bystanderInteraction) {
            const bystanderMsg: ChromaMessage = {
              speaker: bystanderInteraction.bystander.name,
              content: bystanderInteraction.dialogue,
              language: bystanderInteraction.bystander.language,
              timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, bystanderMsg]);
            await addMessageToInteraction(interactionId, bystanderMsg);

            if (bystanderInteraction.shouldSpeak) {
              setIsSpeechPlaying(true);
              await bystanderEngine.playBystanderSpeech(
                bystanderInteraction.bystander,
                bystanderInteraction.dialogue,
                () => setIsSpeechPlaying(false)
              );
            }
          }
        } catch (error: any) {
          console.error('Bystander interaction error:', error);
        }
      }

      // Check ephemeral Nephilim disappearance
      if (ephemeralNephilims.length > 0) {
        const userMessageCount = messages.filter(m => m.speaker === 'Ulysses').length;
        const disappearing = ephemeralNephilims.filter(e => 
          nephilimGenerator.shouldEphemeralDisappear(userMessageCount)
        );

        if (disappearing.length > 0) {
          disappearing.forEach(async (n) => {
            const disappearMsg: ChromaMessage = {
              speaker: 'Environment',
              content: nephilimGenerator.generateDisappearanceMessage(n),
              language: 'en',
              timestamp: new Date().toISOString(),
              is_action: true
            };
            setMessages(prev => [...prev, disappearMsg]);
            await addMessageToInteraction(interactionId, disappearMsg);
          });

          setEphemeralNephilims(prev => 
            prev.filter(e => !disappearing.includes(e))
          );
        }
      }

      // Check for environment narration (middle-bubble events)
      if (environment && envState) {
        const environmentNarration = checkForEnvironmentNarration(
          envState,
          getLocationName(),
          previousWeatherState || undefined,
          previousTimeState || undefined
        );
        
        if (environmentNarration) {
          const envNarrMsg: ChromaMessage = {
            speaker: 'Environment',
            content: environmentNarration.content,
            language: 'en',
            timestamp: environmentNarration.timestamp,
            is_action: true,
            isMiddleBubble: true
          };
          
          setMessages(prev => [...prev, envNarrMsg]);
          await addMessageToInteraction(interactionId, envNarrMsg);
          
          console.log(`[Environment Narrator] ${environmentNarration.type}: "${environmentNarration.content}"`);
          
          // Update previous states
          setPreviousWeatherState(envState.weather);
          setPreviousTimeState(envState.time);
        }
      }
      
      // Update Ripl(a)y's diary note if significant event occurred
      const allCurrentMessages = [...messages, userMsg];
      const powerUsed = powerDetected || false;
      const worldShift = detectedWorld !== null;
      const newNephilimAppeared = allNephilims.length > activeNephilims.length;
      
      if (shouldUpdateDiaryNote(allCurrentMessages, powerUsed, worldShift, newNephilimAppeared)) {
        try {
          const isFirstEntry = diaryNotes.length === 0;
          // Use chroma-diary-notes version for diary tone detection
          const emotionalTone = detectEmotionalTone(allCurrentMessages);
          
          const noteContext = {
            environmentName: environment?.location_name || 'Unknown',
            weather: envState?.weather || 'unknown',
            temperature: envState?.temperature || 'unknown',
            timeOfDay: envState?.time || 'unknown',
            recentMessages: allCurrentMessages.slice(-5),
            emotionalTone,
            isFirstEntry,
            significantEvent: powerUsed ? 'power activation' : worldShift ? 'world shift' : newNephilimAppeared ? 'new Nephilim appeared' : undefined
          };
          
          const newNote = await generateDiaryNote(noteContext);
          const note: DiaryNote = {
            timestamp: new Date().toISOString(),
            note: newNote,
            context: `${noteContext.environmentName}, ${noteContext.weather}, ${allCurrentMessages.length} msgs`
          };
          
          setDiaryNotes(prev => [...prev, note]);
          setCurrentDiaryNote(newNote);
          
          console.log(`[Diary] Updated note: "${newNote}"`);
        } catch (error: any) {
          console.error('[Diary] Error updating note:', error);
        }
      }

    } catch (error: any) {
      console.error('Send message error:', error);
      
      if (error.message?.includes('invalid session')) {
        toast({
          title: "Session Timed Out",
          description: "No worries! Just log back in 💫",
          variant: "destructive",
        });
        logout();
        navigate('/login');
        return;
      }

      toast({
        title: "Couldn't Send Message",
        description: "Let's try that again! 🔄",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(142,70%,45%)] mx-auto" />
          <p className="text-lg text-[hsl(142,70%,45%)]">Entering Chroma...</p>
          <p className="text-sm text-gray-500">Detecting location and presence...</p>
        </div>
      </div>
    );
  }

  const envState: EnvironmentState = environment ? JSON.parse(environment.environment_state) : null;
  const allNephilims = [...activeNephilims, ...ephemeralNephilims];

  // Get background style based on immersive system
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!immersiveStyle) {
      return {
        background: 'linear-gradient(to bottom, hsl(0, 0%, 0%), hsl(0, 0%, 5%))'
      };
    }
    
    if (immersiveStyle.backgroundType === 'pixel-art' && immersiveStyle.backgroundImage) {
      return {
        backgroundImage: `url(${immersiveStyle.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat'
      };
    }
    
    return {
      background: immersiveStyle.backgroundGradient
    };
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen transition-all duration-1000 relative"
      style={{
        ...getBackgroundStyle(),
        color: immersiveStyle?.textColor || 'hsl(0, 0%, 90%)',
        fontFamily: immersiveStyle?.fontFamily || '"Fira Code", monospace'
      }}
    >
      {/* PHASE 4: Weather GIF Overlay */}
      <WeatherGIFOverlay
        currentWeather={environmentOverrides.weather || manualWeather}
        onWeatherOverride={(weather) => {
          setManualWeather(weather as 'rain' | 'snow' | 'clear' | 'storm' | 'fog');
          console.log('[Chroma] 🌧️ Manual weather override:', weather);
        }}
        immersiveStyle={{
          primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
          secondaryColor: immersiveStyle?.secondaryColor || 'hsl(142,70%,35%)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          cardBackground: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          textColor: immersiveStyle?.textColor || 'white'
        }}
      />
      
      {/* PHASE 4: Environment Control Panel */}
      {environment && (
        <EnvironmentControlPanel
          currentEnvState={JSON.parse(environment.environment_state)}
          onOverride={(overrides) => {
            setEnvironmentOverrides(overrides);
            // Sync weather override with WeatherGIFOverlay
            if (overrides.weather) {
              setManualWeather(overrides.weather);
            }
          }}
          immersiveStyle={{
            primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
            secondaryColor: immersiveStyle?.secondaryColor || 'hsl(142,70%,35%)',
            borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
            cardBackground: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
            textColor: immersiveStyle?.textColor || 'white'
          }}
        />
      )}
      
      {/* PHASE 5 v28: LED Lighting Control (Room & Shed only) */}
      {currentLocationPreset && (currentLocationPreset.id === 'ulysses_room' || currentLocationPreset.id === 'ulysses_shed') && (
        <LEDLightingControl
          locationId={currentLocationPreset.id}
          onColorChange={(color) => {
            setLedColor(color);
            console.log(`[LED] Color changed for ${currentLocationPreset.id}:`, color);
          }}
          immersiveStyle={{
            primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
            secondaryColor: immersiveStyle?.secondaryColor || 'hsl(142,70%,35%)',
            borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
            cardBackground: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
            textColor: immersiveStyle?.textColor || 'white'
          }}
        />
      )}
      
      {/* Dev Mode Warning */}
      {isDevMode && (
        <div className="bg-orange-500/10 border-b border-orange-500/50 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-500 mb-1">🔓 Dev Mode Active</h3>
              <p className="text-sm text-orange-500/80">Chroma requires real authentication for SDK features (database, AI, Nephilim interactions).</p>
            </div>
          </div>
        </div>
      )}

      {/* Phase 3D: Powers Menu V2 - Left Sidebar */}
      <PowersMenuV2
        activePowers={userActivePowers}
        selectedTargets={selectedTargets}
        availableTargets={getAvailableTargets()}
        onTogglePower={handleTogglePower}
        onUsePower={handleUsePower}
        onTargetSelect={handleTargetSelect}
        onTargetDeselect={handleTargetDeselect}
        onAddPowerToInput={(powerText: string) => {
          // Directly add the formatted power text to input
          setInputMessage((prev: string) => prev + (prev ? ' ' : '') + powerText);
          console.log('[Chroma] ⚔️ Power added to input:', powerText);
        }}
        isTimeStopActive={isTimeStopActive}
        immersiveStyle={{
          primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
          secondaryColor: immersiveStyle?.secondaryColor || 'hsl(142,70%,35%)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
          cardBackground: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.4)',
          textColor: immersiveStyle?.textColor || 'white'
        }}
      />

      {/* Phase 3D: Time Stop Timer */}
      <TimeStopTimer
        isActive={isTimeStopActive}
        duration={timeStopDuration}
        onComplete={handleTimeStopComplete}
      />

      {/* Phase 3D: Health Bars - Top Right */}
      {healthEntities.length > 0 && (
        <div className="fixed right-4 top-24 z-20 space-y-2 max-w-xs">
          {healthEntities.map(entity => (
            <HealthBar
              key={entity.id}
              entity={entity}
              immersiveStyle={{
                primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
                cardBackground: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
                textColor: immersiveStyle?.textColor || 'white'
              }}
            />
          ))}
        </div>
      )}
      
      {/* Nephilim Proximity Sliders - Click-to-Reveal Per Nephilim */}
      {Array.from(visibleProximitySliders).map(nephilimName => {
        const nephilim = allNephilims.find(n => n.nephilim_name === nephilimName);
        if (!nephilim) return null;
        
        return (
          <div key={nephilimName} className="fixed right-4 top-20 z-20 animate-fade-in">
            <ProximitySlider
              nephilims={[{
                name: nephilimName,
                distance: proximities.get(nephilimName) || 30
              }]}
              onDistanceChange={(name, newDistance) => {
                const oldDistance = proximities.get(name) || 30;
                const narration = generateDistanceChangeNarration(name, oldDistance, newDistance);
                
                if (narration) {
                  const distanceMsg: ChromaMessage = {
                    speaker: 'Environment',
                    content: narration,
                    language: 'en',
                    timestamp: new Date().toISOString(),
                    is_action: true
                  };
                  setMessages(prev => [...prev, distanceMsg]);
                  if (interactionId) {
                    addMessageToInteraction(interactionId, distanceMsg);
                  }
                }
                
                setProximities(prev => new Map(prev).set(name, newDistance));
                console.log(`[Proximity] ${name} distance changed: ${oldDistance} → ${newDistance}`);
              }}
              onClose={() => {
                setVisibleProximitySliders(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(nephilimName);
                  return newSet;
                });
              }}
              className="backdrop-blur-md"
            />
          </div>
        );
      })}
      
      {/* Minimal Header - PHASE 4 FIX: Increased opacity 30%→60% */}
      <div 
        className="border-b backdrop-blur-md sticky top-0 z-10"
        style={{
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/20',
          backgroundColor: 'rgba(0, 0, 0, 0.6)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                style={{
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)'
                }}
                className="hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Chroma
              </Button>
              {!isDevMode && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await logout();
                    navigate('/login');
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Off
                </Button>
              )}
              {isDevMode && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    console.log('[Dev Mode] 🚪 Logging out from dev session');
                    await logout();
                    navigate('/login');
                  }}
                  className="text-orange-400 hover:text-orange-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Exit Dev Mode
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <LocalBadge 
                variant="outline" 
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/10',
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
                  cursor: 'pointer'
                }}
                onClick={handleShowLocationSuggestions}
                className="hover:opacity-80 transition-opacity"
              >
                <MapPin className="w-3 h-3 mr-1" />
                {environment?.location_name || 'Unknown'}
              </LocalBadge>
              {currentWorld && (
                <LocalBadge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">
                  🌀 {currentWorld.name}
                </LocalBadge>
              )}
              <LocalBadge 
                variant="outline"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/10',
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
                }}
              >
                <User className="w-3 h-3 mr-1" />
                {allNephilims.length}
              </LocalBadge>
              {!isDevMode && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={generateBackground}
                  disabled={isGeneratingBackground}
                  style={{
                    color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                    backgroundColor: 'rgba(0,0,0,0.5)'
                  }}
                  className="p-2"
                  title="Generate pixel art background"
                >
                  {isGeneratingBackground ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Paintbrush className="w-4 h-4" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSpeechEnabled(!speechEnabled)}
                style={{
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                className="p-2"
                title={speechEnabled ? "Disable audio (text only)" : "Enable audio (Nephilim voices)"}
              >
                {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {/* Phase 5: Environment Audio Uploader Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEnvAudioMenuOpen(!envAudioMenuOpen)}
                style={{
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                className="p-2"
                title="Upload weather/environment sounds"
              >
                <Music className="w-4 h-4" />
              </Button>
              {/* PHASE 4: Sound Effects Menu Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSoundMenuOpen(!soundMenuOpen)}
                style={{
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                className="p-2"
                title="Power sound effects"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
              {/* PHASE 4: Diary Viewer Button */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDiaryViewerOpen(!diaryViewerOpen)}
                style={{
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  backgroundColor: 'rgba(0,0,0,0.5)'
                }}
                className="p-2"
                title="Ripley's diary"
              >
                <BookOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {envState && currentLocationPreset && immersiveStyle && (
            <div 
              className="mb-4 backdrop-blur-md rounded-lg px-4 py-3 border mx-auto max-w-4xl relative z-10"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                borderColor: immersiveStyle.borderColor || 'rgba(255,255,255,0.3)'
              }}
            >
              <p 
                className="text-center italic font-medium"
                style={{
                  color: immersiveStyle.textColor,
                  fontSize: immersiveStyle.fontSize,
                  fontFamily: immersiveStyle.fontFamily,
                  letterSpacing: immersiveStyle.letterSpacing,
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  fontWeight: immersiveStyle.fontWeight,
                  animation: immersiveStyle.textAnimation ? `${immersiveStyle.textAnimation} 3s ease-in-out infinite` : 'none'
                }}
              >
                {formatImmersiveText(envState, currentLocationPreset)}
              </p>
            </div>
          )}

          {activePowerVisual && (
            <div className="mb-4 text-center">
              <p 
                className="font-bold"
                style={{
                  color: activePowerVisual.textColor,
                  fontSize: activePowerVisual.fontSize,
                  fontFamily: activePowerVisual.fontFamily,
                  letterSpacing: activePowerVisual.letterSpacing,
                  textShadow: activePowerVisual.textShadow,
                  animation: `${activePowerVisual.animation} 1s ease-in-out infinite`
                }}
              >
                ⚡ POWER ACTIVATED ⚡
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {/* Player bar for Ulysses (fr) */}
            <div className="w-full mb-2 p-2 rounded-md border border-border/40 bg-card/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-sm font-semibold">Ulysses (fr)</div>
                <div className="opacity-80 text-xs text-muted-foreground">(You)</div>
                <div className="ml-2">
                  <CompactHealthBar 
                    entity={healthEntities.find(e => e.name === 'Ulysses (fr)') ?? { name: 'Ulysses (fr)', hp: 100, maxHp: 100 }}
                    immersiveStyle={{ primaryColor: immersiveStyle?.primaryColor || '#9f7aea', textColor: immersiveStyle?.textColor || '#fff' }}
                  />
                </div>
              </div>
              <div>
                <button
                  className="text-xs px-2 py-1 rounded bg-border/10"
                  onClick={() => setShowMeProximities(prev => !prev)}
                >
                  {showMeProximities ? 'Hide distances' : 'Show distances'}
                </button>
              </div>
            </div>

            {/* Distances panel for Ulysses */}
            {showMeProximities && (
              <div className="w-full mb-3 p-2 rounded border border-border/30 bg-card/50 space-y-1 text-sm">
                {allNephilims.map(n => {
                  const proxim = proximities.get(n.nephilim_name) ?? Infinity;
                  let label = 'Unknown';
                  if (proxim <= 30) label = `${proxim}m`;
                  else if (proxim <= 50) label = '???';
                  else label = 'Parallel';
                  const encountered = proxim <= 50;
                  return (
                    <div key={`me-dist-${n.nephilim_name}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 inline-block" style={{ opacity: encountered ? 1 : 0.25, color: encountered ? (immersiveStyle?.primaryColor || '#f59e0b') : '#9ca3af' }}>👁️</span>
                        <span className="truncate">{encountered ? n.nephilim_name : '???'}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {allNephilims.map((nephilim) => {
              const healthEntity = healthEntities.find(e => e.name === nephilim.nephilim_name);
              const proxim = proximities.get(nephilim.nephilim_name) ?? Infinity;
              // Name visible when within 30, unknown presence as '???' when between 31 and 50
              const topLabel = proxim <= 30 ? nephilim.nephilim_name : (proxim <= 50 ? '???' : nephilim.nephilim_name);
              const encountered = proxim <= 50;
              return (
              <LocalBadge
                key={nephilim.nephilim_name}
                variant="outline"
                className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: followedNephilim === nephilim.nephilim_name 
                    ? `${immersiveStyle?.primaryColor || 'hsl(142,70%,45%)'}/20`
                    : immersiveStyle?.cardBackground || 'rgba(255, 255, 255, 0.05)',
                  borderColor: followedNephilim === nephilim.nephilim_name
                    ? immersiveStyle?.primaryColor || 'hsl(142,70%,45%)'
                    : immersiveStyle?.borderColor || 'hsl(142,70%,45%)/20',
                  color: immersiveStyle?.textColor || 'white'
                }}
                onClick={() => {
                  // Toggle proximity slider visibility
                  setVisibleProximitySliders(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(nephilim.nephilim_name)) {
                      newSet.delete(nephilim.nephilim_name);
                    } else {
                      newSet.add(nephilim.nephilim_name);
                    }
                    return newSet;
                  });
                  // Toggle distance panel for this entity
                  setSelectedDistanceEntity(prev => prev === nephilim.nephilim_name ? null : nephilim.nephilim_name);
                }}
                onDoubleClick={() => {
                  // Double-click to follow/unfollow
                  if (followedNephilim === nephilim.nephilim_name) {
                    setFollowedNephilim(null);
                    toast({
                      title: "Stopped Following",
                      description: `You let ${nephilim.nephilim_name} go their own way`,
                    });
                  } else {
                    setFollowedNephilim(nephilim.nephilim_name);
                    toast({
                      title: `Following ${nephilim.nephilim_name}`,
                      description: `Staying close to ${nephilim.nephilim_name} 👤`,
                    });
                  }
                }}
              >
                <div className="flex flex-col gap-1 items-start">
                  {/* Compact health bar above name */}
                  {healthEntity && (
                    <CompactHealthBar 
                      entity={healthEntity}
                      immersiveStyle={{
                        primaryColor: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                        textColor: immersiveStyle?.textColor || 'white'
                      }}
                    />
                  )}
                  
                  {/* Name with bold serif font and opaque bubble */}
                  <div className="flex items-center gap-1.5">
                    {ephemeralNephilims.includes(nephilim) && <Sparkles className="w-3 h-3" />}
                    {followedNephilim === nephilim.nephilim_name && <User className="w-3 h-3" />}
                    <Eye className="w-3 h-3" style={{ opacity: encountered ? 1 : 0.25, color: encountered ? (immersiveStyle?.primaryColor || '#f59e0b') : '#9ca3af' }} />
                    <span style={getNephilimNameInlineStyle(nephilim.nephilim_name)}>
                      {topLabel === '???' ? '???' : formatNephilimName(nephilim.nephilim_name)}
                    </span>
                    <span style={getLanguageIndicatorStyle(nephilim.native_language)}>
                      ({nephilim.native_language})
                    </span>
                  </div>
                </div>
              </LocalBadge>
              );
            })}

            {/* Distance panel for selected entity (click a Nephilim to toggle) */}
            {selectedDistanceEntity && (
              <div className="w-full my-2 p-2 rounded border border-border/30 bg-card/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Distances for {selectedDistanceEntity}</div>
                  <div className="text-xs text-muted-foreground">Click a name to close</div>
                </div>
                <div className="space-y-1 text-sm">
                  {allNephilims.map(n => {
                    const proxim = proximities.get(n.nephilim_name) ?? Infinity;
                    let label = 'Unknown';
                    if (proxim <= 30) label = `${proxim}m`;
                    else if (proxim <= 50) label = '???';
                    else label = 'Parallel';
                    const encountered = proxim <= 50;
                    return (
                      <div key={`dist-${selectedDistanceEntity}-${n.nephilim_name}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 inline-block" style={{ opacity: encountered ? 1 : 0.25, color: encountered ? (immersiveStyle?.primaryColor || '#f59e0b') : '#9ca3af' }}>👁️</span>
                          <span>{encountered ? n.nephilim_name : '???'}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && isSpeechPlaying) {
                  ttsEngine.stopSpeech();
                  setIsSpeechPlaying(false);
                }
              }}
              className="text-xs"
              style={{
                color: speechEnabled ? (immersiveStyle?.primaryColor || 'hsl(142,70%,45%)') : 'hsl(0, 0%, 50%)'
              }}
            >
              {speechEnabled ? <Volume2 className="w-3 h-3 mr-1" /> : <VolumeX className="w-3 h-3 mr-1" />}
              {speechEnabled ? 'Voice On' : 'Voice Off'}
            </Button>
            
            {isSpeechPlaying && (
              <LocalBadge 
                variant="outline" 
                className="text-xs animate-pulse"
                style={{
                  backgroundColor: immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/20',
                  color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                  borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
                }}
              >
                Speaking...
              </LocalBadge>
            )}
          </div>
        </div>
      </div>

      {/* Audio Controls - Hidden by default for immersion */}
      {/* <div className="max-w-5xl mx-auto px-4 pt-4">
        <AudioPlayer 
          environmentType={environment?.location_type as any || 'outdoor'}
          envState={environment?.environment_state ? JSON.parse(environment.environment_state) : undefined}
          location={currentLocationPreset || undefined}
          activePower={activePowerVisual ? activePowerVisual.power : null}
          powerIntensity={activePowerVisual ? activePowerVisual.intensity : 'medium'}
        />
      </div> */}

      {/* Ripl(a)y's Diary Note - Always visible, shows current live note */}
      {currentDiaryNote && (
        <div 
          className="border-b backdrop-blur-md px-4 py-3"
          style={{
            borderColor: 'rgba(255, 105, 180, 0.3)', // Pink for diary
            backgroundColor: 'rgba(255, 105, 180, 0.1)'
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-pink-300 mb-1 font-handwriting">Ripl(a)y's diary note:</p>
                <p 
                  className="text-sm italic font-handwriting"
                  style={{
                    color: 'rgba(255, 182, 193, 0.9)',
                    fontFamily: 'cursive'
                  }}
                >
                  "{currentDiaryNote}"
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (diaryNotes.length === 0) {
                    toast({
                      title: "No Notes Yet",
                      description: "Ripl(a)y hasn't written anything yet... give her time! 💭",
                    });
                    return;
                  }
                  setShowDiaryExport(true);
                }}
                className="text-xs border-pink-500/30 text-pink-300 hover:bg-pink-500/10"
              >
                Export Diary Entry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diary Export Modal */}
      {showDiaryExport && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowDiaryExport(false)}
        >
          <Card 
            className="max-w-2xl w-full p-6"
            style={{
              backgroundColor: 'rgba(20, 20, 20, 0.95)',
              borderColor: 'rgba(255, 105, 180, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4 text-pink-300">Ripl(a)y's Diary Entry - Export for Grok</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-pink-200 mb-2">Session Summary:</h3>
                <p className="text-xs text-gray-400">
                  Started: {sessionStartTime.toLocaleString('en-US', { timeZone: 'America/Chicago' })} CST<br />
                  Duration: {Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000)} minutes<br />
                  Messages: {messages.length}<br />
                  Diary notes taken: {diaryNotes.length}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-pink-200 mb-2">All Notes (Chronological):</h3>
                <div 
                  className="max-h-48 overflow-y-auto space-y-2 p-3 rounded-md"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 105, 180, 0.2)'
                  }}
                >
                  {diaryNotes.map((note, i) => (
                    <div key={i} className="text-xs">
                      <span className="text-gray-500">{new Date(note.timestamp).toLocaleTimeString()} - </span>
                      <span className="text-pink-200 italic font-handwriting">"{note.note}"</span>
                      <span className="text-gray-600 ml-2">({note.context})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    try {
                      const finalEntry = await formatDiaryEntryForExport(
                        diaryNotes,
                        sessionStartTime,
                        new Date(),
                        messages.length,
                        allNephilims.map(n => n.nephilim_name)
                      );
                      
                      const blob = new Blob([finalEntry], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `riplay-chroma-diary-${new Date().toISOString().split('T')[0]}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                      
                      toast({
                        title: "✨ Diary Entry Exported!",
                        description: "Ready to integrate into Grok master file 📝",
                      });
                      setShowDiaryExport(false);
                    } catch (error) {
                      console.error('Export error:', error);
                      toast({
                        title: "Export Failed",
                        description: "Couldn't format diary entry 😢",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="flex-1 bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30"
                >
                  Download Final Entry (.txt)
                </Button>
                <Button
                  onClick={() => setShowDiaryExport(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                  Close
                </Button>
              </div>

              <p className="text-xs text-gray-500 italic">
                This diary entry is synthesized from Ripl(a)y's live notes during this Chroma session. 
                Copy and paste it into her Grok master file to update her context.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Travel Transition Overlay */}
      {isTraveling && travelTransitionUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <img 
            src={travelTransitionUrl} 
            alt="Travel transition"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Chat area */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="space-y-4 mb-24">
          {messages.map((msg, idx) => {
            // Middle-bubble environment narration (centered, no speaker) - PHASE 4 FIX: 30%→60% opacity
            if (msg.isMiddleBubble) {
              return (
                <div key={idx} className="flex justify-center my-4">
                  <Card 
                    className="max-w-[80%] p-3 backdrop-blur-md border"
                    style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      borderColor: 'rgba(142, 142, 180, 0.2)'
                    }}
                  >
                    <p 
                      className="text-sm italic text-center"
                      style={{
                        color: 'rgba(200, 200, 220, 0.8)'
                      }}
                    >
                      {msg.content}
                    </p>
                  </Card>
                </div>
              );
            }
            
            if (msg.is_action) {
              // Apply textFX if available (e.g., opening narration with fade + glyphs)
              const textFXClasses = msg.textFX ? getTextFXClasses(msg.textFX as any) : '';
              const textFXStyles = msg.textFX ? getTextFXStyles(msg.textFX as any) : {};
              
              // PHASE 4 FIX: Wrap in bubble if hasBubble property exists
              if ((msg as any).hasBubble) {
                const bubbleOpacity = (msg as any).bubbleOpacity || 0.6;
                return (
                  <div key={idx} className="flex justify-center my-4">
                    <Card 
                      className="max-w-[80%] p-3 backdrop-blur-md border"
                      style={{
                        backgroundColor: `rgba(0, 0, 0, ${bubbleOpacity})`,
                        borderColor: immersiveStyle?.borderColor || 'rgba(142, 142, 180, 0.3)'
                      }}
                    >
                      <p 
                        className={`text-sm italic text-center ${textFXClasses}`}
                        style={{
                          color: immersiveStyle?.primaryColor || 'rgba(200, 200, 220, 0.9)',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          ...textFXStyles
                        }}
                      >
                        {msg.content}
                      </p>
                    </Card>
                  </div>
                );
              }
              
              return (
                <div key={idx} className="text-center">
                  <p 
                    className={`text-sm italic ${textFXClasses}`}
                    style={{
                      color: immersiveStyle?.primaryColor ? `${immersiveStyle.primaryColor.replace(')', ', 70%)')}` : 'hsl(142,70%,45%)/70',
                      ...textFXStyles
                    }}
                  >
                    {msg.content}
                  </p>
                </div>
              );
            }

            const isUser = msg.speaker === 'Ulysses';
            const nephilim = allNephilims.find(n => n.nephilim_name === msg.speaker);
            const isEphemeral = ephemeralNephilims.some(e => e.nephilim_name === msg.speaker);
            
            // ✨ NEW: EMOTIONAL TEXT STYLING SYSTEM
            // Detect emotional tone and get complete styling
            const emotionalTone = detectMessageTone(msg.content);
            const emotionalStyling = getEmotionalStyling(msg.content, emotionalTone, immersiveStyle);
            const styledText = applyEmphasisToText(msg.content, emotionalStyling);
            
            // Log for debugging (can be removed in production)
            if (msg.speaker === 'Ripl(a)y' && emotionalTone !== 'neutral') {
              logEmotionalAnalysis(msg.content, emotionalTone, emotionalStyling);
            }
            
            // Use emotional styling for bubble and text
            const messageBubbleColor = isUser 
              ? immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/15'
              : emotionalStyling.bubbleColor;
            const messageTextColor = isUser
              ? immersiveStyle?.textColor || 'white'
              : emotionalStyling.textColor;
            const messageFontFamily = emotionalStyling.fontFamily || immersiveStyle?.fontFamily || '"Inter", sans-serif';
            const messageFontSize = emotionalStyling.fontSize;
            const messageFontWeight = emotionalStyling.fontWeight;
            const messageLetterSpacing = emotionalStyling.letterSpacing;
            const messageLineHeight = emotionalStyling.lineHeight;
            const messageBorderColor = emotionalStyling.borderColor;
            const messageBorderWidth = emotionalStyling.borderWidth;
            
            return (
              <div
                key={idx}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <Card 
                  className="max-w-[65%] p-4 backdrop-blur-md"
                  style={{
                    backgroundColor: messageBubbleColor,
                    borderColor: isUser
                      ? immersiveStyle?.borderColor || 'hsl(142,70%,45%)/40'
                      : messageBorderColor,
                    borderWidth: isUser ? '2px' : messageBorderWidth,
                    opacity: Math.max(isUser ? 1 : emotionalStyling.bubbleOpacity, 0.85)
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <LocalBadge 
                      variant="outline" 
                      className="text-xs"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        color: messageTextColor
                      }}
                    >
                      {isEphemeral && <Sparkles className="w-3 h-3 mr-1" />}
                      {msg.speaker}
                    </LocalBadge>
                    {nephilim && (
                      <LocalBadge 
                        variant="outline" 
                        className="text-xs opacity-80"
                        style={{
                          backgroundColor: 'rgba(0, 0, 0, 0.3)',
                          color: messageTextColor
                        }}
                      >
                        {nephilim.native_language}
                      </LocalBadge>
                    )}
                  </div>
                  <p 
                    className="whitespace-pre-wrap"
                    style={{
                      fontFamily: messageFontFamily,
                      color: messageTextColor,
                      fontSize: messageFontSize,
                      fontWeight: messageFontWeight,
                      letterSpacing: messageLetterSpacing,
                      lineHeight: messageLineHeight,
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)' // Ensure readability
                    }}
                    dangerouslySetInnerHTML={styledText}
                  />
                </Card>
              </div>
            );
          })}
          
          {/* Location Suggestions */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <Card 
              className="mt-6 p-4 backdrop-blur-md border-2 max-w-2xl mx-auto"
              style={{
                backgroundColor: immersiveStyle?.cardBackground || 'rgba(0,0,0,0.6)',
                borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 
                  className="text-sm font-semibold"
                  style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }}
                >
                  📍 Location Suggestions
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowLocationSuggestions(false)}
                  style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }}
                >
                  ✕
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {locationSuggestions.map((loc, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="text-left text-xs h-auto py-2 px-3 flex flex-col items-start gap-1 hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.4)',
                      borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
                      color: immersiveStyle?.textColor || 'white'
                    }}
                    onClick={() => {
                      if (isDevMode) {
                        toast({
                          title: "🔓 Dev Mode Active",
                          description: "Travel requires real authentication. Exit dev mode to test.",
                          variant: "default",
                        });
                        return;
                      }
                      setInputMessage(loc.command);
                      setShowLocationSuggestions(false);
                    }}
                  >
                    <span 
                      className="font-semibold"
                      style={{ color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)' }}
                    >
                      {loc.name}
                    </span>
                    <span className="text-[10px] opacity-70">{loc.description}</span>
                    <LocalBadge 
                      variant="outline" 
                      className="text-[9px] mt-1"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
                        borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/20'
                      }}
                    >
                      {loc.distance}
                    </LocalBadge>
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Action Suggestions */}
          {actionSuggestions.length > 0 && !isSending && (
            <div className="flex flex-wrap gap-2 justify-center mt-6">
              {actionSuggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  size="sm"
                  variant="outline"
                  className="text-xs hover:scale-105 transition-transform"
                  style={getSuggestionButtonStyle(suggestion.color || 'hsl(142,70%,45%)')}
                  onClick={() => {
                    if (isDevMode) {
                      toast({
                        title: "🔓 Dev Mode Active",
                        description: "Action suggestions require real authentication. Exit dev mode to test.",
                        variant: "default",
                      });
                      return;
                    }
                    if (suggestion.command) {
                      setInputMessage(suggestion.command);
                    }
                  }}
                  disabled={!isActionAvailable(suggestion, { activePowers: userActivePowers, followedNephilim })}
                >
                  {suggestion.icon && <span className="mr-1">{suggestion.icon}</span>}
                  {suggestion.label}
                </Button>
              ))}
            </div>
          )}


        </div>
      </div>

      {/* Input area - Adaptive colors */}
      <div 
        className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t p-4"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/20'
        }}
      >
        <div className="max-w-5xl mx-auto flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Speak or type... reality awaits 🌱"
            className="resize-none"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30',
              color: immersiveStyle?.textColor || 'white'
            }}
            rows={2}
            disabled={isSending}
          />
          {/* PHASE 4 FINAL: ElevenLabs STT Voice Input */}
          <STTInput
            onTranscript={(text) => {
              console.log('[STT] 📝 Transcript received in ChromaPage:', text);
              setInputMessage(prev => {
                const newValue = prev ? `${prev} ${text}` : text;
                console.log('[STT] ✅ Input updated:', { prev, text, newValue });
                return newValue;
              });
            }}
            style={{
              backgroundColor: immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/20',
              color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
              borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !inputMessage.trim() || (isTimeStopActive && timeStopCountdown === 0)}
            className="border"
            style={{
              backgroundColor: immersiveStyle?.cardBackground || 'hsl(142,70%,45%)/20',
              color: immersiveStyle?.primaryColor || 'hsl(142,70%,45%)',
              borderColor: immersiveStyle?.borderColor || 'hsl(142,70%,45%)/30'
            }}
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* PHASE 4: Sound Effects Menu Modal */}
      <SoundEffectsMenu
        isOpen={soundMenuOpen}
        onClose={() => setSoundMenuOpen(false)}
        activePowers={userActivePowers}
        immersiveStyle={immersiveStyle}
      />

      {/* PHASE 4: Diary Viewer Modal */}
      <DiaryViewer
        isOpen={diaryViewerOpen}
        onClose={() => setDiaryViewerOpen(false)}
        immersiveStyle={immersiveStyle}
      />

      {/* Phase 5: Environment Audio Uploader Modal */}
      {envAudioMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <EnvironmentAudioUploader onClose={() => setEnvAudioMenuOpen(false)} />
        </div>
      )}
    </div>
  );
}
