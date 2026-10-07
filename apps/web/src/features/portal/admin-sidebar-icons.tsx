import type { ReactNode } from "react";

type IconProps = { className?: string };

function BaseIcon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className ?? "h-[18px] w-[18px]"}>
      {children}
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 4.5h6.5v6.5H4.5zM13 4.5h6.5v4H13zM13 11h6.5v8.5H13zM4.5 13.5h6.5v6H4.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function ClinicsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4.5 20.5V5.5a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 20.5v-5h6v5M9 8.5h2M13 8.5h2M9 12h2M13 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function QuestionsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 18.2h.01M9.2 8.6a2.8 2.8 0 1 1 4.3 2.4c-.8.5-1.5 1.2-1.5 2.2V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
    </BaseIcon>
  );
}

export function RegisterClinicIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="4.5" y="4.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.6" />
    </BaseIcon>
  );
}

export function ScheduleIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function VisitsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4.5" y="5.5" width="15" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5v4M16 3.5v4M4.5 10.5h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function NoticesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6.5 16.5V10a5.5 5.5 0 1 1 11 0v6.5l1.4 2H5.1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function FavoritesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 19.2s-6.2-3.9-6.2-8.1A3.4 3.4 0 0 1 12 8.6a3.4 3.4 0 0 1 6.2 2.5c0 4.2-6.2 8.1-6.2 8.1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function ReviewsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5l1.8 3.7 4.1.6-3 2.9.7 4.1L12 13.8 8.4 15.8l.7-4.1-3-2.9 4.1-.6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </BaseIcon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.7 6.7l1.4 1.4M15.9 15.9l1.4 1.4M17.3 6.7l-1.4 1.4M8.1 15.9l-1.4 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </BaseIcon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </BaseIcon>
  );
}
