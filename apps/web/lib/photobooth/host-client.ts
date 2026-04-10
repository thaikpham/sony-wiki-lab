import { buildPhotoboothShareInfo } from "./helpers";
import { photoboothRelease } from "./release-manifest";
import type {
  CaptureBackend,
  CaptureRequest,
  CreateSessionRequest,
  FileWatchStatus,
  FallbackCaptureMode,
  LiveViewStatus,
  PhotoboothDownloadRelease,
  PhotoboothEvent,
  PhotoboothSession,
  PhotoboothShareInfo,
  PhotoboothStatus,
  SdkBridgeStatus,
} from "./contracts";

const LOCAL_HOST_URL =
  process.env.NEXT_PUBLIC_PHOTOBOOTH_HOST_URL ?? "http://127.0.0.1:3333";

const LOCAL_WS_URL = LOCAL_HOST_URL.replace(/^http/, "ws");

export type HostFetchState = "ok" | "unavailable" | "not-found";

export interface HostFetchResult<T> {
  state: HostFetchState;
  data: T | null;
  statusCode: number | null;
}

interface HostAssetResponse {
  id: string;
  file_name: string;
  file_path: string;
  width: number;
  height: number;
  file_size: number;
  captured_at: string;
}

interface HostSessionResponse {
  id: string;
  title: string;
  state: string;
  created_at: string;
  updated_at: string;
  booth_mode: "landscape" | "portrait";
  event_name: string;
  storage_path: string;
  countdown_seconds: number;
  selected_asset_id: string | null;
  assets: HostAssetResponse[];
  capture_backend: "sdk_primary" | "fallback_hdmi" | "fallback_remote" | "fallback_usb_stream";
  session_folder_path: string;
  file_watch_status: "idle" | "watching" | "file_detected" | "timeout" | "error";
  detected_files: string[];
  latest_asset_file_name: string | null;
  error_message: string | null;
}

interface HostStatusResponse {
  runtime: "local-host";
  camera: {
    connected: boolean;
    model: string;
    transport: "USB-C" | "Ethernet" | string;
    firmware: string;
    sdk_version: string;
  };
  current_session_id: string | null;
  local_storage_path: string;
  operator_locked: boolean;
  latest_share_url: string | null;
  settings: {
    aspect_preset: "landscape-3-2" | "portrait-2-3";
    save_destination: "pc" | "pc-and-camera" | string;
    shutter_mode: "single" | string;
    timer_mode: "off" | "3s" | "5s" | string;
    local_host_url: string;
  };
  capture_backend: string;
  fallback_capture_mode: string | null;
  file_watcher_status: string;
  file_watcher_root: string;
  file_arrival_timeout_seconds: number;
  live_view_status: string;
  sdk_bridge_status: string;
  sdk_version: string;
  bridge_version: string;
}

// ============================================================================
// HTTP helpers
// ============================================================================

async function getJson<T>(path: string): Promise<HostFetchResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(`${LOCAL_HOST_URL}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (response.status === 404) {
      return { state: "not-found", data: null, statusCode: response.status };
    }

    if (!response.ok) {
      return { state: "unavailable", data: null, statusCode: response.status };
    }

    return {
      state: "ok",
      data: (await response.json()) as T,
      statusCode: response.status,
    };
  } catch {
    return { state: "unavailable", data: null, statusCode: null };
  } finally {
    clearTimeout(timeout);
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${LOCAL_HOST_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function patchJson<T>(path: string, body: unknown): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${LOCAL_HOST_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function toCaptureBackend(value: string): CaptureBackend {
  switch (value) {
    case "fallback_hdmi":
    case "fallback-hdmi":
      return "fallback-hdmi";
    case "fallback_remote":
    case "fallback-remote":
      return "fallback-remote";
    case "fallback_usb_stream":
    case "fallback-usb-stream":
      return "fallback-usb-stream";
    default:
      return "sdk-primary";
  }
}

function toFallbackCaptureMode(value: string | null): FallbackCaptureMode {
  switch (value) {
    case "hdmi":
      return "hdmi";
    case "remote":
      return "remote";
    case "usb-stream":
      return "usb-stream";
    default:
      return null;
  }
}

function toFileWatchStatus(value: string): FileWatchStatus {
  switch (value) {
    case "watching":
      return "watching";
    case "file_detected":
    case "file-detected":
      return "file-detected";
    case "timeout":
      return "timeout";
    case "error":
      return "error";
    default:
      return "idle";
  }
}

function toLiveViewStatus(value: string): LiveViewStatus {
  switch (value) {
    case "connecting":
      return "connecting";
    case "streaming":
      return "streaming";
    case "error":
      return "error";
    default:
      return "disconnected";
  }
}

function toSdkBridgeStatus(value: string): SdkBridgeStatus {
  switch (value) {
    case "connected":
      return "connected";
    case "error":
      return "error";
    default:
      return "disconnected";
  }
}

function buildHostAssetUrl(sessionId: string, assetId: string): string {
  return `${LOCAL_HOST_URL}/sessions/${sessionId}/assets/${assetId}`;
}

function normalizeShareInfo(session: HostSessionResponse): PhotoboothShareInfo {
  return buildPhotoboothShareInfo(
    session.id,
    session.state === "published" ? session.updated_at : null
  );
}

function normalizeSession(raw: HostSessionResponse): PhotoboothSession {
  return {
    id: raw.id,
    title: raw.title,
    state: raw.state as PhotoboothSession["state"],
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    boothMode: raw.booth_mode,
    eventName: raw.event_name,
    storagePath: raw.storage_path,
    operatorUnlocked: raw.state === "review" || raw.state === "published",
    countdownSeconds: raw.countdown_seconds,
    selectedAssetId: raw.selected_asset_id ?? "",
    assets: raw.assets.map((asset) => ({
      id: asset.id,
      sessionId: raw.id,
      fileName: asset.file_name,
      imageUrl: buildHostAssetUrl(raw.id, asset.id),
      thumbnailUrl: buildHostAssetUrl(raw.id, asset.id),
      capturedAt: asset.captured_at,
      width: asset.width,
      height: asset.height,
      deliveryStatus: raw.state === "published" ? "synced" : "local",
    })),
    share: normalizeShareInfo(raw),
    captureBackend: toCaptureBackend(raw.capture_backend),
    sessionFolderPath: raw.session_folder_path,
    fileWatchStatus: toFileWatchStatus(raw.file_watch_status),
    detectedFiles: raw.detected_files,
    latestAssetFileName: raw.latest_asset_file_name,
  };
}

function normalizeStatus(raw: HostStatusResponse): PhotoboothStatus {
  return {
    runtime: raw.runtime,
    camera: {
      connected: raw.camera.connected,
      model: raw.camera.model,
      transport: raw.camera.transport === "Ethernet" ? "Ethernet" : "USB-C",
      firmware: raw.camera.firmware,
      sdkVersion: raw.camera.sdk_version,
    },
    currentSessionId: raw.current_session_id,
    localStoragePath: raw.local_storage_path,
    operatorLocked: raw.operator_locked,
    latestShareUrl: raw.latest_share_url,
    settings: {
      aspectPreset: raw.settings.aspect_preset,
      saveDestination: raw.settings.save_destination === "pc-and-camera" ? "pc-and-camera" : "pc",
      shutterMode: "single",
      timerMode: raw.settings.timer_mode === "5s" ? "5s" : raw.settings.timer_mode === "3s" ? "3s" : "off",
      localHostUrl: raw.settings.local_host_url,
    },
    captureBackend: toCaptureBackend(raw.capture_backend),
    fallbackCaptureMode: toFallbackCaptureMode(raw.fallback_capture_mode),
    fileWatcherStatus: toFileWatchStatus(raw.file_watcher_status),
    fileWatcherRoot: raw.file_watcher_root,
    fileArrivalTimeoutSeconds: raw.file_arrival_timeout_seconds,
    liveViewStatus: toLiveViewStatus(raw.live_view_status),
    sdkBridgeStatus: toSdkBridgeStatus(raw.sdk_bridge_status),
    sdkVersion: raw.sdk_version,
    bridgeVersion: raw.bridge_version,
  };
}

// ============================================================================
// Host-backed fetch APIs
// ============================================================================

export async function getPhotoboothStatusResult(): Promise<HostFetchResult<PhotoboothStatus>> {
  const result = await getJson<HostStatusResponse>("/status");
  return result.state === "ok" && result.data
    ? { ...result, data: normalizeStatus(result.data) }
    : { ...result, data: null };
}

export async function getPhotoboothGalleryResult(): Promise<HostFetchResult<PhotoboothSession[]>> {
  const result = await getJson<HostSessionResponse[]>("/sessions");
  return result.state === "ok" && result.data
    ? { ...result, data: result.data.map(normalizeSession) }
    : { ...result, data: null };
}

export async function getPhotoboothSessionByIdResult(
  sessionId: string
): Promise<HostFetchResult<PhotoboothSession>> {
  const result = await getJson<HostSessionResponse>(`/sessions/${sessionId}`);
  return result.state === "ok" && result.data
    ? { ...result, data: normalizeSession(result.data) }
    : { ...result, data: null };
}

export async function getPhotoboothStatus(): Promise<PhotoboothStatus | null> {
  return (await getPhotoboothStatusResult()).data;
}

export async function getPhotoboothRelease(): Promise<PhotoboothDownloadRelease> {
  return photoboothRelease;
}

export async function getPhotoboothGallery(): Promise<PhotoboothSession[] | null> {
  return (await getPhotoboothGalleryResult()).data;
}

export async function getPhotoboothSessionById(sessionId: string): Promise<PhotoboothSession | null> {
  return (await getPhotoboothSessionByIdResult(sessionId)).data;
}

export async function createSession(request: CreateSessionRequest): Promise<PhotoboothSession | null> {
  const raw = await postJson<HostSessionResponse>("/sessions", request);
  return raw ? normalizeSession(raw) : null;
}

export async function capture(sessionId: string, useFallback = false): Promise<PhotoboothSession | null> {
  const request: CaptureRequest = { sessionId, useFallback };
  const raw = await postJson<HostSessionResponse>(`/sessions/${sessionId}/capture`, request);
  return raw ? normalizeSession(raw) : null;
}

export async function resetSession(sessionId: string): Promise<PhotoboothSession | null> {
  const raw = await postJson<HostSessionResponse>(`/sessions/${sessionId}/reset`, {});
  return raw ? normalizeSession(raw) : null;
}

export async function getSettings(): Promise<Record<string, unknown> | null> {
  return await getJson<Record<string, unknown>>("/settings").then((result) => result.data);
}

export async function updateSettings(settings: Partial<Record<string, unknown>>): Promise<Record<string, unknown> | null> {
  return await patchJson<Record<string, unknown>>("/settings", settings);
}

// ============================================================================
// WebSocket clients
// ============================================================================

export type EventHandler = (event: PhotoboothEvent) => void;
export type DisconnectHandler = () => void;
export type ConnectHandler = () => void;

interface WebSocketCallbacks {
  onEvent?: EventHandler;
  onConnect?: ConnectHandler;
  onDisconnect?: DisconnectHandler;
}

class EventWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private callbacks: WebSocketCallbacks;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isIntentionallyClosed = false;

  constructor(url: string, callbacks: WebSocketCallbacks) {
    this.url = url;
    this.callbacks = callbacks;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isIntentionallyClosed = false;

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as PhotoboothEvent;
          this.callbacks.onEvent?.(data);
        } catch (err) {
          console.error("[Photobooth] Failed to parse event:", err);
        }
      };

      this.ws.onclose = () => {
        this.callbacks.onDisconnect?.();

        if (!this.isIntentionallyClosed) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.callbacks.onDisconnect?.();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let eventClient: EventWebSocketClient | null = null;

export function connectToEvents(callbacks: WebSocketCallbacks): void {
  if (eventClient) {
    eventClient.disconnect();
  }

  eventClient = new EventWebSocketClient(`${LOCAL_WS_URL}/ws/events`, callbacks);
  eventClient.connect();
}

export function disconnectFromEvents(): void {
  eventClient?.disconnect();
  eventClient = null;
}

export function isEventStreamConnected(): boolean {
  return eventClient?.isConnected() ?? false;
}

class LiveViewWebSocketClient {
  private ws: WebSocket | null = null;
  private onFrame: (frameData: ArrayBuffer) => void;
  private url: string;

  constructor(url: string, onFrame: (frameData: ArrayBuffer) => void) {
    this.url = url;
    this.onFrame = onFrame;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = "arraybuffer";

      this.ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          this.onFrame(event.data);
        }
      };
    } catch (err) {
      console.error("[Photobooth] Failed to connect live view:", err);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

let liveViewClient: LiveViewWebSocketClient | null = null;

export function startLiveView(onFrame: (frameData: ArrayBuffer) => void): void {
  if (liveViewClient) {
    liveViewClient.disconnect();
  }

  liveViewClient = new LiveViewWebSocketClient(`${LOCAL_WS_URL}/ws/liveview`, onFrame);
  liveViewClient.connect();
}

export function stopLiveView(): void {
  liveViewClient?.disconnect();
  liveViewClient = null;
}

export function isLiveViewConnected(): boolean {
  return liveViewClient?.isConnected() ?? false;
}
