"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { toDataURL } from "qrcode";

interface PhotoboothQrCodeProps {
  value: string;
  size?: number;
}

export default function PhotoboothQrCode({
  value,
  size = 192,
}: PhotoboothQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let active = true;

    void toDataURL(value, {
      margin: 1,
      width: size,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    }).then((nextUrl: string) => {
      if (active) {
        setDataUrl(nextUrl);
      }
    });

    return () => {
      active = false;
    };
  }, [size, value]);

  return (
    <div className="rounded-[1.5rem] bg-white p-3 shadow-[0_24px_64px_rgba(0,0,0,0.08)]">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt="Photobooth QR code"
          className="h-auto w-full rounded-xl"
        />
      ) : (
        <div
          className="animate-pulse rounded-xl bg-[var(--surface-alt)]"
          style={{ width: size, height: size }}
        />
      )}
    </div>
  );
}
