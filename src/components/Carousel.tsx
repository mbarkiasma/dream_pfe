'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, PanInfo, useMotionValue } from 'motion/react';
import React, { JSX } from 'react';

export interface CarouselItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg?: string;
  softBg?: string;
  bubble?: string;
}

export interface CarouselProps {
  items?: CarouselItem[];
  baseWidth?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  round?: boolean;
}

const DEFAULT_ITEMS: CarouselItem[] = [
  {
    id: 1,
    title: 'Text Animations',
    description: 'Cool text animations for your projects.',
    icon: '💠',
    iconBg: 'from-[#d7c0ff] to-[#b79ef6]',
    softBg: 'bg-[#faf5ff]',
    bubble: 'bg-[#efe5ff]'
  },
  {
    id: 2,
    title: 'Animations',
    description: 'Smooth animations for your projects.',
    icon: '✨',
    iconBg: 'from-[#c9b5ff] to-[#9f8df3]',
    softBg: 'bg-[#faf7ff]',
    bubble: 'bg-[#f2eaff]'
  },
  {
    id: 3,
    title: 'Components',
    description: 'Reusable components for your projects.',
    icon: '🧱',
    iconBg: 'from-[#f6c59f] to-[#eeb1c7]',
    softBg: 'bg-[#fff7f1]',
    bubble: 'bg-[#fff1e6]'
  },
  {
    id: 4,
    title: 'Backgrounds',
    description: 'Beautiful backgrounds and patterns for your projects.',
    icon: '🌌',
    iconBg: 'from-[#cebaff] to-[#b79ef6]',
    softBg: 'bg-[#faf7ff]',
    bubble: 'bg-[#f1ebff]'
  }
];

const DRAG_BUFFER = 0;
const VELOCITY_THRESHOLD = 500;
const GAP = 16;
const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };

interface CarouselItemProps {
  item: CarouselItem;
  index: number;
  itemWidth: number;
  round: boolean;
  x: any;
  transition: any;
}

function CarouselItem({ item, itemWidth, round, x, transition }: CarouselItemProps) {
  return (
    <motion.div
      className={`relative shrink-0 flex flex-col overflow-hidden ${
        round
          ? 'items-center justify-center text-center bg-[#060010] border-0'
          : 'items-stretch'
      } cursor-grab active:cursor-grabbing`}
      style={{
        width: itemWidth,
        height: '100%',
        rotateY: round ? 0 : 0
      }}
      transition={transition}
    >
      <div className={`relative overflow-hidden rounded-[28px] border border-white/60 ${item.softBg ?? 'bg-white'} shadow-[0_18px_45px_rgba(131,110,181,0.12)] backdrop-blur-[10px]`}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-white/15 via-white/0 to-white/15" />
          <div className="absolute right-0 top-2 h-20 w-20 rounded-full bg-white/30 blur-2xl" />
          <div className="absolute left-4 top-10 h-10 w-24 rounded-full bg-[#f0e4ff]/50 blur-xl" />
          <div className={`absolute -right-8 -bottom-8 h-28 w-28 rounded-full ${item.bubble ?? 'bg-[#efe5ff]'} blur-2xl`} />
        </div>

        <div className={`relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${item.iconBg ?? 'from-[#d7c0ff] to-[#b79ef6]'} text-4xl shadow-md m-6`}>
          <span>{item.icon}</span>
        </div>

        <div className="p-6 pt-0">
          <h3 className="text-2xl font-semibold text-[#4d2d7b]">{item.title}</h3>
          <p className="mt-4 text-[15px] leading-7 text-[#7f6b9f]">{item.description}</p>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-[#8d76b7] opacity-80">
            <span>Découvrir</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Carousel({
  items = DEFAULT_ITEMS,
  baseWidth = 300,
  autoplay = false,
  autoplayDelay = 3000,
  pauseOnHover = false,
  loop = false,
  round = false
}: CarouselProps): JSX.Element {
  const itemWidth = baseWidth;
  const [position, setPosition] = useState<number>(0);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pauseOnHover && containerRef.current) {
      const container = containerRef.current;
      const handleMouseEnter = () => setIsHovered(true);
      const handleMouseLeave = () => setIsHovered(false);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
      return () => {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [pauseOnHover]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return undefined;
    if (pauseOnHover && isHovered) return undefined;

    const timer = setInterval(() => {
      setPosition(prev => Math.min(prev + 1, items.length - 1));
    }, autoplayDelay);

    return () => clearInterval(timer);
  }, [autoplay, autoplayDelay, isHovered, pauseOnHover, items.length]);

  useEffect(() => {
    x.set(-position * (itemWidth + GAP));
  }, [position, itemWidth]);

  const effectiveTransition = SPRING_OPTIONS;

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void => {
    const { offset, velocity } = info;
    const direction =
      offset.x < -DRAG_BUFFER || velocity.x < -VELOCITY_THRESHOLD
        ? 1
        : offset.x > DRAG_BUFFER || velocity.x > VELOCITY_THRESHOLD
          ? -1
          : 0;

    if (direction === 0) return;

    setPosition(prev => {
      const next = prev + direction;
      return Math.max(0, Math.min(next, items.length - 1));
    });
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${round ? 'rounded-full border border-white' : 'rounded-[32px] border border-white/20'} p-4 bg-gradient-to-br from-[#f9f5ff] via-[#faf4ff] to-[#f4efff] shadow-[0_30px_80px_rgba(102,82,180,0.12)]`}
      style={{ width: `${baseWidth + 22}px` }}
    >
      <motion.div
        className="flex items-stretch"
        drag={isAnimating ? false : 'x'}
        dragConstraints={{ left: -((items.length - 1) * (itemWidth + GAP)), right: 0 }}
        onDragEnd={handleDragEnd}
        style={{ x, gap: `${GAP}px` }}
        animate={{ x: -(position * (itemWidth + GAP)) }}
        transition={effectiveTransition}
        onAnimationStart={() => setIsAnimating(true)}
        onAnimationComplete={() => setIsAnimating(false)}
      >
        {items.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            index={index}
            itemWidth={itemWidth}
            round={round}
            x={x}
            transition={effectiveTransition}
          />
        ))}
      </motion.div>
      <div className="mt-6 flex justify-center gap-3">
        {items.map((_, index) => (
          <motion.button
            type="button"
            key={index}
            className={`h-2 w-2 rounded-full ${position === index ? 'bg-[#4d2d7b]' : 'bg-[rgba(77,45,123,0.25)]'}`}
            onClick={() => setPosition(index)}
            animate={{ scale: position === index ? 1.2 : 1 }}
            transition={{ duration: 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
