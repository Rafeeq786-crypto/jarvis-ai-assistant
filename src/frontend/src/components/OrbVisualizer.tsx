import { useEffect, useRef } from "react";
import type { JarvisState } from "../hooks/useJarvis";

interface OrbVisualizerProps {
  state: JarvisState;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function OrbVisualizer({ state }: OrbVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use non-null assertion since we've checked above
    const c = ctx;
    const SIZE = canvas.width;
    const CX = SIZE / 2;
    const CY = SIZE / 2;
    const ORB_RADIUS = SIZE * 0.22;

    function spawnParticle() {
      const angle = Math.random() * Math.PI * 2;
      const r = ORB_RADIUS * (1.1 + Math.random() * 0.3);
      particlesRef.current.push({
        x: CX + Math.cos(angle) * r,
        y: CY + Math.sin(angle) * r,
        vx: Math.cos(angle) * (0.4 + Math.random() * 0.8),
        vy: Math.sin(angle) * (0.4 + Math.random() * 0.8),
        life: 0,
        maxLife: 60 + Math.random() * 40,
        size: 1 + Math.random() * 2,
      });
    }

    function draw(timestamp: number) {
      timeRef.current = timestamp;
      const t = timestamp / 1000;

      c.clearRect(0, 0, SIZE, SIZE);

      // === DRAW ORB CORE ===
      const coreGrad = c.createRadialGradient(CX, CY, 0, CX, CY, ORB_RADIUS);

      if (state === "idle") {
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.5);
        coreGrad.addColorStop(0, "rgba(0, 12, 25, 1)");
        coreGrad.addColorStop(0.5, `rgba(0, 30, 60, ${pulse * 0.8})`);
        coreGrad.addColorStop(0.85, `rgba(0, 180, 220, ${pulse * 0.6})`);
        coreGrad.addColorStop(1, `rgba(0, 200, 255, ${pulse * 0.9})`);
      } else if (state === "listening") {
        coreGrad.addColorStop(0, "rgba(0, 10, 20, 1)");
        coreGrad.addColorStop(0.4, "rgba(0, 60, 100, 0.9)");
        coreGrad.addColorStop(0.8, "rgba(0, 200, 255, 0.85)");
        coreGrad.addColorStop(1, "rgba(0, 230, 255, 1)");
      } else if (state === "thinking") {
        const spin = Math.sin(t * 4);
        coreGrad.addColorStop(0, "rgba(0, 5, 20, 1)");
        coreGrad.addColorStop(0.3, `rgba(10, 20, 80, ${0.8 + spin * 0.2})`);
        coreGrad.addColorStop(0.7, "rgba(40, 80, 200, 0.85)");
        coreGrad.addColorStop(1, "rgba(80, 120, 255, 0.9)");
      } else {
        // speaking
        const speakPulse = 0.75 + 0.25 * Math.sin(t * 8);
        coreGrad.addColorStop(0, "rgba(0, 5, 15, 1)");
        coreGrad.addColorStop(0.3, "rgba(0, 40, 80, 0.9)");
        coreGrad.addColorStop(0.7, `rgba(0, 160, 210, ${speakPulse})`);
        coreGrad.addColorStop(1, `rgba(0, 220, 255, ${speakPulse})`);
      }

      // Outer glow
      c.save();
      let glowRadius = ORB_RADIUS;
      let glowAlpha = 0.3;

      if (state === "idle") {
        glowRadius = ORB_RADIUS * (1.05 + 0.05 * Math.sin(t * 1.5));
        glowAlpha = 0.25 + 0.1 * Math.sin(t * 1.5);
      } else if (state === "listening") {
        glowRadius = ORB_RADIUS * (1.1 + 0.1 * Math.sin(t * 5));
        glowAlpha = 0.5 + 0.15 * Math.sin(t * 5);
      } else if (state === "thinking") {
        glowRadius = ORB_RADIUS * (1.08 + 0.05 * Math.sin(t * 4));
        glowAlpha = 0.35 + 0.15 * Math.sin(t * 3);
      } else {
        glowRadius = ORB_RADIUS * (1.12 + 0.12 * Math.abs(Math.sin(t * 7)));
        glowAlpha = 0.55 + 0.2 * Math.abs(Math.sin(t * 7));
      }

      const glowGrad = c.createRadialGradient(
        CX,
        CY,
        ORB_RADIUS * 0.8,
        CX,
        CY,
        glowRadius * 2,
      );
      if (state === "thinking") {
        glowGrad.addColorStop(0, `rgba(80, 120, 255, ${glowAlpha})`);
        glowGrad.addColorStop(0.5, `rgba(40, 80, 200, ${glowAlpha * 0.5})`);
        glowGrad.addColorStop(1, "rgba(0, 0, 50, 0)");
      } else {
        glowGrad.addColorStop(0, `rgba(0, 200, 255, ${glowAlpha})`);
        glowGrad.addColorStop(0.5, `rgba(0, 150, 220, ${glowAlpha * 0.5})`);
        glowGrad.addColorStop(1, "rgba(0, 0, 30, 0)");
      }
      c.fillStyle = glowGrad;
      c.beginPath();
      c.arc(CX, CY, glowRadius * 2, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Draw orb
      c.save();
      c.shadowBlur =
        state === "speaking" ? 40 : state === "listening" ? 30 : 20;
      c.shadowColor =
        state === "thinking"
          ? "rgba(80, 120, 255, 0.8)"
          : "rgba(0, 200, 255, 0.8)";
      c.beginPath();
      c.arc(CX, CY, ORB_RADIUS, 0, Math.PI * 2);
      c.fillStyle = coreGrad;
      c.fill();
      c.restore();

      // === RINGS ===
      const ringConfigs = [
        {
          radius: ORB_RADIUS * 1.25,
          speed: 0.4,
          width: 1,
          alpha: 0.5,
          dash: [8, 4],
        },
        {
          radius: ORB_RADIUS * 1.45,
          speed: -0.3,
          width: 1.5,
          alpha: 0.4,
          dash: [4, 8],
        },
        {
          radius: ORB_RADIUS * 1.65,
          speed: 0.6,
          width: 1,
          alpha: 0.3,
          dash: [12, 6],
        },
        {
          radius: ORB_RADIUS * 1.9,
          speed: -0.5,
          width: 0.8,
          alpha: 0.2,
          dash: [6, 10],
        },
      ];

      const ringColorBase =
        state === "thinking" ? "rgba(80, 140, 255," : "rgba(0, 200, 255,";

      for (let i = 0; i < ringConfigs.length; i++) {
        const ring = ringConfigs[i];
        let speed = ring.speed;
        if (state === "listening") speed *= 3;
        else if (state === "thinking") speed *= 4;
        else if (state === "speaking") speed *= 2;

        let alpha = ring.alpha;
        if (state === "listening")
          alpha = ring.alpha * (1.5 + 0.5 * Math.sin(t * 5 + i));
        else if (state === "speaking")
          alpha = ring.alpha * (1.5 + 0.5 * Math.sin(t * 8 + i * 0.7));
        else if (state === "thinking")
          alpha = ring.alpha * (1.2 + 0.4 * Math.sin(t * 3 + i));
        else alpha = ring.alpha * (0.8 + 0.2 * Math.sin(t * 1.5 + i));

        let radius = ring.radius;
        if (state === "listening")
          radius *= 1 + 0.08 * Math.sin(t * 4 + i * 1.2);
        else if (state === "speaking")
          radius *= 1 + 0.12 * Math.sin(t * 6 + i * 0.8);

        c.save();
        c.translate(CX, CY);
        c.rotate(t * speed);
        c.strokeStyle = `${ringColorBase} ${Math.min(alpha, 1)})`;
        c.lineWidth = ring.width;
        c.setLineDash(ring.dash);

        const segments = state === "thinking" ? 6 : 4;
        for (let s = 0; s < segments; s++) {
          const startAngle = ((Math.PI * 2) / segments) * s;
          const endAngle = startAngle + ((Math.PI * 2) / segments) * 0.7;
          c.beginPath();
          c.arc(0, 0, radius, startAngle, endAngle);
          c.stroke();
        }
        c.restore();
      }

      // === THINKING: Spinning arc segments ===
      if (state === "thinking") {
        for (let i = 0; i < 3; i++) {
          const arcR = ORB_RADIUS * (1.3 + i * 0.25);
          const arcStart = t * (2 + i * 0.8) + (i * Math.PI * 2) / 3;
          const arcLen = Math.PI * 0.6;
          c.save();
          c.translate(CX, CY);
          c.strokeStyle = `rgba(80, 140, 255, ${0.7 - i * 0.15})`;
          c.lineWidth = 2 - i * 0.3;
          c.setLineDash([]);
          c.beginPath();
          c.arc(0, 0, arcR, arcStart, arcStart + arcLen);
          c.stroke();
          const ex = Math.cos(arcStart + arcLen) * arcR;
          const ey = Math.sin(arcStart + arcLen) * arcR;
          c.strokeStyle = `rgba(120, 180, 255, ${0.8 - i * 0.2})`;
          c.lineWidth = 1;
          c.beginPath();
          c.arc(ex, ey, 2, 0, Math.PI * 2);
          c.stroke();
          c.restore();
        }
      }

      // === LISTENING: Waveform rings ===
      if (state === "listening") {
        for (let ring = 0; ring < 3; ring++) {
          const waveR = ORB_RADIUS * (1.3 + ring * 0.3);
          c.save();
          c.translate(CX, CY);
          c.beginPath();
          const steps = 120;
          for (let j = 0; j <= steps; j++) {
            const angle = (j / steps) * Math.PI * 2;
            const wave = 6 * Math.sin(j * 8 + t * 6 + ring * 1.5);
            const r = waveR + wave;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            if (j === 0) c.moveTo(x, y);
            else c.lineTo(x, y);
          }
          c.closePath();
          c.strokeStyle = `rgba(0, 220, 255, ${0.35 - ring * 0.08})`;
          c.lineWidth = 1;
          c.setLineDash([]);
          c.stroke();
          c.restore();
        }

        if (Math.random() < 0.3) spawnParticle();
      }

      // === SPEAKING: Pulse rings ===
      if (state === "speaking") {
        for (let p = 0; p < 4; p++) {
          const phase = t * 4 - p * 0.5;
          const pulseFrac = ((phase % 1) + 1) % 1;
          const pulseR = ORB_RADIUS * (1.2 + pulseFrac * 1.2);
          const alpha = (1 - pulseFrac) * 0.4;
          c.save();
          c.translate(CX, CY);
          c.beginPath();
          c.arc(0, 0, pulseR, 0, Math.PI * 2);
          c.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
          c.lineWidth = 1.5;
          c.setLineDash([]);
          c.stroke();
          c.restore();
        }

        c.save();
        c.translate(CX, CY);
        c.beginPath();
        const sw = 100;
        for (let j = 0; j <= sw; j++) {
          const angle = (j / sw) * Math.PI * 2;
          const wave1 = 8 * Math.sin(j * 6 + t * 10);
          const wave2 = 4 * Math.sin(j * 11 + t * 14);
          const r = ORB_RADIUS * 1.15 + wave1 + wave2;
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;
          if (j === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.closePath();
        c.strokeStyle = "rgba(0, 220, 255, 0.5)";
        c.lineWidth = 1.5;
        c.setLineDash([]);
        c.stroke();
        c.restore();
      }

      // === PARTICLES ===
      particlesRef.current = particlesRef.current.filter(
        (p) => p.life < p.maxLife,
      );
      for (const p of particlesRef.current) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        const alpha = 1 - p.life / p.maxLife;
        c.save();
        c.fillStyle = `rgba(0, 200, 255, ${alpha * 0.8})`;
        c.shadowBlur = 4;
        c.shadowColor = "rgba(0, 200, 255, 0.6)";
        c.beginPath();
        c.arc(p.x, p.y, p.size * (1 - p.life / p.maxLife), 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // === CENTER INDICATOR DOT ===
      c.save();
      const dotAlpha = state === "idle" ? 0.4 + 0.2 * Math.sin(t * 2) : 0.9;
      c.fillStyle = `rgba(0, 230, 255, ${dotAlpha})`;
      c.shadowBlur = 8;
      c.shadowColor = "rgba(0, 230, 255, 0.8)";
      c.beginPath();
      c.arc(CX, CY, 3, 0, Math.PI * 2);
      c.fill();
      c.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      width={280}
      height={280}
      className="w-[220px] h-[220px] md:w-[280px] md:h-[280px]"
      data-ocid="orb.canvas_target"
      aria-label={`J.A.R.V.I.S. orb visualizer - state: ${state}`}
    />
  );
}
