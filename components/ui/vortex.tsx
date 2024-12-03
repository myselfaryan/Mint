import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";
import { createNoise3D } from "simplex-noise";
import { motion } from "framer-motion";

interface VortexProps {
  children?: any;
  className?: string;
  containerClassName?: string;
  particleCount?: number;
  rangeY?: number;
  baseHue?: number;
  rangeHue?: number;
  baseSpeed?: number;
  rangeSpeed?: number;
  baseRadius?: number;
  rangeRadius?: number;
  backgroundColor?: string;
}

export const Vortex = (props: VortexProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef(null);
  const particleCount = props.particleCount || 200;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = props.rangeY || 100;
  const baseTTL = 50;
  const rangeTTL = 150;
  const baseSpeed = props.baseSpeed || 0.1;
  const rangeSpeed = props.rangeSpeed || 1;
  const baseRadius = props.baseRadius || 1;
  const rangeRadius = props.rangeRadius || 4;
  const baseHue = props.baseHue || 120;
  const rangeHue = props.rangeHue || 60;
  const noiseSteps = 8;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;
  const backgroundColor = props.backgroundColor || "#000000";

  let tick = 0;
  const noise3D = createNoise3D();
  let particleProps = new Float32Array(particlePropsLength);
  let center: [number, number] = [0, 0];

  const HALF_PI: number = 0.5 * Math.PI;
  const TAU: number = 2 * Math.PI;
  const TO_RAD: number = Math.PI / 180;

  const rand = (n: number): number => n * Math.random();
  const randRange = (n: number): number => n - rand(2 * n);
  const fadeInOut = (t: number, m: number): number => {
    let hm = 0.5 * m;
    return Math.abs(((t + hm) % m) - hm) / hm;
  };
  const lerp = (n1: number, n2: number, speed: number): number =>
    (1 - speed) * n1 + speed * n2;

  const initParticle = (i: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let x, y, vx, vy, life, ttl, speed, radius, hue;

    x = rand(canvas.width);
    y = center[1] + randRange(rangeY);
    vx = 0;
    vy = 0;
    life = 0;
    ttl = baseTTL + rand(rangeTTL);
    speed = baseSpeed + rand(rangeSpeed);
    radius = baseRadius + rand(rangeRadius);
    hue = baseHue + rand(rangeHue);

    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  };

  const drawParticle = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    life: number,
    ttl: number,
    radius: number,
    hue: number,
    ctx: CanvasRenderingContext2D,
  ) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = radius;
    ctx.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl) * 0.75})`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      center = [canvas.width / 2, canvas.height / 2];
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    for (let i = 0; i < particleCount; i++) {
      initParticle(i * particlePropCount);
    }

    const animate = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particleCount; i++) {
        const index = i * particlePropCount;
        const x = particleProps[index];
        const y = particleProps[index + 1];
        const vx = particleProps[index + 2];
        const vy = particleProps[index + 3];
        const life = particleProps[index + 4];
        const ttl = particleProps[index + 5];
        const speed = particleProps[index + 6];
        const radius = particleProps[index + 7];
        const hue = particleProps[index + 8];

        const noiseX = noise3D(x * xOff, y * yOff, tick * zOff);
        const noiseY = noise3D(y * xOff, x * yOff, tick * zOff);
        const angle = Math.atan2(noiseY, noiseX);
        const vxNew = Math.cos(angle) * speed;
        const vyNew = Math.sin(angle) * speed;

        particleProps[index + 2] = lerp(vx, vxNew, 0.1);
        particleProps[index + 3] = lerp(vy, vyNew, 0.1);

        particleProps[index] += particleProps[index + 2];
        particleProps[index + 1] += particleProps[index + 3];

        if (particleProps[index] < 0) particleProps[index] = canvas.width;
        if (particleProps[index] > canvas.width) particleProps[index] = 0;
        if (particleProps[index + 1] < 0)
          particleProps[index + 1] = canvas.height;
        if (particleProps[index + 1] > canvas.height)
          particleProps[index + 1] = 0;

        particleProps[index + 4]++;

        if (particleProps[index + 4] > ttl) {
          initParticle(index);
        }

        drawParticle(x, y, x + vx * 2, y + vy * 2, life, ttl, radius, hue, ctx);
      }

      tick++;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [
    backgroundColor,
    particleCount,
    baseHue,
    rangeHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
  ]);

  return (
    <div className={cn("relative h-full w-full", props.containerClassName)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        ref={containerRef}
        className="absolute h-full w-full inset-0 z-0 bg-transparent flex items-center justify-center"
      >
        <canvas ref={canvasRef}></canvas>
      </motion.div>

      <div className={cn("relative z-10", props.className)}>
        {props.children}
      </div>
    </div>
  );
};
