"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  PhotoboothAsset,
  PhotoboothSession,
  PhotoboothStatus,
  PhotoboothEvent,
} from "@/lib/photobooth/contracts";
import { buildAbsoluteShareUrl, getSelectedAsset } from "@/lib/photobooth/helpers";
import { cn } from "@/lib/utils";
import PhotoboothStudioShell from "./PhotoboothStudioShell";
import {
  capture,
  resetSession,
  startLiveView,
  stopLiveView,
  createSession,
  type EventHandler,
} from "@/lib/photobooth/host-client";
import { usePhotoboothEvents } from "@/lib/photobooth/host-client-hooks";

type CaptureMode = PhotoboothSession["boothMode"];
type TimerMode = 0 | 3 | 5 | 10;
type CameraConnectionMode =
  | "imaging-edge-webcam"
  | "camera-remote"
  | "usb-live-stream";

const timerModes: TimerMode[] = [0, 3, 5, 10];
const cameraConnectionModes = [
  {
    id: "imaging-edge-webcam" as const,
    label: "Imaging Edge Webcam",
    shortLabel: "HDMI Camlink",
    hint: "Fallback screen capture via Sony Imaging Edge Webcam + HDMI Camlink",
    icon: "HD",
  },
  {
    id: "camera-remote" as const,
    label: "Sony Camera Remote",
    shortLabel: "Remote SDK",
    hint: "Fallback screen capture from Sony Camera Remote live preview",
    icon: "RC",
  },
  {
    id: "usb-live-stream" as const,
    label: "Sony USB Live Stream",
    shortLabel: "USB Stream",
    hint: "Fallback screen capture from Sony USB Live Stream feed",
    icon: "USB",
  },
];

interface PhotoboothCaptureExperienceProps {
  status: PhotoboothStatus;
  featuredSession: PhotoboothSession | null;
}

interface CaptureControlPanelProps {
  captureMode: CaptureMode;
  connectionMode: CameraConnectionMode;
  phase: PhotoboothSession["state"];
  sessionId: string;
  timerSeconds: TimerMode;
  publishedUrl: string;
  camera: PhotoboothStatus["camera"];
  runtime: PhotoboothStatus["runtime"];
  onModeChange: (mode: CaptureMode) => void;
  onConnectionModeChange: (mode: CameraConnectionMode) => void;
  onCycleTimer: () => void;
  onCapture: () => void;
  onPublish: () => void;
  onReset: () => void;
  className?: string;
}

interface CameraPreviewProps {
  captureMode: CaptureMode;
  connectionMode: CameraConnectionMode;
  selectedAsset: PhotoboothAsset | null;
  phase: PhotoboothSession["state"];
  countdown: number;
  className?: string;
}

interface AssetRailProps {
  captureMode: CaptureMode;
  assets: PhotoboothAsset[];
  sessionId: string;
  className?: string;
}

function CaptureControlPanel({
  captureMode,
  connectionMode,
  phase,
  sessionId,
  timerSeconds,
  publishedUrl,
  camera,
  runtime,
  onModeChange,
  onConnectionModeChange,
  onCycleTimer,
  onCapture,
  onPublish,
  onReset,
  className,
}: CaptureControlPanelProps) {
  const activeConnection =
    cameraConnectionModes.find((mode) => mode.id === connectionMode) ??
    cameraConnectionModes[0];
  const syncLabel =
    phase === "published"
      ? publishedUrl.replace(/^https?:\/\//, "")
      : `ready/${sessionId}`;

  return (
    <aside
      className={cn(
        "rounded-[1.4rem] border border-black/8 bg-white p-6 shadow-sm md:p-8",
        className
      )}
    >
      <div className="border-b border-black/6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-[var(--font-photobooth-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-black/72">
              Capture Hub
            </span>
            <p className="mt-1 font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.16em] text-black/34">
              {camera.connected ? "Camera online" : "Camera offline"} · {camera.model} · {activeConnection.shortLabel}
            </p>
          </div>
          <span className="font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.16em] text-black/34">
            Runtime {runtime}
          </span>
        </div>

        <div className="mt-4 inline-flex w-full rounded-full bg-[#f5f5f5] p-1 shadow-inner">
          {[
            ["landscape", "Landscape 3:2"],
            ["portrait", "Portrait 2:3"],
          ].map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => onModeChange(mode as CaptureMode)}
              className={cn(
                "flex-1 rounded-full px-4 py-3 font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] transition-colors",
                captureMode === mode
                  ? "bg-black text-white"
                  : "text-black/54 hover:bg-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-[1rem] border border-black/8 bg-[#f8f8f8] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[var(--font-photobooth-mono)] text-[8px] font-semibold uppercase tracking-[0.18em] text-black/44">
                Fallback Screen Capture
              </p>
              <p className="mt-1 font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.16em] text-black/34">
                {activeConnection.hint}
              </p>
            </div>
            <span className="rounded-full border border-black/8 bg-white px-2.5 py-1 font-[var(--font-photobooth-mono)] text-[8px] font-semibold uppercase tracking-[0.14em] text-black/56">
              {activeConnection.shortLabel}
            </span>
          </div>

          <div className="mt-3 grid gap-2">
            {cameraConnectionModes.map((mode) => {
              const isActive = connectionMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onConnectionModeChange(mode.id)}
                  className={cn(
                    "flex items-center justify-between rounded-[0.9rem] border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-black bg-black text-white"
                      : "border-black/8 bg-white text-black hover:bg-[#efefef]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-9 min-w-9 items-center justify-center rounded-full border font-[var(--font-photobooth-mono)] text-[9px] font-semibold uppercase tracking-[0.14em]",
                        isActive
                          ? "border-white/20 bg-white/10 text-white"
                          : "border-black/10 bg-[#f8f8f8] text-black/72"
                      )}
                    >
                      {mode.icon}
                    </span>
                    <div>
                      <div className="font-[var(--font-photobooth-headline)] text-[10px] font-black uppercase tracking-[0.14em]">
                        {mode.label}
                      </div>
                      <div
                        className={cn(
                          "mt-1 font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.14em]",
                          isActive ? "text-white/62" : "text-black/36"
                        )}
                      >
                        {mode.shortLabel}
                      </div>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full",
                      isActive ? "bg-emerald-400" : "bg-black/10"
                    )}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-[0.9rem] border border-dashed border-black/10 bg-white px-3 py-2">
            <p className="font-[var(--font-photobooth-mono)] text-[8px] font-semibold uppercase tracking-[0.16em] text-black/46">
              Primary capture remains Sony SDK shutter flow
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {[
          {
            key: "flip",
            label: "Flip View",
            hint: "Primary Lens",
            icon: "↺",
          },
          {
            key: "timer",
            label: "Timer",
            hint: `Timer ${timerSeconds}s Countdown`,
            icon: "◔",
            badge: `${timerSeconds}s`,
            onClick: onCycleTimer,
          },
        ].map((action) => (
          <button
            key={action.key}
            type="button"
            onClick={action.onClick}
            aria-label={action.hint}
            title={action.hint}
            className="group relative flex min-h-24 items-center justify-center rounded-[1rem] border border-black/8 bg-[#f8f8f8] px-4 py-4 text-left transition-colors hover:bg-black hover:text-white"
          >
            {action.badge ? (
              <span className="absolute right-3 top-3 rounded-full border border-black/10 bg-white px-2 py-1 font-[var(--font-photobooth-mono)] text-[8px] font-semibold uppercase tracking-[0.14em] text-black/54 transition-colors group-hover:border-white/10 group-hover:bg-black/10 group-hover:text-white/72">
                {action.badge}
              </span>
            ) : null}
            <span className="text-[28px] leading-none text-current">{action.icon}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-6">
        <button onClick={onCapture} className="group relative transition-transform active:scale-95">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-black/5 bg-white p-4 shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:h-44 md:w-44">
            <div className="flex h-full w-full items-center justify-center rounded-full border border-black/10 p-2.5">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-white shadow-[0_0_0_10px_rgba(0,0,0,0.03)] transition-colors group-hover:bg-zinc-800">
                <div className="h-14 w-14 rounded-full bg-black transition-transform group-hover:scale-95 md:h-16 md:w-16" />
              </div>
            </div>
          </div>
        </button>

        <div className="text-center">
          <div className="font-[var(--font-photobooth-headline)] text-[12px] font-black uppercase tracking-[0.4em] text-black">
            Execute Capture
          </div>
          <div className="mt-2 font-[var(--font-photobooth-mono)] text-[9px] uppercase tracking-[0.18em] text-black/34">
            Session.{sessionId.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-[1.15rem] border border-black/8 bg-[#f8f8f8] p-4">
        <div className="flex items-center justify-between">
          <span className="font-[var(--font-photobooth-mono)] text-[9px] font-bold uppercase tracking-[0.16em] text-black/72">
            Session Sync
          </span>
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              phase === "published" ? "bg-emerald-500" : "bg-blue-400"
            )}
          />
        </div>
        <p className="mt-3 truncate font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.16em] text-black/42">
          {syncLabel}
        </p>

        <div className="mt-4 grid gap-3">
          <button
            onClick={onPublish}
            className="w-full rounded-[0.95rem] bg-black px-4 py-3.5 font-[var(--font-photobooth-headline)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
          >
            Remote Link
          </button>
          <button
            onClick={onReset}
            className="w-full rounded-[0.95rem] bg-white px-4 py-3.5 font-[var(--font-photobooth-headline)] text-[10px] font-semibold uppercase tracking-[0.18em] text-black/72 transition-colors hover:bg-[#efefef]"
          >
            Reset Session
          </button>
        </div>
      </div>
    </aside>
  );
}

function CameraPreview({
  captureMode,
  connectionMode,
  selectedAsset,
  phase,
  countdown,
  className,
}: CameraPreviewProps) {
  const isLandscape = captureMode === "landscape";
  const activeConnection =
    cameraConnectionModes.find((mode) => mode.id === connectionMode) ??
    cameraConnectionModes[0];
  const wrapperClass = isLandscape
    ? "relative overflow-hidden rounded-[1.8rem] border-[6px] border-white bg-black shadow-[0_28px_80px_rgba(0,0,0,0.14)]"
    : "relative flex min-h-[820px] items-center justify-center overflow-hidden rounded-[1.8rem] border border-black/8 bg-white shadow-sm";
  const frameClass = isLandscape
    ? "aspect-[3/2] w-full"
    : "aspect-[2/3] h-[95%] max-h-[780px] max-w-full";

  return (
    <section className={cn(wrapperClass, className)}>
      <div
        className={cn(
          "relative bg-black shadow-[0_30px_80px_rgba(0,0,0,0.18)] ring-1 ring-white/10",
          frameClass
        )}
      >
        {selectedAsset ? (
          <img
            src={selectedAsset.imageUrl}
            alt={selectedAsset.fileName}
            className="h-full w-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.02]"
          />
        ) : null}

        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-16">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              style={{
                borderRight:
                  index % 3 !== 2
                    ? "1px solid rgba(255,255,255,0.14)"
                    : "none",
                borderBottom:
                  index < 6
                    ? "1px solid rgba(255,255,255,0.14)"
                    : "none",
              }}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-6 top-6 h-8 w-8 border-l-2 border-t-2 border-white/36" />
          <div className="absolute right-6 top-6 h-8 w-8 border-r-2 border-t-2 border-white/36" />
          <div className="absolute bottom-6 left-6 h-8 w-8 border-b-2 border-l-2 border-white/36" />
          <div className="absolute bottom-6 right-6 h-8 w-8 border-b-2 border-r-2 border-white/36" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.58),transparent_25%,transparent_75%,rgba(0,0,0,0.6))]" />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-8 text-white">
          <div className="flex gap-8 font-[var(--font-photobooth-headline)]">
            {[
              ["ISO", "400"],
              ["Shutter", "1/125S"],
              ["Input", activeConnection.shortLabel],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/48">
                  {label}
                </span>
                <span className="text-sm font-bold tracking-[0.08em] text-white">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-sm bg-red-600 px-3 py-2 text-white shadow-lg">
            <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.22em]">
              {phase === "capturing" ? "Capturing" : "Live Preview"}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-16 w-16 rounded-sm border border-white/20">
            <div className="absolute inset-x-0 top-0 mx-auto h-1 w-4 bg-white/62" />
            <div className="absolute inset-x-0 bottom-0 mx-auto h-1 w-4 bg-white/62" />
            <div className="absolute inset-y-0 left-0 my-auto h-4 w-1 bg-white/62" />
            <div className="absolute inset-y-0 right-0 my-auto h-4 w-1 bg-white/62" />
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8 text-white">
          <div className="flex items-center gap-4">
            <span className="rounded-sm border border-white/26 px-2 py-1 font-[var(--font-photobooth-mono)] text-[9px] font-semibold uppercase tracking-[0.18em]">
              {captureMode === "landscape" ? "3:2 Capture" : "2:3 Capture"}
            </span>
            <span className="rounded-sm border border-white/26 px-2 py-1 font-[var(--font-photobooth-mono)] text-[9px] font-semibold uppercase tracking-[0.18em]">
              {selectedAsset?.width ?? 5464} x {selectedAsset?.height ?? 8192}
            </span>
          </div>

          <div className="flex gap-3">
            {["Grid", "RAW"].map((item) => (
              <span
                key={item}
                className="flex h-10 w-10 items-center justify-center rounded border border-white/20 bg-white/10 font-[var(--font-photobooth-headline)] text-xs font-bold text-white backdrop-blur-md"
              >
                {item === "Grid" ? "⌗" : item}
              </span>
            ))}
          </div>
        </div>

        {phase === "countdown" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="font-[var(--font-photobooth-headline)] text-8xl font-bold text-white">
              {countdown}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AssetRail({
  captureMode,
  assets,
  sessionId,
  className,
}: AssetRailProps) {
  const isLandscape = captureMode === "landscape";
  const assetAspectClass = isLandscape ? "aspect-[3/2]" : "aspect-[2/3]";

  return (
    <section
      className={cn(
        "rounded-[1.8rem] border border-black/6 bg-white p-6 shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <div>
            <span className="block font-[var(--font-photobooth-headline)] text-[12px] font-black uppercase tracking-[0.3em] text-black">
              Roll ID: {sessionId.toUpperCase()}
            </span>
            <span className="mt-1 block font-[var(--font-photobooth-mono)] text-[9px] uppercase tracking-[0.18em] text-black/34">
              {assets.length} professional assets indexing...
            </span>
          </div>
          <div className="h-8 w-px bg-black/10" />
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.18em] text-black/34">
                Metadata
              </span>
              <span className="mt-1 text-[10px] font-bold text-black/76">EXIF_ON</span>
            </div>
            <div className="flex flex-col">
              <span className="font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.18em] text-black/34">
                Session Type
              </span>
              <span className="mt-1 text-[10px] font-bold text-black/76">TETHERED</span>
            </div>
          </div>
        </div>

        <Link
          href="/photobooth/gallery"
          className="rounded-full border border-black/8 px-5 py-2 font-[var(--font-photobooth-headline)] text-[10px] font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white"
        >
          Open Asset Browser
        </Link>
      </div>

      <div
        className={cn(
          "mt-6 gap-4",
          isLandscape
            ? "flex overflow-x-auto pb-4"
            : "grid max-h-[760px] overflow-y-auto pr-2 sm:grid-cols-2 xl:grid-cols-1"
        )}
      >
        {assets.map((asset, index) => (
          <article
            key={asset.id}
            className={cn(
              "group rounded-[1rem] border border-black/8 bg-[#f8f8f8] p-3",
              isLandscape ? "w-64 flex-none" : "w-full"
            )}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-[0.85rem] bg-black",
                assetAspectClass
              )}
            >
              <img
                src={asset.thumbnailUrl}
                alt={asset.fileName}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2 py-1 font-[var(--font-photobooth-mono)] text-[9px] uppercase tracking-[0.16em] text-white">
                {index + 1}
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 font-[var(--font-photobooth-mono)] text-[8px] font-bold uppercase tracking-[0.16em] text-black">
                {asset.deliveryStatus}
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
                <span className="mb-2 font-[var(--font-photobooth-mono)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {asset.fileName}
                </span>
                <div className="flex gap-2">
                  <button className="rounded-md bg-white/20 p-1.5 text-white hover:bg-white/40">
                    ◎
                  </button>
                  <button className="rounded-md bg-white/20 p-1.5 text-white hover:bg-white/40">
                    ★
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 pt-3 font-[var(--font-photobooth-mono)] text-[8px] uppercase tracking-[0.16em]">
              <span className="font-semibold text-black/78">
                FRM_{String(index + 1).padStart(3, "0")}
              </span>
              <span className="text-black/36">{asset.capturedAt.slice(11, 19)}</span>
            </div>
          </article>
        ))}

        <div
          className={cn(
            "flex items-center justify-center rounded-[1rem] border border-dashed border-black/12 bg-[#f8f8f8] text-black/28",
            assetAspectClass,
            isLandscape ? "w-28 flex-none" : "w-full"
          )}
        >
          +
        </div>
      </div>
    </section>
  );
}

interface PhotoboothCaptureExperienceContainerProps {
  initialStatus: PhotoboothStatus;
  initialSession: PhotoboothSession | null;
}

// New container component with real-time integration
export function PhotoboothCaptureExperienceContainer({
  initialStatus,
  initialSession,
}: PhotoboothCaptureExperienceContainerProps) {
  const [sessionId, setSessionId] = useState<string | null>(initialSession?.id ?? null);
  const [session, setSession] = useState<PhotoboothSession | null>(initialSession);
  const [status, setStatus] = useState<PhotoboothStatus>(initialStatus);
  const [createError, setCreateError] = useState<string | null>(null);

  // Handle incoming events from WebSocket
  const handleEvent: EventHandler = useCallback((event: PhotoboothEvent) => {
    console.log("[Photobooth] Event received:", event);

    switch (event.type) {
      case "state_changed":
        if (event.sessionId === sessionId && event.payload) {
          const payload = event.payload as { new_state: string };
          setSession((prev) => {
            if (!prev) {
              return null;
            }

            return {
              ...prev,
              state: payload.new_state as PhotoboothSession["state"],
            };
          });
        }
        break;

      case "countdown_tick":
        // Countdown handled by local timer, but could sync here
        break;

      case "file_detected":
        if (event.sessionId === sessionId && event.payload) {
          const payload = event.payload as {
            file_name: string;
            file_path: string;
            file_size: number;
          };
          setSession((prev) => {
            if (!prev) {
              return null;
            }

            return {
              ...prev,
              detectedFiles: [...prev.detectedFiles, payload.file_name],
              latestAssetFileName: payload.file_name,
              fileWatchStatus: "file-detected",
            };
          });
        }
        break;

      case "asset_registered":
        if (event.sessionId === sessionId && event.payload) {
          const payload = event.payload as PhotoboothAsset;
          setSession((prev) => {
            if (!prev) {
              return null;
            }

            return {
              ...prev,
              assets: [...prev.assets, payload],
              selectedAssetId: payload.id,
            };
          });
        }
        break;

      case "capture_failed":
        if (event.sessionId === sessionId) {
          setSession((prev) => {
            if (!prev) {
              return null;
            }

            return {
              ...prev,
              state: "error",
            };
          });
        }
        break;

      case "capture_timeout":
        if (event.sessionId === sessionId) {
          setSession((prev) => {
            if (!prev) {
              return null;
            }

            return {
              ...prev,
              fileWatchStatus: "timeout",
            };
          });
        }
        break;

      case "camera_connected":
        setStatus((prev) => ({
          ...prev,
          camera: { ...prev.camera, connected: true },
          sdkBridgeStatus: "connected",
        }));
        break;

      case "camera_disconnected":
        setStatus((prev) => ({
          ...prev,
          camera: { ...prev.camera, connected: false },
          sdkBridgeStatus: "disconnected",
        }));
        break;
    }
  }, [sessionId]);

  // Connect to event stream
  const { isConnected: isEventConnected } = usePhotoboothEvents(handleEvent);
  const isConnecting = status.runtime === "local-host" && !isEventConnected;

  // Start live view when camera is connected and live view is available
  useEffect(() => {
    if (session && status.camera.connected && status.liveViewStatus === "streaming") {
      startLiveView((frameData) => {
        // Handle live view frame - would update a canvas or image element
        console.log("[Photobooth] Live view frame received:", frameData.byteLength, "bytes");
      });

      return () => {
        stopLiveView();
      };
    }
  }, [session, status.camera.connected, status.liveViewStatus]);

  const handleCreateSession = useCallback(async () => {
    setCreateError(null);

    const nextMode =
      status.settings.aspectPreset === "portrait-2-3" ? "portrait" : "landscape";

    const nextSession = await createSession({
      eventName: "Sony Booth Runtime",
      boothMode: nextMode,
      countdownSeconds: 3,
    });

    if (!nextSession) {
      setCreateError("Unable to create a session from booth host.");
      return;
    }

    setSessionId(nextSession.id);
    setSession(nextSession);
    setStatus((prev) => ({
      ...prev,
      currentSessionId: nextSession.id,
    }));
  }, [status.settings.aspectPreset]);

  if (!session) {
    return (
      <PhotoboothStudioShell activePath="/photobooth/capture">
        <section className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-sm lg:p-10">
          <p className="font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.22em] text-black/48">
            Capture Workspace Ready
          </p>
          <h1 className="mt-4 font-[var(--font-photobooth-headline)] text-4xl font-semibold tracking-[-0.05em] text-[#111111] lg:text-6xl">
            Booth host đang online nhưng chưa có session hoạt động.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-black/58">
            Tạo session mới để mở capture workspace thật, đồng thời kích hoạt watched folder và pipeline review/share cho booth runtime local.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCreateSession}
              className="rounded-full bg-black px-5 py-3 font-[var(--font-photobooth-headline)] text-[10px] font-semibold uppercase tracking-[0.18em] text-white"
            >
              Start New Session
            </button>
            <span className="rounded-full border border-black/8 bg-[#f6f6f6] px-4 py-3 font-[var(--font-photobooth-mono)] text-[10px] uppercase tracking-[0.18em] text-black/56">
              Preferred mode {status.settings.aspectPreset}
            </span>
          </div>

          {createError ? (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {createError}
            </div>
          ) : null}
        </section>
      </PhotoboothStudioShell>
    );
  }

  return (
    <PhotoboothCaptureExperience
      status={status}
      featuredSession={session}
      isConnecting={isConnecting}
      onSessionUpdate={setSession}
    />
  );
}

export default function PhotoboothCaptureExperience({
  featuredSession,
  ...props
}: PhotoboothCaptureExperienceProps & {
  isConnecting?: boolean;
  onSessionUpdate?: (session: PhotoboothSession) => void;
}) {
  if (!featuredSession) {
    return null;
  }

  return <PhotoboothCaptureWorkspace {...props} featuredSession={featuredSession} />;
}

function PhotoboothCaptureWorkspace({
  status,
  featuredSession,
  isConnecting = false,
  onSessionUpdate,
}: {
  status: PhotoboothStatus;
  featuredSession: PhotoboothSession;
  isConnecting?: boolean;
  onSessionUpdate?: (session: PhotoboothSession) => void;
}) {
  const initialTimerMode = timerModes.includes(featuredSession.countdownSeconds as TimerMode)
    ? (featuredSession.countdownSeconds as TimerMode)
    : 5;
  const [captureMode, setCaptureMode] = useState<CaptureMode>(featuredSession.boothMode);
  const [connectionMode, setConnectionMode] = useState<CameraConnectionMode>("camera-remote");
  const [phase, setPhase] = useState(featuredSession.state);
  const [timerSeconds, setTimerSeconds] = useState<TimerMode>(initialTimerMode);
  const [countdown, setCountdown] = useState<number>(initialTimerMode);
  const [publishedUrl, setPublishedUrl] = useState(
    featuredSession.share.status === "published"
      ? featuredSession.share.shareUrl
      : buildAbsoluteShareUrl(featuredSession.id)
  );
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Sync phase with session state from server
  useEffect(() => {
    if (featuredSession.state !== phase) {
      setPhase(featuredSession.state);
    }
  }, [featuredSession.state, phase]);

  const selectedAsset = useMemo(() => getSelectedAsset(featuredSession), [featuredSession]);
  const isLandscape = captureMode === "landscape";
  const workspaceClass = cn(
    "mx-auto grid w-full max-w-[1800px] gap-8",
    isLandscape
      ? "xl:grid-cols-[minmax(0,1fr)_320px]"
      : "xl:grid-cols-[220px_minmax(0,1fr)_320px]"
  );

  // Local countdown timer
  useEffect(() => {
    if (phase !== "countdown") {
      return;
    }

    if (countdown <= 0) {
      const timer = window.setTimeout(() => {
        // Server will transition to capturing, we just sync
      }, 180);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [countdown, phase]);

  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    setCaptureError(null);
    setCountdown(timerSeconds);

    startTransition(() => {
      setPhase("countdown");
    });

    try {
      const updatedSession = await capture(featuredSession.id);

      if (updatedSession) {
        onSessionUpdate?.(updatedSession);
      } else {
        setCaptureError("Failed to trigger capture");
      }
    } catch (error) {
      console.error("[Photobooth] Capture failed:", error);
      setCaptureError(error instanceof Error ? error.message : "Capture failed");
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, timerSeconds, featuredSession.id, onSessionUpdate]);

  const handlePublish = useCallback(() => {
    startTransition(() => {
      setPublishedUrl(buildAbsoluteShareUrl(featuredSession.id, window.location.origin));
      setPhase("published");
    });
  }, [featuredSession.id]);

  const handleReset = useCallback(async () => {
    try {
      const updatedSession = await resetSession(featuredSession.id);

      if (updatedSession) {
        onSessionUpdate?.(updatedSession);
      }
    } catch (error) {
      console.error("[Photobooth] Reset failed:", error);
    }

    startTransition(() => {
      setPhase("idle");
      setCountdown(timerSeconds);
      setCaptureError(null);
    });
  }, [featuredSession.id, timerSeconds, onSessionUpdate]);

  const handleCycleTimer = useCallback(() => {
    setTimerSeconds((current): TimerMode => {
      const nextIndex = (timerModes.indexOf(current) + 1) % timerModes.length;
      return timerModes[nextIndex] ?? 0;
    });
  }, []);

  return (
    <PhotoboothStudioShell activePath="/photobooth/capture">
      {/* Connection Status Banner */}
      {isConnecting && (
        <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          <span className="mr-2 inline-block h-3 w-3 animate-pulse rounded-full bg-yellow-500" />
          Connecting to booth host...
        </div>
      )}

      {/* Capture Error Banner */}
      {captureError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <span className="mr-2">⚠️</span>
          {captureError}
        </div>
      )}

      {/* SDK Status */}
      <div className="mb-4 flex items-center gap-4 text-xs text-black/60">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.sdkBridgeStatus === "connected" ? "bg-green-500" : "bg-red-400"
            )}
          />
          SDK: {status.sdkBridgeStatus}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.fileWatcherStatus === "watching" || status.fileWatcherStatus === "file-detected"
                ? "bg-green-500"
                : "bg-gray-400"
            )}
          />
          File Watcher: {status.fileWatcherStatus}
        </span>
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status.liveViewStatus === "streaming" ? "bg-green-500" : "bg-gray-400"
            )}
          />
          Live View: {status.liveViewStatus}
        </span>
      </div>

      <div className="space-y-8">
        <section className={workspaceClass}>
          <AssetRail
            captureMode={captureMode}
            assets={featuredSession.assets}
            sessionId={featuredSession.id}
            className={cn(isLandscape ? "order-3 xl:col-span-2" : "order-1")}
          />

          <CameraPreview
            captureMode={captureMode}
            connectionMode={connectionMode}
            selectedAsset={selectedAsset}
            phase={phase}
            countdown={countdown}
            className={cn(isLandscape ? "order-1" : "order-2")}
          />

          <CaptureControlPanel
            captureMode={captureMode}
            connectionMode={connectionMode}
            phase={phase}
            sessionId={featuredSession.id}
            timerSeconds={timerSeconds}
            publishedUrl={publishedUrl}
            camera={status.camera}
            runtime={status.runtime}
            onModeChange={setCaptureMode}
            onConnectionModeChange={setConnectionMode}
            onCycleTimer={handleCycleTimer}
            onCapture={handleCapture}
            onPublish={handlePublish}
            onReset={handleReset}
            className={cn(isLandscape ? "order-2 self-start" : "order-3 h-full")}
          />
        </section>
      </div>
    </PhotoboothStudioShell>
  );
}
