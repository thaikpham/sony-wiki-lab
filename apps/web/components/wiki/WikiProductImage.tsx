import Image from "next/image";

interface WikiProductImageProps {
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  src: string | null;
}

export default function WikiProductImage({
  alt,
  className = "",
  imageClassName = "object-cover",
  priority = false,
  sizes = "100vw",
  src,
}: WikiProductImageProps) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[var(--surface-alt)] text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)] ${className}`.trim()}
      >
        No image
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[var(--surface-alt)] ${className}`.trim()}>
      <Image
        alt={alt}
        className={imageClassName}
        fill
        priority={priority}
        sizes={sizes}
        src={src}
        unoptimized
      />
    </div>
  );
}
