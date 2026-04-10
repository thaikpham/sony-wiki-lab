export type PhotoboothSessionState =
  | "idle"
  | "ready"
  | "countdown"
  | "capturing"
  | "review"
  | "publishing"
  | "published"
  | "error";

export type CaptureBackend = "sdk-primary" | "fallback-hdmi" | "fallback-remote" | "fallback-usb-stream";

export type FileWatchStatus = "idle" | "watching" | "file-detected" | "timeout" | "error";

export type LiveViewStatus = "disconnected" | "connecting" | "streaming" | "error";

export type SdkBridgeStatus = "disconnected" | "connected" | "error";

export type FallbackCaptureMode = "hdmi" | "remote" | "usb-stream" | null;

export interface PhotoboothAsset {
  id: string;
  sessionId: string;
  fileName: string;
  imageUrl: string;
  thumbnailUrl: string;
  capturedAt: string;
  width: number;
  height: number;
  deliveryStatus: "local" | "synced";
}

export interface PhotoboothShareInfo {
  shareUrl: string;
  qrValue: string;
  publishedAt: string | null;
  status: "draft" | "published";
}

export interface PhotoboothSession {
  id: string;
  title: string;
  state: PhotoboothSessionState;
  createdAt: string;
  updatedAt: string;
  boothMode: "landscape" | "portrait";
  eventName: string;
  storagePath: string;
  operatorUnlocked: boolean;
  countdownSeconds: number;
  selectedAssetId: string;
  assets: PhotoboothAsset[];
  share: PhotoboothShareInfo;
  // New SDK tethered-folder fields
  captureBackend: CaptureBackend;
  sessionFolderPath: string;
  fileWatchStatus: FileWatchStatus;
  detectedFiles: string[];
  latestAssetFileName: string | null;
}

export interface PhotoboothCameraState {
  connected: boolean;
  model: string;
  transport: "USB-C" | "Ethernet";
  firmware: string;
  sdkVersion: string;
}

export interface PhotoboothOperatorSettings {
  aspectPreset: "landscape-3-2" | "portrait-2-3";
  saveDestination: "pc" | "pc-and-camera";
  shutterMode: "single";
  timerMode: "off" | "3s" | "5s";
  localHostUrl: string;
}

export interface PhotoboothStatus {
  runtime: "mock" | "local-host";
  camera: PhotoboothCameraState;
  currentSessionId: string | null;
  localStoragePath: string;
  operatorLocked: boolean;
  latestShareUrl: string | null;
  settings: PhotoboothOperatorSettings;
  // New SDK tethered-folder fields
  captureBackend: CaptureBackend;
  fallbackCaptureMode: FallbackCaptureMode;
  fileWatcherStatus: FileWatchStatus;
  fileWatcherRoot: string;
  fileArrivalTimeoutSeconds: number;
  liveViewStatus: LiveViewStatus;
  sdkBridgeStatus: SdkBridgeStatus;
  sdkVersion: string;
  bridgeVersion: string;
}

export interface PhotoboothCaptureCommand {
  sessionId: string;
  action: "start" | "capture" | "publish" | "reset";
}

export interface PhotoboothCaptureResult {
  sessionId: string;
  state: PhotoboothSessionState;
  asset: PhotoboothAsset | null;
  share: PhotoboothShareInfo | null;
}

export interface PhotoboothDownloadRelease {
  version: string;
  channel: "stable";
  windowsPackage: string;
  downloadUrl: string;
  updatedAt: string;
  notes: string[];
}

// Settings for SDK tethered-folder workflow
export interface PhotoboothSettings {
  localStorageRoot: string;  // e.g., "D:/PhotoboothCaptures"
  sessionFolderPattern: string;  // e.g., "{eventName}/{YYYY-MM-DD}/session-{id}"
  sdkCaptureMode: "primary" | "fallback-only";
  fallbackCaptureMode: FallbackCaptureMode;
  fileArrivalTimeoutSeconds: number;  // Default: 10
  enableLiveView: boolean;
  enableFileWatcher: boolean;
}

// WebSocket Event Types
export type PhotoboothEventType =
  | "capture_started"
  | "countdown_tick"
  | "shutter_triggered"
  | "file_detected"
  | "asset_registered"
  | "capture_failed"
  | "capture_timeout"
  | "state_changed"
  | "live_view_frame"
  | "camera_connected"
  | "camera_disconnected"
  | "error";

export interface PhotoboothEvent {
  type: PhotoboothEventType;
  timestamp: string;
  sessionId: string | null;
  payload: unknown;
}

// Session creation request
export interface CreateSessionRequest {
  eventName: string;
  boothMode: "landscape" | "portrait";
  countdownSeconds?: number;
}

// Capture request
export interface CaptureRequest {
  sessionId: string;
  useFallback?: boolean;
}

// File detection info
export interface FileDetectedPayload {
  fileName: string;
  filePath: string;
  fileSize: number;
  detectedAt: string;
}

// Asset registration info
export interface AssetRegisteredPayload {
  assetId: string;
  fileName: string;
  filePath: string;
  width: number;
  height: number;
  capturedAt: string;
}
