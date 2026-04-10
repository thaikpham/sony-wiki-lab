import type { PhotoboothSession, PhotoboothStatus } from "./contracts";
import { buildPhotoboothShareInfo } from "./helpers";

const assetUrlA = "https://example.invalid/mock/session-0824-001.jpg";
const assetUrlB = "https://example.invalid/mock/session-0824-002.jpg";
const assetUrlC = "https://example.invalid/mock/session-0825-001.jpg";

export const photoboothSessions: PhotoboothSession[] = [
  {
    id: "session-0824",
    title: "Enterprise Portrait",
    state: "published",
    createdAt: "2026-04-10T11:04:32.000Z",
    updatedAt: "2026-04-10T11:05:02.000Z",
    boothMode: "portrait",
    eventName: "Sony Future Lab Roadshow",
    storagePath: "D:/SonyPhotobooth/captures/2026-04-10/session-0824",
    operatorUnlocked: false,
    countdownSeconds: 3,
    selectedAssetId: "asset-0824-001",
    assets: [
      {
        id: "asset-0824-001",
        sessionId: "session-0824",
        fileName: "FRM_0824_001.JPG",
        imageUrl: assetUrlA,
        thumbnailUrl: assetUrlA,
        capturedAt: "2026-04-10T11:04:32.000Z",
        width: 5464,
        height: 8192,
        deliveryStatus: "local",
      },
      {
        id: "asset-0824-002",
        sessionId: "session-0824",
        fileName: "FRM_0824_002.JPG",
        imageUrl: assetUrlB,
        thumbnailUrl: assetUrlB,
        capturedAt: "2026-04-10T11:05:01.000Z",
        width: 5464,
        height: 8192,
        deliveryStatus: "synced",
      },
    ],
    share: buildPhotoboothShareInfo(
      "session-0824",
      "2026-04-10T11:05:02.000Z"
    ),
    captureBackend: "sdk-primary",
    sessionFolderPath: "D:/SonyPhotobooth/captures/2026-04-10/session-0824",
    fileWatchStatus: "file-detected",
    detectedFiles: ["FRM_0824_001.JPG", "FRM_0824_002.JPG"],
    latestAssetFileName: "FRM_0824_002.JPG",
  },
  {
    id: "session-0825",
    title: "Landscape Studio",
    state: "review",
    createdAt: "2026-04-10T11:24:18.000Z",
    updatedAt: "2026-04-10T11:24:42.000Z",
    boothMode: "landscape",
    eventName: "Sony Future Lab Roadshow",
    storagePath: "D:/SonyPhotobooth/captures/2026-04-10/session-0825",
    operatorUnlocked: true,
    countdownSeconds: 5,
    selectedAssetId: "asset-0825-001",
    assets: [
      {
        id: "asset-0825-001",
        sessionId: "session-0825",
        fileName: "FRM_0825_001.JPG",
        imageUrl: assetUrlC,
        thumbnailUrl: assetUrlC,
        capturedAt: "2026-04-10T11:24:42.000Z",
        width: 6000,
        height: 4000,
        deliveryStatus: "local",
      },
    ],
    share: buildPhotoboothShareInfo("session-0825", null),
    captureBackend: "sdk-primary",
    sessionFolderPath: "D:/SonyPhotobooth/captures/2026-04-10/session-0825",
    fileWatchStatus: "file-detected",
    detectedFiles: ["FRM_0825_001.JPG"],
    latestAssetFileName: "FRM_0825_001.JPG",
  },
];

export const photoboothStatus: PhotoboothStatus = {
  runtime: "mock",
  camera: {
    connected: true,
    model: "Sony ILCE-7M4",
    transport: "USB-C",
    firmware: "4.01",
    sdkVersion: "2.01.00",
  },
  currentSessionId: "session-0825",
  localStoragePath: "D:/SonyPhotobooth/captures",
  operatorLocked: true,
  latestShareUrl: photoboothSessions[0]?.share.shareUrl ?? null,
  settings: {
    aspectPreset: "landscape-3-2",
    saveDestination: "pc",
    shutterMode: "single",
    timerMode: "3s",
    localHostUrl: "http://127.0.0.1:3333",
  },
  captureBackend: "sdk-primary",
  fallbackCaptureMode: null,
  fileWatcherStatus: "watching",
  fileWatcherRoot: "D:/SonyPhotobooth/captures",
  fileArrivalTimeoutSeconds: 10,
  liveViewStatus: "streaming",
  sdkBridgeStatus: "connected",
  sdkVersion: "2.01.00",
  bridgeVersion: "1.0.0-stub",
};
