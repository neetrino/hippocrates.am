import Image from "next/image";

type PatientAvatarProps = {
  name: string;
  photoUrl?: string | null;
  className?: string;
};

export function PatientAvatar({ name, photoUrl, className = "h-10 w-10 text-sm" }: PatientAvatarProps) {
  if (photoUrl) {
    return (
      <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
        <Image src={photoUrl} alt="" fill sizes="64px" className="object-cover" />
      </span>
    );
  }
  const letter = Array.from(name.trim())[0] ?? "";
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-accent-soft font-bold text-accent ${className}`}
      aria-hidden="true"
    >
      {letter}
    </span>
  );
}
