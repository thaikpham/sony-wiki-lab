import type { PhotoboothDownloadRelease } from "./contracts";

export const photoboothRelease: PhotoboothDownloadRelease = {
  version: "0.9.2-preview",
  channel: "stable",
  windowsPackage: "SonyPhotoboothSetup-0.9.2-preview.exe",
  downloadUrl: "/downloads/SonyPhotoboothSetup-0.9.2-preview.exe",
  updatedAt: "2026-04-10T10:00:00.000Z",
  notes: [
    "Windows booth host preview bundled with Rust runtime skeleton.",
    "Sony Camera Remote SDK v2.01.00 Win64 expected on booth operator machine.",
    "Public share route and operator gallery are enabled for local host validation.",
  ],
};
