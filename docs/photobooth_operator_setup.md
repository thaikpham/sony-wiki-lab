# Photobooth Operator Setup

## V1 setup checklist

1. Install Sony driver from the internal SDK bundle.
2. Install the Windows booth app.
3. Put camera USB mode into `PC Remote` or `Remote Shoot`.
4. Connect camera to the booth machine using USB-C.
5. Launch booth host and verify camera status.
6. Open `/photobooth/capture` and unlock operator controls if needed.
7. Run a dry capture, then verify gallery and public share route.

## Operator notes

- self-service kiosk is the default user-facing mode
- operator settings are protected by a simple local gate in the web UI
- v1 is local-first and does not require cloud upload
- v1 shares one final image per session
