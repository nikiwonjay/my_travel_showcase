import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Travel } from '../types/travel';

interface TravelGlobeProps {
  travels: Travel[];
  selectedId: string | null;
  onSelect: (travel: Travel) => void;
}

interface GlobePoint {
  travel: Travel;
  x: number;
  y: number;
  visible: boolean;
}

const ROTATION_STEP = 0.45;
const RESUME_DELAY = 1500;

function normalizeDeg(deg: number) {
  if (deg > 180) return deg - 360;
  if (deg < -180) return deg + 360;
  return deg;
}

function projectPoint(travel: Travel, rotationDeg: number): GlobePoint {
  const lat = (travel.destination.lat * Math.PI) / 180;
  const lng = ((travel.destination.lng + rotationDeg) * Math.PI) / 180;
  const x = Math.cos(lat) * Math.sin(lng);
  const y = -Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lng);

  return {
    travel,
    x,
    y,
    visible: z > -0.08,
  };
}

function renderLandSet(prefix: string) {
  return (
    <>
      <span className={`land ${prefix}-1`} />
      <span className={`land ${prefix}-2`} />
      <span className={`land ${prefix}-3`} />
      <span className={`land ${prefix}-4`} />
      <span className={`land ${prefix}-5`} />
    </>
  );
}

export default function TravelGlobe({ travels, selectedId, onSelect }: TravelGlobeProps) {
  const [rotationDeg, setRotationDeg] = useState(() =>
    travels[0] ? normalizeDeg(-travels[0].destination.lng) : 0,
  );
  const [hoveredTravelId, setHoveredTravelId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const dragStartX = useRef(0);
  const dragStartRotation = useRef(0);
  const resumeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setRotationDeg((current) => normalizeDeg(current + ROTATION_STEP));
    }, 40);
    return () => window.clearInterval(timer);
  }, [isPaused]);

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setIsPaused(false);
    }, RESUME_DELAY);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.travel-dot')) return;
    setIsDragging(true);
    setIsPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    dragStartX.current = e.clientX;
    dragStartRotation.current = rotationDeg;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotationDeg]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX.current;
    const degreesPerPx = 0.4;
    setRotationDeg(normalizeDeg(dragStartRotation.current + dx * degreesPerPx));
  }, [isDragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    scheduleResume();
  }, [isDragging, scheduleResume]);

  const points = useMemo(
    () => travels.map((travel) => projectPoint(travel, rotationDeg)),
    [travels, rotationDeg],
  );

  return (
    <div className="hero-stage h-full w-full">
      <div className="hero-orbit-glow" aria-hidden />

      <motion.div
        className="hero-scene"
        animate={{ rotate: [-3, 2, -3], y: [0, -4, 0] }}
        transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="globe-axis" aria-hidden />
        <div className="globe-base" aria-hidden />

        <div
          className="hero-earth-shell"
          aria-label="旅行地球仪"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div className="hero-earth">
            <div
              className="hero-earth-map"
              style={{ transform: `translateX(${(-rotationDeg / 360) * 50}%)` }}
            >
              <div className="hero-earth-strip">
                {renderLandSet('set-a')}
                {renderLandSet('set-b')}
              </div>
              <div className="hero-earth-strip">
                {renderLandSet('set-a')}
                {renderLandSet('set-b')}
              </div>
            </div>

            <div className="hero-earth-grid" aria-hidden />
            <div className="hero-earth-shade" aria-hidden />

            {points.map((point) => {
              if (!point.visible) return null;
              const isSelected = selectedId === point.travel.id;
              const isHovered = hoveredTravelId === point.travel.id;

              return (
                <button
                  key={point.travel.id}
                  type="button"
                  className="travel-dot"
                  onClick={() => onSelect(point.travel)}
                  onMouseEnter={() => {
                    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
                    setIsPaused(true);
                    setHoveredTravelId(point.travel.id);
                  }}
                  onMouseLeave={() => {
                    setHoveredTravelId((current) =>
                      current === point.travel.id ? null : current,
                    );
                    scheduleResume();
                  }}
                  style={{
                    left: `calc(50% + ${point.x * 34}%)`,
                    top: `calc(50% + ${point.y * 34}%)`,
                    transform: `translate(-50%, -50%) scale(${isSelected ? 1.12 : 1})`,
                  }}
                  aria-label={`打开 ${point.travel.country} ${point.travel.city}`}
                >
                  <span className="travel-dot-core" />
                  <span className="travel-dot-ring" />
                  {isHovered && (
                    <div className="travel-tooltip">
                      <strong>{point.travel.country}</strong>
                      <span>{point.travel.city}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
