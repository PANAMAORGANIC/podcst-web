import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14 4h6v6" />
      <path d="M10 14 20 4" />
      <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
    </Svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function TranslateIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 5h8" />
      <path d="M8 5c0 6-4 9-4 9" />
      <path d="M12 5c-1.5 4-5 8-8 9" />
      <path d="m14 19 4-10 4 10" />
      <path d="M15.2 16h5.6" />
    </Svg>
  );
}

export function HeartIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M12 20s-7-4.4-9.3-8.2C.7 8.6 2.2 5 6 5c2 0 3.3 1.2 4 2.2C10.7 6.2 12 5 14 5c3.8 0 5.3 3.6 3.3 6.8C19 15.6 12 20 12 20z" />
    </Svg>
  );
}

export function BookmarkIcon({
  filled = false,
  ...props
}: IconProps & { filled?: boolean }) {
  return (
    <Svg {...props} fill={filled ? 'currentColor' : 'none'}>
      <path d="M6 4.5h12v16l-6-3.4-6 3.4v-16z" />
    </Svg>
  );
}

export function FeedIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12h12" />
      <path d="m12 6 6 6-6 6" />
      <path d="M20 5v14" />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <path d="M8 5.5v13l11-6.5-11-6.5z" />
    </Svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <Svg {...props} fill="currentColor" stroke="none">
      <path d="M7 5h3v14H7zM14 5h3v14h-3z" />
    </Svg>
  );
}

export function SkipBackIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M11 12 18 6v12z" />
      <path d="M6 6v12" />
    </Svg>
  );
}

export function SkipForwardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13 12 6 6v12z" />
      <path d="M18 6v12" />
    </Svg>
  );
}

export function QueueIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h10M4 17h10" />
      <path d="m15 14 5 3-5 3z" />
    </Svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 10v4h4l5 4V6l-5 4H5z" />
      <path d="M16 9.5a3 3 0 0 1 0 5" />
    </Svg>
  );
}

export function MuteIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 10v4h4l5 4V6l-5 4H5z" />
      <path d="m16 10 5 5M21 10l-5 5" />
    </Svg>
  );
}
