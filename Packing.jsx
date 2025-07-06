import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  ChevronRight,
  ArrowRight,
  Timer,
  BarChart3,
  Award,
  Sparkles,
  Trophy,
  Star,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Play,
  Pause,
  RotateCcw,
  Info,
  MapPin,
  Cpu,
  Activity,
  Layers,
  ScanLine,
  Barcode,
  Box,
  PackageCheck,
  User,
  Calendar,
  CalendarDays,
} from "lucide-react";

// Helper functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-NZ");
  }
};

// Global audio context management
let globalAudioContext = null;
let audioInitialized = false;

const initializeAudio = async () => {
  if (audioInitialized || globalAudioContext) return true;

  try {
    // Don't create context until user gesture
    globalAudioContext = new (window.AudioContext ||
      window.webkitAudioContext)();

    // Resume if suspended
    if (globalAudioContext.state === "suspended") {
      await globalAudioContext.resume();
    }

    audioInitialized = true;
    console.log("Audio initialized successfully");
    return true;
  } catch (error) {
    console.log("Audio initialization failed:", error);
    return false;
  }
};

// Modern Candy Crush-like Sound Effects with error handling
const playSound = async (type) => {
  // Try to initialize audio if it hasn't been initialized yet
  if (!audioInitialized || !globalAudioContext) {
    const initialized = await initializeAudio();
    if (!initialized) return;
  }

  // Ensure audio context is resumed
  if (globalAudioContext && globalAudioContext.state === "suspended") {
    try {
      await globalAudioContext.resume();
    } catch (error) {
      console.log("Failed to resume audio context:", error);
      return;
    }
  }

  try {
    // Check if context is in a good state
    if (!globalAudioContext || globalAudioContext.state === "closed") {
      audioInitialized = false;
      globalAudioContext = null;
      return;
    }

    switch (type) {
      case "success":
        createSparklyChime(globalAudioContext);
        break;
      case "error":
        createWobbleError(globalAudioContext);
        break;
      case "combo":
        createComboMagic(globalAudioContext);
        break;
      case "complete":
        createVictoryFanfare(globalAudioContext);
        break;
      case "click":
        createBubblePop(globalAudioContext);
        break;
      case "hover":
        createShimmer(globalAudioContext);
        break;
      case "tick":
        createCrystalTick(globalAudioContext);
        break;
      case "confetti":
        createConfettiSound(globalAudioContext);
        break;
      case "print":
        createPrintSound(globalAudioContext);
        break;
      default:
        createBubblePop(globalAudioContext);
    }
  } catch (error) {
    console.log("Sound playback error:", error);
  }
};

// Soft crystalline tick
const createCrystalTick = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = "triangle";
    filter.type = "highpass";
    filter.frequency.setValueAtTime(800, audioContext.currentTime);

    osc.frequency.setValueAtTime(1500, audioContext.currentTime);
    gain.gain.setValueAtTime(0.06, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.08,
    );

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    // Silently fail
  }
};

// Sparkly rising chime for success
const createSparklyChime = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = "sine";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);
      filter.Q.setValueAtTime(1, audioContext.currentTime);

      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(
        0.15,
        audioContext.currentTime + i * 0.08 + 0.02,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + i * 0.08 + 0.6,
      );

      osc.start(audioContext.currentTime + i * 0.08);
      osc.stop(audioContext.currentTime + i * 0.08 + 0.6);
    });
  } catch (error) {
    // Silently fail
  }
};

// Gentle wobble for errors
const createWobbleError = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const wobble = audioContext.createOscillator();
    const wobbleGain = audioContext.createGain();

    wobble.connect(wobbleGain);
    wobbleGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = "sine";
    wobble.type = "sine";

    osc.frequency.setValueAtTime(220, audioContext.currentTime);
    wobble.frequency.setValueAtTime(6, audioContext.currentTime);
    wobbleGain.gain.setValueAtTime(15, audioContext.currentTime);

    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.4,
    );

    wobble.start(audioContext.currentTime);
    osc.start(audioContext.currentTime);
    wobble.stop(audioContext.currentTime + 0.4);
    osc.stop(audioContext.currentTime + 0.4);
  } catch (error) {
    // Silently fail
  }
};

// Magical cascade for combos
const createComboMagic = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const frequencies = [523.25, 659.25, 783.99, 987.77, 1174.66, 1396.91];

    frequencies.forEach((freq, i) => {
      setTimeout(() => {
        if (audioContext.state !== "running") return;

        try {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          const filter = audioContext.createBiquadFilter();

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(audioContext.destination);

          osc.type = "triangle";
          filter.type = "bandpass";
          filter.frequency.setValueAtTime(freq * 2, audioContext.currentTime);
          filter.Q.setValueAtTime(3, audioContext.currentTime);

          osc.frequency.setValueAtTime(freq, audioContext.currentTime);
          gain.gain.setValueAtTime(0.12, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.3,
          );

          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.3);
        } catch (error) {
          // Silently fail
        }
      }, i * 60);
    });
  } catch (error) {
    // Silently fail
  }
};

// Victory fanfare with sparkles
const createVictoryFanfare = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    // Main fanfare melody
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    melody.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + i * 0.12 + 0.4,
      );

      osc.start(audioContext.currentTime + i * 0.12);
      osc.stop(audioContext.currentTime + i * 0.12 + 0.4);
    });

    // Sparkle layer
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        if (audioContext.state !== "running") return;

        try {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();

          osc.connect(gain);
          gain.connect(audioContext.destination);

          osc.type = "sine";
          osc.frequency.setValueAtTime(
            1500 + Math.random() * 1000,
            audioContext.currentTime,
          );
          gain.gain.setValueAtTime(0.08, audioContext.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            audioContext.currentTime + 0.2,
          );

          osc.start(audioContext.currentTime);
          osc.stop(audioContext.currentTime + 0.2);
        } catch (error) {
          // Silently fail
        }
      }, i * 80);
    }
  } catch (error) {
    // Silently fail
  }
};

// Satisfying bubble pop
const createBubblePop = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = "sine";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(
      300,
      audioContext.currentTime + 0.1,
    );

    osc.frequency.setValueAtTime(800, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      200,
      audioContext.currentTime + 0.1,
    );

    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.1,
    );

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Silently fail
  }
};

// Ultra-simple hover sound with minimal processing
const createShimmer = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      1800,
      audioContext.currentTime + 0.08,
    );

    gain.gain.setValueAtTime(0.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.08,
    );

    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.08);
  } catch (error) {
    // Silently fail
  }
};

// Enhanced Candy Crush-style confetti celebration
const createConfettiSound = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    // Main celebration fanfare
    const celebrationNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5 to G6
    celebrationNotes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      osc.type = "triangle";
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(
        freq * 1.5,
        audioContext.currentTime + i * 0.08,
      );
      filter.Q.setValueAtTime(2, audioContext.currentTime);

      osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + i * 0.08 + 0.6,
      );

      osc.start(audioContext.currentTime + i * 0.08);
      osc.stop(audioContext.currentTime + i * 0.08 + 0.6);
    });

    // Magical sparkle bursts - 3 waves of sparkles
    for (let wave = 0; wave < 3; wave++) {
      for (let i = 0; i < 8; i++) {
        setTimeout(
          () => {
            if (audioContext.state !== "running") return;

            try {
              const osc = audioContext.createOscillator();
              const gain = audioContext.createGain();
              const filter = audioContext.createBiquadFilter();

              osc.connect(filter);
              filter.connect(gain);
              gain.connect(audioContext.destination);

              osc.type = "sine";
              filter.type = "highpass";
              filter.frequency.setValueAtTime(1000, audioContext.currentTime);

              const sparkleFreq = 1500 + Math.random() * 2000; // Random high frequencies
              osc.frequency.setValueAtTime(
                sparkleFreq,
                audioContext.currentTime,
              );
              osc.frequency.exponentialRampToValueAtTime(
                sparkleFreq * 1.5,
                audioContext.currentTime + 0.2,
              );

              gain.gain.setValueAtTime(0.06, audioContext.currentTime);
              gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + 0.3,
              );

              osc.start(audioContext.currentTime);
              osc.stop(audioContext.currentTime + 0.3);
            } catch (error) {
              // Silently fail
            }
          },
          wave * 200 + i * 25,
        ); // Staggered sparkles across 3 waves
      }
    }

    // Deep celebration bass boom
    const bassOsc = audioContext.createOscillator();
    const bassGain = audioContext.createGain();
    const bassFilter = audioContext.createBiquadFilter();

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(audioContext.destination);

    bassOsc.type = "sine";
    bassFilter.type = "lowpass";
    bassFilter.frequency.setValueAtTime(200, audioContext.currentTime);

    bassOsc.frequency.setValueAtTime(80, audioContext.currentTime);
    bassOsc.frequency.exponentialRampToValueAtTime(
      40,
      audioContext.currentTime + 0.4,
    );
    bassGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.5,
    );

    bassOsc.start(audioContext.currentTime);
    bassOsc.stop(audioContext.currentTime + 0.5);

    // Victory chimes - crystalline bells
    const chimeFreqs = [2093, 2637, 3136, 3729]; // High C to high F#
    chimeFreqs.forEach((freq, i) => {
      setTimeout(
        () => {
          if (audioContext.state !== "running") return;

          try {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();

            osc.connect(gain);
            gain.connect(audioContext.destination);

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.setValueAtTime(0.08, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(
              0.001,
              audioContext.currentTime + 1.0,
            );

            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + 1.0);
          } catch (error) {
            // Silently fail
          }
        },
        300 + i * 100,
      ); // Delayed chimes for extended celebration
    });
  } catch (error) {
    // Silently fail
  }
};

// Printer/label sound effect
const createPrintSound = (audioContext) => {
  if (!audioContext || audioContext.state !== "running") return;

  try {
    // Mechanical printer sound with digital beeps
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    const gain2 = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();

    osc1.connect(filter);
    filter.connect(gain1);
    gain1.connect(audioContext.destination);

    osc2.connect(gain2);
    gain2.connect(audioContext.destination);

    // Mechanical whir
    osc1.type = "sawtooth";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, audioContext.currentTime);

    osc1.frequency.setValueAtTime(120, audioContext.currentTime);
    gain1.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain1.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.8,
    );

    // Digital beep confirmation
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1200, audioContext.currentTime + 0.6);
    osc2.frequency.setValueAtTime(1500, audioContext.currentTime + 0.7);
    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.6);
    gain2.gain.linearRampToValueAtTime(0.12, audioContext.currentTime + 0.62);
    gain2.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.9,
    );

    osc1.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime + 0.6);
    osc1.stop(audioContext.currentTime + 0.8);
    osc2.stop(audioContext.currentTime + 0.9);
  } catch (error) {
    // Silently fail
  }
};

// Animated Background Component - includes both gradient and particles
const AnimatedBackground = () => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    // Create initial particles
    const initialParticles = [];
    for (let i = 0; i < 20; i++) {
      initialParticles.push({
        id: particleIdRef.current++,
        left: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.5 + 0.5,
      });
    }
    setParticles(initialParticles);

    // Add new particles periodically
    const interval = setInterval(() => {
      const newParticle = {
        id: particleIdRef.current++,
        left: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: 0,
        opacity: Math.random() * 0.5 + 0.5,
      };

      setParticles((prev) => {
        // Remove old particles and add new one
        const filtered = prev.filter((p) => {
          const age = Date.now() - (p.createdAt || 0);
          return age < 30000; // Remove particles older than 30 seconds
        });
        return [...filtered, { ...newParticle, createdAt: Date.now() }];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Full viewport gradient background matching app.css */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
          zIndex: -2,
        }}
      />

      {/* Radial gradient overlay matching app.css */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), 
                      radial-gradient(circle at 80% 80%, rgba(96, 165, 250, 0.05) 0%, transparent 50%), 
                      radial-gradient(circle at 40% 20%, rgba(76, 175, 80, 0.05) 0%, transparent 50%)`,
          zIndex: -1,
          animation: "backgroundShift 20s ease-in-out infinite",
        }}
      />

      {/* Particle container */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
              opacity: particle.opacity,
            }}
          />
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .particle {
            position: absolute;
            width: 7px;
            height: 7px;
            background: rgba(59, 130, 246, 0.5);
            border-radius: 50%;
            bottom: -10px;
            animation: floatUp linear infinite;
            pointer-events: none;
          }

          @keyframes floatUp {
            to {
              transform: translateY(-100vh) translateX(100px);
              opacity: 0;
            }
          }

          @keyframes gradientShift {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          @keyframes backgroundShift {
            0%, 100% {
              transform: rotate(0deg) scale(1);
            }
            50% {
              transform: rotate(180deg) scale(1.1);
            }
          }
        `,
        }}
      />
    </>
  );
};

// Mock Data with picked dates
const initialTotes = [
  {
    id: "TOTE-001",
    orderId: "SO5342",
    priority: "high",
    customer: "Auckland Security Systems",
    pickedDate: "2025-01-06T09:30:00",
    items: [
      {
        id: "9421234567890",
        name: "PIR Motion Sensor",
        quantity: 2,
        binLocation: "A-01-03",
      },
      {
        id: "9421234567894",
        name: "LCD Keypad",
        quantity: 1,
        binLocation: "A-02-15",
      },
    ],
  },
  {
    id: "TOTE-002",
    orderId: "SO5343",
    priority: "normal",
    customer: "Wellington Safety Co",
    pickedDate: "2025-01-06T10:15:00",
    items: [
      {
        id: "9421234567896",
        name: "HD Security Camera",
        quantity: 1,
        binLocation: "B-03-07",
      },
      {
        id: "9421234567893",
        name: "Magnetic Door Contact",
        quantity: 3,
        binLocation: "B-03-08",
      },
    ],
  },
  {
    id: "TOTE-003",
    orderId: "SO5344",
    priority: "high",
    customer: "Christchurch Electronics",
    pickedDate: "2025-01-06T08:45:00",
    items: [
      {
        id: "9421234567892",
        name: "Smart Control Panel",
        quantity: 1,
        binLocation: "C-05-12",
      },
      {
        id: "9421234567891",
        name: "Outdoor Siren 120dB",
        quantity: 2,
        binLocation: "C-06-22",
      },
    ],
  },
  {
    id: "TOTE-004",
    orderId: "SO5345",
    priority: "urgent",
    customer: "Hamilton Tech Hub",
    pickedDate: "2025-01-05T16:20:00",
    items: [
      {
        id: "9421234567895",
        name: "Photoelectric Smoke Detector",
        quantity: 3,
        binLocation: "D-01-04",
      },
      {
        id: "9421234567897",
        name: "Wireless Panic Button",
        quantity: 3,
        binLocation: "D-01-05",
      },
    ],
  },
  {
    id: "TOTE-005",
    orderId: "SO5346",
    priority: "normal",
    customer: "Dunedin Digital",
    pickedDate: "2025-01-06T11:00:00",
    items: [
      {
        id: "9421234567890",
        name: "PIR Motion Sensor",
        quantity: 1,
        binLocation: "E-08-18",
      },
      {
        id: "9421234567893",
        name: "Magnetic Door Contact",
        quantity: 2,
        binLocation: "E-09-20",
      },
    ],
  },
];

const boxOptions = [
  {
    id: "box-s",
    name: "Small Box",
    dimensions: "20x20x10cm",
    courier: "NZ Couriers",
    icon: "s���",
  },
  {
    id: "box-m",
    name: "Medium Box",
    dimensions: "30x30x15cm",
    courier: "NZ Couriers",
    icon: "📤",
  },
  {
    id: "box-l",
    name: "Large Box",
    dimensions: "40x40x20cm",
    courier: "NZ Couriers",
    icon: "📫",
  },
];

const courierBagOptions = [
  {
    id: "nzc-a4",
    name: "NZ Couriers A4 Satchel",
    courier: "NZ Couriers",
    icon: "✉️",
  },
  {
    id: "nzc-a3",
    name: "NZ Couriers A3 Satchel",
    courier: "NZ Couriers",
    icon: "📨",
  },
  {
    id: "nzc-a2",
    name: "NZ Couriers A2 Satchel",
    courier: "NZ Couriers",
    icon: "📮",
  },
];

const palletOptions = [
  {
    id: "custom-pallet",
    name: "Pallet",
    dimensions: "Custom Size",
    courier: "Mainfreight",
    icon: "🚚",
    requiresWeight: true,
    isCustom: true,
  },
];

// Animated XP Counter
const AnimatedCounter = ({
  target,
  duration = 2000,
  prefix = "",
  suffix = "",
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {count}
      {suffix}
    </span>
  );
};

// Confetti Component
const Confetti = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: [
              "#3b82f6",
              "#8b5cf6",
              "#ec4899",
              "#10b981",
              "#f59e0b",
            ][i % 5],
            left: `${Math.random() * 100}%`,
            animation: `confetti-fall ${Math.random() * 2 + 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes confetti-fall {
            0% {
              transform: translateY(-10px) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
        `,
        }}
      />
    </div>
  );
};

// Enhanced Scan Input
const ScanInput = ({
  onScan,
  placeholder = "Scan or enter barcode...",
  autoFocus = true,
  onValidationResult = null,
}) => {
  const [value, setValue] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleScan = (scanValue) => {
    setScanning(true);
    setTimeout(() => {
      onScan(scanValue);

      if (onValidationResult) {
        const isValid = onValidationResult(scanValue);
        setResult(isValid ? "success" : "error");
      } else {
        setResult(null);
      }

      setScanning(false);

      setTimeout(() => {
        setResult(null);
        setValue("");
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      handleScan(value.trim());
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setValue(newValue);

    if (newValue.length >= 8 && /^[A-Z0-9-]+$/.test(newValue)) {
      setTimeout(() => {
        if (value === newValue && newValue.trim()) {
          handleScan(newValue.trim());
        }
      }, 50);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <ScanLine
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
            scanning
              ? "text-blue-500 animate-pulse"
              : result === "error"
                ? "text-red-400"
                : "text-gray-400"
          }`}
          size={20}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-12 py-3 bg-white/5 border rounded-xl text-white transition-all ${
            scanning ? "border-blue-500 bg-blue-500/10" : ""
          } ${
            result === "error"
              ? "border-red-500 bg-red-500/10"
              : "border-white/10"
          } ${result === "success" ? "border-green-500 bg-green-500/10" : ""}`}
          disabled={scanning}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
        />

        {scanning && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {result && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {result === "success" ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <AlertCircle className="text-red-500" size={24} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Packing Timer Component
const PackingTimer = ({ onComplete, isActive }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSeconds = prev + 1;
          if (newSeconds % 30 === 0 && newSeconds > 0) {
            playSound("tick");
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    if (!isActive && seconds > 0) {
      onComplete(seconds);
    }
  }, [isActive, seconds, onComplete]);

  return (
    <div className="flex items-center space-x-2">
      <Timer className="text-blue-400 animate-pulse" size={20} />
      <div className="text-5xl font-mono bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
        {formatTime(seconds)}
      </div>
    </div>
  );
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityStyle = () => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "urgent":
        return <Zap size={14} />;
      case "high":
        return <TrendingUp size={14} />;
      default:
        return <Activity size={14} />;
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1 ${getPriorityStyle()}`}
    >
      {getPriorityIcon()}
      {priority}
    </span>
  );
};

// Tote Selection Screen Component
const ToteSelectionScreen = ({ totes, onSelectTote }) => {
  const [audioStatus, setAudioStatus] = useState("not-initialized");

  // Immediate audio initialization on component mount
  useEffect(() => {
    // Don't try to initialize audio immediately - wait for user gesture
    const handleInteraction = async (e) => {
      // Prevent event from being handled multiple times
      if (audioInitialized) return;

      console.log("User interaction detected, initializing audio...");

      // Initialize audio
      const success = await initializeAudio();
      if (success) {
        setAudioStatus("initialized");
        // Don't play a test sound here - let the actual interaction sound play
      } else {
        setAudioStatus("failed");
      }

      // Remove all listeners after first interaction
      document.removeEventListener("click", handleInteraction, true);
      document.removeEventListener("touchstart", handleInteraction, true);
      document.removeEventListener("keydown", handleInteraction, true);
    };

    // Check if audio is already initialized
    if (audioInitialized) {
      setAudioStatus("initialized");
    } else {
      // Listen for user interaction with capture phase to ensure we get it first
      document.addEventListener("click", handleInteraction, true);
      document.addEventListener("touchstart", handleInteraction, true);
      document.addEventListener("keydown", handleInteraction, true);
    }

    return () => {
      // Cleanup listeners on unmount
      document.removeEventListener("click", handleInteraction, true);
      document.removeEventListener("touchstart", handleInteraction, true);
      document.removeEventListener("keydown", handleInteraction, true);
    };
  }, []);

  const getTotePriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "from-red-500/20 to-red-600/10";
      case "high":
        return "from-orange-500/20 to-orange-600/10";
      default:
        return "from-blue-500/20 to-blue-600/10";
    }
  };

  const prioritySortedTotes = [...totes].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "from-red-500/20 to-red-600/10";
      case "high":
        return "from-orange-500/20 to-orange-600/10";
      default:
        return "from-blue-500/20 to-blue-600/10";
    }
  };

  const sortedTotes = [...totes].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="min-h-screen w-full p-8 overflow-auto relative">
      <AnimatedBackground />

      {/* Audio status indicator */}
      {audioStatus !== "initialized" && (
        <div className="fixed top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 text-yellow-300 text-sm z-50">
          🔇 Click anywhere to enable sound effects
        </div>
      )}

      <div className="w-full relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ShoppingCart className="text-blue-400 mr-3" size={48} />
            <h1 className="text-6xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Select a Tote
            </h1>
          </div>
          <p className="text-xl text-gray-400 flex items-center justify-center">
            <ShoppingCart className="mr-2" size={20} />
            Choose an order tote to begin your packing run
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 max-w-[2400px] mx-auto">
          {prioritySortedTotes.map((tote, index) => (
            <div
              key={tote.id}
              onClick={() => {
                onSelectTote(tote);
                // playSound is now async and will handle initialization
                playSound("click");
              }}
              onMouseEnter={() => playSound("hover")}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl p-8 h-full hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-500/50 border border-gray-800 relative overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getPriorityColor(tote.priority)} opacity-50`}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/5 group-hover:to-blue-500/10 rounded-3xl transition-all duration-500" />

                <div className="relative">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors flex items-center">
                        <ShoppingCart className="mr-2" size={28} />
                        {tote.id}
                      </h2>
                      <p className="text-gray-500 font-medium group-hover:text-gray-400 transition-colors flex items-center">
                        <Barcode className="mr-1" size={16} />
                        {tote.orderId}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <User className="mr-1" size={14} />
                        {tote.customer}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 flex items-center">
                        <Calendar className="mr-1" size={12} />
                        Picked: {formatDate(tote.pickedDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <PriorityBadge priority={tote.priority} />
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {tote.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0,
                          )}{" "}
                          items
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {tote.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-gray-800/50 last:border-0 group-hover:border-gray-700/50 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors flex items-center">
                            <Barcode className="mr-1" size={12} />
                            {item.id}
                          </p>
                        </div>
                        <span className="font-bold text-gray-400 ml-2 group-hover:text-gray-300 transition-colors">
                          ×{item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <Play className="animate-pulse" size={16} />
                      <span className="font-semibold">Start Packing Run</span>
                      <ArrowRight
                        className="transform group-hover:translate-x-2 transition-transform"
                        size={20}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ progress, size = 60, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
};

// Packing Screen Component - Unified Mode
const PackingScreen = ({ tote, onComplete }) => {
  const [scannedItems, setScannedItems] = useState([]);
  const [timerActive, setTimerActive] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showComboAnimation, setShowComboAnimation] = useState(false);
  const [perfectStreak, setPerfectStreak] = useState(true);
  const [scanError, setScanError] = useState("");
  const [finalTime, setFinalTime] = useState(null);
  const [audioStatus, setAudioStatus] = useState("not-initialized");

  // Audio initialization for direct access to packing screen
  useEffect(() => {
    const handleInteraction = async (e) => {
      if (audioInitialized) return;

      console.log(
        "User interaction detected on packing screen, initializing audio...",
      );

      const success = await initializeAudio();
      if (success) {
        setAudioStatus("initialized");
        setTimeout(() => playSound("click"), 100);
      } else {
        setAudioStatus("failed");
      }

      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    if (audioInitialized) {
      setAudioStatus("initialized");
    } else {
      document.addEventListener("click", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("keydown", handleInteraction);
    }

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, []);

  const validateScan = (scannedSKU) => {
    const item = tote.items.find((i) => i.id === scannedSKU);
    if (!item) {
      return false;
    }

    const scannedCount = scannedItems.filter((id) => id === scannedSKU).length;
    if (scannedCount >= item.quantity) {
      return false;
    }

    return true;
  };

  const handleItemScan = (scannedSKU) => {
    const item = tote.items.find((i) => i.id === scannedSKU);
    if (!item) {
      setCombo(0);
      setPerfectStreak(false);
      setScanError(`Invalid item! "${scannedSKU}" is not in this order.`);
      setTimeout(() => setScanError(""), 3000);
      playSound("error");
      return;
    }

    const scannedCount = scannedItems.filter((id) => id === scannedSKU).length;
    if (scannedCount >= item.quantity) {
      setScanError(`Already scanned all ${item.quantity} of ${item.name}`);
      setTimeout(() => setScanError(""), 3000);
      playSound("error");
      return;
    }

    setScannedItems([...scannedItems, scannedSKU]);
    setCombo((prev) => prev + 1);
    setScanError("");
    playSound("success");

    if (combo > 0 && combo % 5 === 0) {
      setShowComboAnimation(true);
      playSound("combo");
      setTimeout(() => setShowComboAnimation(false), 1000);
    }

    const newScannedItems = [...scannedItems, scannedSKU];
    const allScanned = tote.items.every((item) => {
      const count = newScannedItems.filter((id) => id === item.id).length;
      return count >= item.quantity;
    });

    if (allScanned) {
      setTimeout(() => {
        setTimerActive(false);
      }, 100); // Reduced from 500ms to 100ms
    }
  };

  // Handle item click with direct sound handling
  const handleItemClick = (itemId) => {
    playSound("click");
    handleItemScan(itemId);
  };

  const isItemFullyScanned = (itemId) => {
    const item = tote.items.find((i) => i.id === itemId);
    const scannedCount = scannedItems.filter((id) => id === itemId).length;
    return scannedCount >= item.quantity;
  };

  const getScannedCount = (itemId) => {
    return scannedItems.filter((id) => id === itemId).length;
  };

  const allItemsScanned = tote.items.every((item) => {
    const scannedCount = scannedItems.filter((id) => id === item.id).length;
    return scannedCount >= item.quantity;
  });

  const handleFinishPacking = (seconds) => {
    setFinalTime(seconds);
  };

  useEffect(() => {
    if (allItemsScanned && finalTime !== null) {
      setTimeout(() => {
        playSound("complete");
        onComplete({ time: finalTime, perfectStreak, combo });
      }, 500); // Reduced from 1500ms to 500ms
    }
  }, [allItemsScanned, finalTime, perfectStreak, combo, onComplete]);

  const totalProgress =
    scannedItems.length /
    tote.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen w-full p-8 overflow-auto relative">
      <AnimatedBackground />

      {/* Audio status indicator */}
      {audioStatus !== "initialized" && (
        <div className="fixed top-4 right-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 text-yellow-300 text-sm z-50">
          🔇 Click anywhere to enable sound effects
        </div>
      )}

      {showComboAnimation && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 animate-bounce">
            {combo}x COMBO!
          </div>
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/10">
          <div className="relative">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-bold text-white mb-3 tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                  <Target className="mr-3 text-blue-400" size={48} />
                  Packing Station
                </h1>
                <div className="flex items-center space-x-6">
                  <span className="text-lg text-gray-500 flex items-center">
                    <ShoppingCart className="mr-2" size={18} />
                    Tote:{" "}
                    <span className="font-bold text-gray-300 ml-1">
                      {tote.id}
                    </span>
                  </span>
                  <span className="text-lg text-gray-500 flex items-center">
                    <Barcode className="mr-2" size={18} />
                    Order:{" "}
                    <span className="font-bold text-gray-300 ml-1">
                      {tote.orderId}
                    </span>
                  </span>
                  <span className="text-lg text-gray-500 flex items-center">
                    <CalendarDays className="mr-2" size={18} />
                    Picked:{" "}
                    <span className="font-bold text-gray-300 ml-1">
                      {formatDate(tote.pickedDate)}
                    </span>
                  </span>
                  <PriorityBadge priority={tote.priority} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="text-center bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-wider flex items-center justify-center">
                    <Zap className="mr-1" size={14} />
                    Combo
                  </p>
                  <p
                    className={`text-3xl font-bold ${combo > 0 ? "text-yellow-400" : "text-gray-600"}`}
                  >
                    {combo}x
                  </p>
                </div>

                <div className="text-center bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/10">
                  <p className="text-sm text-gray-500 mb-1 font-semibold uppercase tracking-wider flex items-center justify-center">
                    <Star className="mr-1" size={14} />
                    Streak
                  </p>
                  <div
                    className={`text-3xl ${perfectStreak ? "text-green-400" : "text-gray-600"}`}
                  >
                    {perfectStreak ? "✓" : "✗"}
                  </div>
                </div>

                <div className="text-center bg-white/[0.03] backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden border border-white/10 min-w-[200px]">
                  <div className="relative">
                    <p className="text-sm text-gray-500 mb-3 font-semibold uppercase tracking-wider">
                      Packing Time
                    </p>
                    <PackingTimer
                      onComplete={handleFinishPacking}
                      isActive={timerActive}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Run Progress</span>
                <span className="text-sm font-bold text-blue-400">
                  {Math.round(totalProgress * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-500"
                  style={{ width: `${totalProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            <ScanLine className="mr-3 text-blue-400" size={24} />
            Scan or Click Items
          </h2>
          <ScanInput
            onScan={handleItemScan}
            placeholder="Scan barcode or click items below..."
            autoFocus={true}
            onValidationResult={validateScan}
          />
          {scanError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center space-x-3">
              <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
              <p className="text-red-300 font-medium">{scanError}</p>
            </div>
          )}
          <div className="mt-4 text-center text-sm text-gray-500">
            Tip: You can scan barcodes or click items below to mark them as
            packed
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden border border-white/10">
          <div className="relative">
            <h2 className="text-3xl font-bold mb-8 text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
              <Package className="mr-3 text-blue-400" size={32} />
              Items to Pack
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tote.items
                .sort((a, b) => a.binLocation.localeCompare(b.binLocation))
                .map((item, index) => {
                  const scannedCount = getScannedCount(item.id);
                  const isFullyScanned = isItemFullyScanned(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      onMouseEnter={() => playSound("hover")}
                      className={`relative p-6 rounded-2xl border transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                        isFullyScanned
                          ? "bg-green-900/20 border-green-500/50 hover:border-green-400/50"
                          : "bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20"
                      }`}
                    >
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-3 py-1 rounded-full border border-blue-500/30">
                        <span className="text-xs font-bold text-blue-300 flex items-center">
                          <MapPin className="mr-1" size={12} />
                          {item.binLocation}
                        </span>
                      </div>

                      <div className="relative">
                        <div className="flex justify-between items-start mb-4">
                          <div
                            className={`flex-1 ${isFullyScanned ? "opacity-60" : ""}`}
                          >
                            <p
                              className={`font-bold text-xl mb-2 text-white ${isFullyScanned ? "line-through" : ""}`}
                            >
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center">
                              <Barcode className="mr-1" size={14} />
                              {item.id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="relative">
                            <ProgressRing
                              progress={scannedCount / item.quantity}
                              size={60}
                              strokeWidth={4}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span
                                className={`text-lg font-bold ${isFullyScanned ? "text-green-400" : "text-white"}`}
                              >
                                {scannedCount}/{item.quantity}
                              </span>
                            </div>
                          </div>

                          {isFullyScanned && (
                            <div className="bg-gradient-to-r from-green-400 to-green-500 rounded-full p-3 shadow-lg shadow-green-500/50">
                              <CheckCircle className="text-white" size={24} />
                            </div>
                          )}
                        </div>

                        <div className="mt-6 h-2 bg-white/10 rounded-full relative overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isFullyScanned
                                ? "bg-gradient-to-r from-green-400 to-green-500"
                                : "bg-gradient-to-r from-blue-400 to-blue-500"
                            }`}
                            style={{
                              width: `${(scannedCount / item.quantity) * 100}%`,
                            }}
                          />
                        </div>

                        {!isFullyScanned && (
                          <div className="mt-4 text-center text-sm text-gray-500">
                            Click to scan
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
                <BarChart3 className="mx-auto mb-2 text-blue-400" size={24} />
                <p className="text-2xl font-bold">{scannedItems.length}</p>
                <p className="text-xs text-gray-400">Items Scanned</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
                <Package className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-2xl font-bold">
                  {tote.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p className="text-xs text-gray-400">Total Items</p>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-4 text-center border border-white/10">
                <Layers className="mx-auto mb-2 text-yellow-400" size={24} />
                <p className="text-2xl font-bold">
                  {
                    tote.items.filter((item) => isItemFullyScanned(item.id))
                      .length
                  }
                  /{tote.items.length}
                </p>
                <p className="text-xs text-gray-400">Items Complete</p>
              </div>
            </div>

            {allItemsScanned && (
              <div className="mt-10 text-center">
                <div className="inline-flex items-center justify-center space-x-2 text-green-400 animate-pulse">
                  <CheckCircle size={24} />
                  <span className="text-lg font-semibold">
                    All items packed! Moving to packaging...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Package Recommendation Component
const PackageRecommendation = ({ items, onSelect }) => {
  const calculateRecommendation = () => {
    const totalVolume = items.reduce((sum, item) => {
      const estimatedVolume = item.quantity * 0.002;
      return sum + estimatedVolume;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const hasFragile = items.some(
      (item) =>
        item.name.toLowerCase().includes("camera") ||
        item.name.toLowerCase().includes("touch"),
    );

    if (totalItems === 1 && totalVolume < 0.005) {
      return {
        id: "nzc-a4",
        type: "satchel",
        reason: "Single small item - courier bag recommended",
      };
    } else if (totalItems <= 3 && totalVolume < 0.01) {
      return {
        id: "nzc-a3",
        type: "satchel",
        reason: "Few small items - medium courier bag recommended",
      };
    } else if (totalVolume < 0.015) {
      return {
        id: "box-s",
        type: "box",
        reason: hasFragile
          ? "Small box for fragile protection"
          : "Compact box for multiple items",
      };
    } else if (totalVolume < 0.02) {
      return {
        id: "box-m",
        type: "box",
        reason: "Standard box for typical order size",
      };
    } else if (totalVolume < 0.03) {
      return { id: "box-l", type: "box", reason: "Larger box for bulky items" };
    } else {
      return {
        id: "custom-pallet",
        type: "mainfreight",
        reason: "Large order - freight shipment recommended",
      };
    }
  };

  const recommendation = calculateRecommendation();

  return (
    <div className="relative bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 rounded-2xl p-6 mb-6 overflow-hidden">
      <div className="relative flex items-start space-x-4">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-lg shadow-blue-500/50">
          <Sparkles className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-300 mb-2 text-lg flex items-center">
            <Cpu className="mr-2" size={18} />
            AI Recommendation
          </h4>
          <p className="text-gray-300 mb-3">{recommendation.reason}</p>
          <button
            onClick={() => {
              playSound("combo"); // Magical sparkle sound
              onSelect(recommendation.id);
            }}
            onMouseEnter={() => playSound("hover")}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transform transition-all duration-300 hover:scale-105 flex items-center"
          >
            <Zap className="mr-2" size={16} />
            Use Recommended Package
          </button>
        </div>
      </div>
    </div>
  );
};

// Packaging Selection Screen Component
const PackagingSelectionScreen = ({
  onSelect,
  items = [],
  packingTime,
  startTime,
  tote,
}) => {
  const [selectedType, setSelectedType] = useState("boxes");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentTime, setCurrentTime] = useState(packingTime?.time || 0);
  const [palletWeight, setPalletWeight] = useState("");
  const [weightError, setWeightError] = useState("");
  const [customType, setCustomType] = useState("pallet"); // 'pallet' or 'item'
  const [customDimensions, setCustomDimensions] = useState({
    length: "",
    width: "",
    height: "",
  });
  const [customDescription, setCustomDescription] = useState("");
  const [dimensionError, setDimensionError] = useState("");

  // Continue the timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setCurrentTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const displayOptions =
    selectedType === "boxes"
      ? boxOptions
      : selectedType === "satchels"
        ? courierBagOptions
        : selectedType === "mainfreight"
          ? palletOptions
          : [];

  const getRecommendedId = () => {
    const totalVolume = items.reduce((sum, item) => {
      const estimatedVolume = item.quantity * 0.002;
      return sum + estimatedVolume;
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems === 1 && totalVolume < 0.005) return "nzc-a4";
    else if (totalItems <= 3 && totalVolume < 0.01) return "nzc-a3";
    else if (totalVolume < 0.015) return "box-s";
    else if (totalVolume < 0.02) return "box-m";
    else if (totalVolume < 0.03) return "box-l";
    else return "pallet-small";
  };

  const recommendedId = getRecommendedId();

  const getRecommendedTab = () => {
    if (boxOptions.some((opt) => opt.id === recommendedId)) return "boxes";
    if (courierBagOptions.some((opt) => opt.id === recommendedId))
      return "satchels";
    if (palletOptions.some((opt) => opt.id === recommendedId))
      return "mainfreight";
    return "boxes";
  };

  const recommendedTab = getRecommendedTab();

  // Auto-select the pallet when mainfreight tab is selected
  useEffect(() => {
    if (selectedType === "mainfreight" && !selectedPackage) {
      setSelectedPackage(palletOptions[0]); // Auto-select the custom pallet
    }
  }, [selectedType, selectedPackage]);

  const handleConfirmPackaging = () => {
    // Validate weight if pallet is selected (including custom)
    if (selectedPackage?.requiresWeight) {
      if (!palletWeight) {
        setWeightError("Weight is required for pallet shipments");
        playSound("error");
        return;
      }
      const weight = parseFloat(palletWeight);
      if (isNaN(weight) || weight <= 0) {
        setWeightError("Please enter a valid weight in kg");
        playSound("error");
        return;
      }
      if (weight > 1000) {
        setWeightError("Weight cannot exceed 1000kg");
        playSound("error");
        return;
      }
    }

    // Validate custom dimensions if custom is selected
    if (selectedPackage?.isCustom) {
      if (
        !customDimensions.length ||
        !customDimensions.width ||
        !customDimensions.height
      ) {
        setDimensionError("All dimensions are required for custom packages");
        playSound("error");
        return;
      }

      const dims = [
        customDimensions.length,
        customDimensions.width,
        customDimensions.height,
      ];
      for (let dim of dims) {
        const val = parseFloat(dim);
        if (isNaN(val) || val <= 0) {
          setDimensionError("Please enter valid dimensions in meters");
          playSound("error");
          return;
        }
        if (val > 10) {
          setDimensionError("Dimensions cannot exceed 10 meters");
          playSound("error");
          return;
        }
      }

      if (!customDescription.trim()) {
        setDimensionError(
          "Please provide a description for the custom package",
        );
        playSound("error");
        return;
      }
    }

    // Calculate final time when package is selected
    const finalTime = currentTime;

    // Build the package object with all necessary data
    let packageData = { ...selectedPackage };

    if (selectedPackage?.requiresWeight) {
      packageData.weight = parseFloat(palletWeight);
    }

    if (selectedPackage?.isCustom) {
      packageData.customType = customType;
      packageData.customDimensions = customDimensions;
      packageData.customDescription = customDescription;
      packageData.name = `Custom ${customType === "pallet" ? "Pallet" : "Item"}: ${customDescription}`;
      packageData.dimensions = `${customDimensions.length}×${customDimensions.width}×${customDimensions.height}m`;
    }

    onSelect(packageData, finalTime);
    playSound("complete");
  };

  const getTabIcon = (type) => {
    switch (type) {
      case "boxes":
        return <Box size={16} />;
      case "satchels":
        return <ShoppingBag size={16} />;
      case "mainfreight":
        return <Truck size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full p-8 overflow-auto relative">
      <AnimatedBackground />

      <div className="w-full max-w-[1800px] mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Box className="text-blue-400 mr-3" size={48} />
            <h1 className="text-6xl font-bold text-white tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Select Packaging
            </h1>
          </div>
          <p className="text-xl text-gray-400 flex items-center justify-center">
            <PackageCheck className="mr-2" size={20} />
            Choose the best packaging for this order
          </p>
        </div>

        {/* Timer and Order Details display */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-4 border border-white/10">
            <div className="flex items-center space-x-6">
              {/* Timer */}
              <div className="flex items-center space-x-3">
                <Timer className="text-blue-400" size={20} />
                <div className="text-2xl font-mono bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
                  {formatTime(currentTime)}
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-8 bg-gray-700"></div>

              {/* Order Details */}
              {tote && (
                <>
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-500">Tote:</span>
                    <span className="text-sm font-bold text-gray-300">
                      {tote.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Barcode className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-500">Order:</span>
                    <span className="text-sm font-bold text-gray-300">
                      {tote.orderId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="text-gray-500" size={16} />
                    <span className="text-sm text-gray-500">Picked:</span>
                    <span className="text-sm font-bold text-gray-300">
                      {new Date(tote.pickedDate).toLocaleDateString("en-NZ")}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <PackageRecommendation
            items={items}
            onSelect={(id) => {
              playSound("combo"); // Magical sparkle sound when selecting from recommendation
              const item = [
                ...boxOptions,
                ...courierBagOptions,
                ...palletOptions,
              ].find((opt) => opt.id === id);
              if (item) {
                if (boxOptions.includes(item)) setSelectedType("boxes");
                else if (courierBagOptions.includes(item))
                  setSelectedType("satchels");
                else if (palletOptions.includes(item))
                  setSelectedType("mainfreight");
                setSelectedPackage(item);
              }
            }}
          />
        )}

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl p-8 relative overflow-hidden border border-white/10">
          <div className="relative">
            <div className="flex justify-center space-x-4 mb-10">
              <button
                onClick={() => {
                  setSelectedType("boxes");
                  setSelectedPackage(null);
                  playSound("click");
                }}
                onMouseEnter={() => playSound("hover")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative flex items-center ${
                  selectedType === "boxes"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
              >
                {getTabIcon("boxes")}
                <span className="ml-2">Boxes</span>
                {selectedType !== "boxes" && recommendedTab === "boxes" && (
                  <span className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedType("satchels");
                  setSelectedPackage(null);
                  playSound("click");
                }}
                onMouseEnter={() => playSound("hover")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative flex items-center ${
                  selectedType === "satchels"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
              >
                {getTabIcon("satchels")}
                <span className="ml-2">Satchels</span>
                {selectedType !== "satchels" &&
                  recommendedTab === "satchels" && (
                    <span className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
              </button>
              <button
                onClick={() => {
                  setSelectedType("mainfreight");
                  setSelectedPackage(null);
                  playSound("click");
                }}
                onMouseEnter={() => playSound("hover")}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 relative flex items-center ${
                  selectedType === "mainfreight"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white bg-white/5"
                }`}
              >
                {getTabIcon("mainfreight")}
                <span className="ml-2">Mainfreight</span>
                {selectedType !== "mainfreight" &&
                  recommendedTab === "mainfreight" && (
                    <span className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  )}
              </button>
            </div>

            {/* Show package grid for boxes and satchels, but show configuration directly for mainfreight */}
            {selectedType !== "mainfreight" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayOptions.map((option, index) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      setSelectedPackage(option);
                      setPalletWeight(""); // Reset weight when selecting new package
                      setWeightError(""); // Clear any weight errors
                      setDimensionError(""); // Clear dimension errors
                      // Reset custom fields if switching packages
                      if (!option.isCustom) {
                        setCustomType("pallet");
                        setCustomDimensions({
                          length: "",
                          width: "",
                          height: "",
                        });
                        setCustomDescription("");
                      }
                      playSound("success");
                    }}
                    onMouseEnter={() => playSound("hover")}
                    className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedPackage?.id === option.id
                        ? "bg-blue-900/20 border-blue-500/50 shadow-xl shadow-blue-500/20"
                        : option.id === recommendedId
                          ? "bg-white/[0.03] backdrop-blur-xl border-blue-500/30 hover:border-blue-500/50"
                          : "bg-white/[0.03] backdrop-blur-xl border-white/10 hover:border-gray-600/50"
                    }`}
                  >
                    {option.id === recommendedId && (
                      <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-500/50 flex items-center space-x-1 animate-pulse">
                        <Sparkles size={14} />
                        <span>AI Pick</span>
                      </div>
                    )}

                    <div className="relative text-center">
                      <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-110">
                        {option.icon}
                      </div>
                      <h3 className="font-bold text-2xl mb-2 text-white">
                        {option.name}
                      </h3>
                      <p className="text-gray-400 font-medium">
                        {option.dimensions}
                      </p>
                      {option.courier && (
                        <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10">
                          <Truck className="mr-1" size={12} />
                          <span
                            className={
                              option.courier === "NZ Couriers"
                                ? "text-blue-400"
                                : "text-orange-400"
                            }
                          >
                            {option.courier}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedPackage?.id === option.id && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full p-2 shadow-lg shadow-blue-500/50">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}

            {/* Custom Pallet Configuration - Shown for mainfreight */}
            {selectedType === "mainfreight" && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6">
                  <h4 className="font-semibold text-purple-300 mb-4 text-lg flex items-center">
                    <Layers className="mr-2" size={20} />
                    Pallet Configuration
                  </h4>

                  {/* Pallet Type Selection */}
                  <div className="mb-6">
                    <p className="text-gray-400 mb-3 text-sm">
                      Select shipment type:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          setCustomType("pallet");
                          playSound("click");
                        }}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          customType === "pallet"
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30"
                        }`}
                      >
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="font-semibold">Palletized Goods</div>
                        <div className="text-xs mt-1 opacity-80">
                          Standard freight on pallet
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setCustomType("item");
                          playSound("click");
                        }}
                        className={`p-4 rounded-xl border transition-all duration-300 ${
                          customType === "item"
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "bg-white/5 border-white/10 text-gray-400 hover:border-purple-500/30"
                        }`}
                      >
                        <div className="text-3xl mb-2">📏</div>
                        <div className="font-semibold">Large Item</div>
                        <div className="text-xs mt-1 opacity-80">
                          Oversized or irregular freight
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-sm mb-2 block">
                      Description <span className="text-purple-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={customDescription}
                      onChange={(e) => {
                        setCustomDescription(e.target.value);
                        setDimensionError(""); // Clear error on input
                      }}
                      placeholder={`Describe the ${customType} contents (e.g., "Electronics", "Industrial equipment")`}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                      maxLength="50"
                    />
                  </div>

                  {/* Dimensions and Weight Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Dimensions Section */}
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">
                        Dimensions (meters){" "}
                        <span className="text-purple-400">*</span>
                      </label>
                      <div className="space-y-3">
                        <div>
                          <input
                            type="number"
                            value={customDimensions.length}
                            onChange={(e) => {
                              setCustomDimensions({
                                ...customDimensions,
                                length: e.target.value,
                              });
                              setDimensionError(""); // Clear error on input
                            }}
                            placeholder="2.40"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                            step="0.01"
                            min="0.01"
                            max="10"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Length (m)
                          </p>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={customDimensions.width}
                            onChange={(e) => {
                              setCustomDimensions({
                                ...customDimensions,
                                width: e.target.value,
                              });
                              setDimensionError(""); // Clear error on input
                            }}
                            placeholder="1.20"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                            step="0.01"
                            min="0.01"
                            max="10"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Width (m)
                          </p>
                        </div>
                        <div>
                          <input
                            type="number"
                            value={customDimensions.height}
                            onChange={(e) => {
                              setCustomDimensions({
                                ...customDimensions,
                                height: e.target.value,
                              });
                              setDimensionError(""); // Clear error on input
                            }}
                            placeholder="1.80"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                            step="0.01"
                            min="0.01"
                            max="10"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Height (m)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Weight Section */}
                    <div>
                      <label className="text-gray-400 text-sm mb-2 block">
                        Weight <span className="text-orange-400">*</span>
                      </label>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                        <p className="text-xs text-orange-300 mb-3">
                          Required for Mainfreight
                        </p>
                        <div className="relative">
                          <input
                            type="number"
                            value={palletWeight}
                            onChange={(e) => {
                              setPalletWeight(e.target.value);
                              setWeightError(""); // Clear error on input
                            }}
                            placeholder="Enter weight..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-orange-500/50 focus:outline-none transition-all"
                            step="0.1"
                            min="0"
                            max="1000"
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                            kg
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Total weight including pallet
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Error Messages */}
                  {dimensionError && (
                    <div className="mt-4 text-red-400 text-sm flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {dimensionError}
                    </div>
                  )}

                  {weightError && (
                    <div className="mt-4 text-red-400 text-sm flex items-center">
                      <AlertCircle className="mr-2" size={16} />
                      {weightError}
                    </div>
                  )}

                  {/* Calculated Volume Display */}
                  {customDimensions.length &&
                    customDimensions.width &&
                    customDimensions.height && (
                      <div className="mt-6 bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">
                            Calculated Volume:
                          </span>
                          <span className="text-white font-semibold">
                            {(
                              (parseFloat(customDimensions.length) || 0) *
                              (parseFloat(customDimensions.width) || 0) *
                              (parseFloat(customDimensions.height) || 0)
                            ).toFixed(3)}{" "}
                            m³
                          </span>
                        </div>
                      </div>
                    )}

                  <div className="mt-4 text-xs text-gray-500">
                    <Info className="inline mr-1" size={12} />
                    All freight shipments require accurate dimensions and weight
                    for pricing and safety
                  </div>
                </div>
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleConfirmPackaging}
                onMouseEnter={() => playSound("hover")}
                disabled={!selectedPackage}
                className={`px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 transform transition-all duration-300 hover:scale-105 flex items-center ${
                  !selectedPackage
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-lg hover:shadow-blue-500/50"
                }`}
              >
                {selectedPackage ? (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Confirm Packaging
                  </>
                ) : (
                  <>
                    <Package className="mr-2" size={20} />
                    Select a package to continue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Screen Component
const ConfirmationScreen = ({
  order,
  packingTime,
  selectedPackage,
  onPrintLabel,
  onNewOrder,
  onEdit,
  packingStats,
}) => {
  const [labelPrinted, setLabelPrinted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setShowConfetti(true);
    playSound("confetti");
    setTimeout(() => setShowConfetti(false), 3000);

    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(timer);
  }, []);

  const handlePrintLabel = () => {
    onPrintLabel();
    setLabelPrinted(true);
    playSound("print");
  };

  const baseXP = 50;
  const speedBonus =
    packingTime.time < 60 ? 25 : packingTime.time < 120 ? 15 : 0;
  const accuracyBonus = packingStats?.perfectStreak ? 30 : 0;
  const comboBonus = Math.min(packingStats?.combo || 0, 20) * 2;
  const totalXP = baseXP + speedBonus + accuracyBonus + comboBonus;

  return (
    <div className="min-h-screen w-full p-8 overflow-auto relative">
      <AnimatedBackground />
      <Confetti active={showConfetti} />

      <div className="w-full max-w-[1400px] mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-400 to-green-500 rounded-full mb-6 shadow-lg shadow-green-500/50">
            <Trophy className="text-white" size={64} />
          </div>
          <h2 className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Run Complete! 🎉
          </h2>
          <p className="text-gray-400 text-2xl">
            Your order is ready for shipping
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
            <Timer className="mx-auto mb-3 text-blue-400" size={40} />
            <p className="text-4xl font-bold mb-2">
              {currentStep >= 1 ? formatTime(packingTime.time) : "0:00"}
            </p>
            <p className="text-lg text-gray-400">Pack Time</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
            <Award className="mx-auto mb-3 text-yellow-400" size={40} />
            <p className="text-4xl font-bold mb-2">
              {currentStep >= 2 && packingStats?.perfectStreak ? "✓" : "—"}
            </p>
            <p className="text-lg text-gray-400">Perfect</p>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl rounded-xl p-8 text-center border border-white/10">
            <Sparkles className="mx-auto mb-3 text-purple-400" size={40} />
            <p className="text-4xl font-bold text-blue-400 mb-2">
              {currentStep >= 3 ? (
                <AnimatedCounter
                  target={totalXP}
                  duration={1500}
                  prefix="+"
                  suffix=" XP"
                />
              ) : (
                "+0 XP"
              )}
            </p>
            <p className="text-lg text-gray-400">Earned</p>
          </div>
        </div>

        {currentStep >= 3 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-8 mb-10 max-w-3xl mx-auto">
            <h4 className="font-semibold text-blue-300 mb-6 flex items-center text-xl">
              <BarChart3 className="mr-3" size={24} />
              XP Breakdown
            </h4>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between">
                <span className="flex items-center">
                  <CheckCircle className="mr-3 text-gray-400" size={20} />
                  Base Completion
                </span>
                <span className="text-blue-400 font-bold text-xl">
                  +{baseXP} XP
                </span>
              </div>
              {speedBonus > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <Zap className="mr-3 text-yellow-400" size={20} />
                    Speed Bonus
                  </span>
                  <span className="text-yellow-400 font-bold text-xl">
                    +{speedBonus} XP
                  </span>
                </div>
              )}
              {accuracyBonus > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <Target className="mr-3 text-green-400" size={20} />
                    Perfect Accuracy
                  </span>
                  <span className="text-green-400 font-bold text-xl">
                    +{accuracyBonus} XP
                  </span>
                </div>
              )}
              {comboBonus > 0 && (
                <div className="flex justify-between">
                  <span className="flex items-center">
                    <TrendingUp className="mr-3 text-purple-400" size={20} />
                    Combo Bonus
                  </span>
                  <span className="text-purple-400 font-bold text-xl">
                    +{comboBonus} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl p-8 space-y-4 border border-white/10">
            <h3 className="text-xl font-semibold text-gray-300 mb-4">
              Order Details
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium flex items-center">
                <Barcode className="mr-3" size={20} />
                Order ID:
              </span>
              <span className="font-bold text-white text-xl">
                {order.orderId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium flex items-center">
                <Timer className="mr-3" size={20} />
                Packing Time:
              </span>
              <span className="font-bold text-white text-xl">
                {formatTime(packingTime.time)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 font-medium flex items-center">
                <Box className="mr-3" size={20} />
                Package:
              </span>
              <span className="font-bold text-white text-xl">
                {selectedPackage.isCustom && selectedPackage.customType
                  ? selectedPackage.customType === "pallet"
                    ? "Pallet"
                    : "Item"
                  : selectedPackage.name}
              </span>
            </div>
            {selectedPackage.courier && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium flex items-center">
                  <Truck className="mr-3" size={20} />
                  Courier:
                </span>
                <span className="font-bold text-white text-xl">
                  {selectedPackage.courier}
                </span>
              </div>
            )}
            {selectedPackage.weight && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-medium flex items-center">
                  <Package className="mr-3" size={20} />
                  Weight:
                </span>
                <span className="font-bold text-white text-xl">
                  {selectedPackage.weight} kg
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={onEdit}
              onMouseEnter={() => playSound("hover")}
              className="w-full py-4 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl font-semibold hover:bg-gray-800/50 transition-all duration-300 flex items-center justify-center space-x-2 text-gray-300 hover:text-white text-lg"
            >
              <RotateCcw size={24} />
              <span>Edit Packing</span>
            </button>

            <button
              onClick={handlePrintLabel}
              onMouseEnter={() => playSound("hover")}
              className={`w-full py-5 flex items-center justify-center space-x-2 transition-all duration-300 rounded-xl font-semibold text-xl ${
                !labelPrinted
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/50"
                  : "bg-white/[0.03] backdrop-blur-xl border border-white/10 text-gray-300 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Barcode size={24} />
              <span>{labelPrinted ? "Print Label Again" : "Print Label"}</span>
            </button>

            {labelPrinted && (
              <>
                <div className="text-center text-green-400 text-lg flex items-center justify-center space-x-2">
                  <CheckCircle size={20} />
                  <span>Label Printed Successfully</span>
                </div>
                <button
                  onClick={onNewOrder}
                  onMouseEnter={() => playSound("hover")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-5 flex items-center justify-center space-x-2 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 rounded-xl font-semibold text-xl"
                >
                  <ArrowRight size={24} />
                  <span>Pack New Order</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Packing Component
const Packing = () => {
  const [currentScreen, setCurrentScreen] = useState("toteSelection");
  const [selectedTote, setSelectedTote] = useState(null);
  const [packingTime, setPackingTime] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [totes, setTotes] = useState(initialTotes);
  const [packingStats, setPackingStats] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Ensure body has the correct background class
  useEffect(() => {
    // The body background should be handled by app.css
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleToteSelect = (tote) => {
    setSelectedTote(tote);
    setStartTime(Date.now()); // Start the timer
    setCurrentScreen("packing");
  };

  const handlePackingComplete = (stats) => {
    setPackingTime({ time: stats.time });
    setPackingStats(stats);
    setCurrentScreen("packageSelection");
  };

  const handlePackageSelect = (pkg, finalTime) => {
    // Use the final time from packaging screen
    if (finalTime !== undefined) {
      setPackingTime({ time: finalTime });
    } else if (startTime) {
      // Fallback to calculating it here
      const calculatedTime = Math.floor((Date.now() - startTime) / 1000);
      setPackingTime({ time: calculatedTime });
    }
    setSelectedPackage(pkg);
    setCurrentScreen("confirmation");
  };

  const handlePrintLabel = () => {
    console.log("Printing label for order:", selectedTote.orderId);

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.top = "-1000px";
    printFrame.style.left = "-1000px";
    document.body.appendChild(printFrame);

    const labelHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shipping Label - ${selectedTote.orderId}</title>
        <style>
          @page {
            size: 4in 6in;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
          }
          .label-container {
            border: 2px solid #000;
            padding: 20px;
            height: calc(6in - 40px);
            box-sizing: border-box;
          }
          .header {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .barcode {
            text-align: center;
            font-family: 'Courier New', monospace;
            font-size: 24px;
            letter-spacing: 5px;
            margin: 20px 0;
            padding: 10px;
            background: #f0f0f0;
          }
          .info-row {
            margin: 10px 0;
            display: flex;
            justify-content: space-between;
          }
          .info-label {
            font-weight: bold;
          }
          .customer-info {
            margin-top: 30px;
            border-top: 1px solid #000;
            padding-top: 20px;
          }
          .items-list {
            margin-top: 20px;
            font-size: 12px;
          }
          .weight-info {
            margin-top: 15px;
            padding: 10px;
            background: #fffee0;
            border: 1px solid #ffd700;
            font-weight: bold;
          }
          .footer {
            position: absolute;
            bottom: 20px;
            right: 20px;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            <h2 style="margin: 0; text-align: center;">${selectedPackage.courier || "SHIPPING LABEL"}</h2>
          </div>

          <div class="barcode">${selectedTote.orderId}</div>

          <div class="info-row">
            <span class="info-label">Order ID:</span>
            <span>${selectedTote.orderId}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Tote:</span>
            <span>${selectedTote.id}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Package:</span>
            <span>${selectedPackage.name}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Priority:</span>
            <span style="text-transform: uppercase; color: ${
              selectedTote.priority === "urgent"
                ? "red"
                : selectedTote.priority === "high"
                  ? "orange"
                  : "blue"
            };">${selectedTote.priority}</span>
          </div>

          ${
            selectedPackage.weight
              ? `
            <div class="weight-info">
              WEIGHT: ${selectedPackage.weight} kg
            </div>
          `
              : ""
          }

          <div class="customer-info">
            <h3 style="margin: 0 0 10px 0;">Ship To:</h3>
            <div style="font-size: 14px;">
              ${selectedTote.customer}<br>
              Auckland, New Zealand
            </div>
          </div>

          <div class="items-list">
            <strong>Items (${selectedTote.items.reduce((sum, item) => sum + item.quantity, 0)} total):</strong><br>
            ${selectedTote.items
              .map((item) => `${item.quantity}x ${item.name} (${item.id})`)
              .join("<br>")}
          </div>

          <div class="footer">
            Packed: ${new Date().toLocaleString("en-NZ")}
          </div>
        </div>
      </body>
      </html>
    `;

    printFrame.contentDocument.open();
    printFrame.contentDocument.write(labelHTML);
    printFrame.contentDocument.close();

    printFrame.onload = function () {
      printFrame.contentWindow.focus();
      printFrame.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    };
  };

  const handleNewOrder = () => {
    setTotes(totes.filter((t) => t.id !== selectedTote.id));
    setSelectedTote(null);
    setPackingTime(null);
    setSelectedPackage(null);
    setPackingStats(null);
    setCurrentScreen("toteSelection");
  };

  const handleEdit = () => {
    setCurrentScreen("packing");
  };

  return (
    <>
      {currentScreen === "toteSelection" && (
        <ToteSelectionScreen totes={totes} onSelectTote={handleToteSelect} />
      )}

      {currentScreen === "packing" && selectedTote && (
        <PackingScreen tote={selectedTote} onComplete={handlePackingComplete} />
      )}

      {currentScreen === "packageSelection" && selectedTote && (
        <PackagingSelectionScreen
          onSelect={handlePackageSelect}
          items={selectedTote.items}
          packingTime={packingTime}
          startTime={startTime}
          tote={selectedTote}
        />
      )}

      {currentScreen === "confirmation" &&
        selectedTote &&
        packingTime &&
        selectedPackage && (
          <ConfirmationScreen
            order={selectedTote}
            packingTime={packingTime}
            selectedPackage={selectedPackage}
            onPrintLabel={handlePrintLabel}
            onNewOrder={handleNewOrder}
            onEdit={handleEdit}
            packingStats={packingStats}
          />
        )}
    </>
  );
};

export default Packing;
