# Photobooth Operator Setup

## V1 setup checklist

1. Chuẩn bị máy Windows booth machine.
2. Cài Sony driver và SDK dependencies từ internal bundle.
3. Cài hoặc build `apps/booth-host` và `apps/booth-bridge` trên máy Windows.
4. Đặt camera về USB mode `PC Remote` hoặc `Remote Shoot`.
5. Kết nối camera với booth machine qua USB-C.
6. Khởi chạy booth host và kiểm tra `GET /status`.
7. Mở `http://localhost:3000/photobooth/capture`.
8. Tạo session mới nếu host chưa có current session.
9. Chạy dry capture.
10. Xác nhận review, gallery, share đều nhận asset mới.

## Operator notes

- self-service kiosk is the default user-facing mode
- operator settings are protected by a simple local gate in the web UI
- v1 is local-first and does not require cloud upload
- v1 không phụ thuộc Google Drive để hoàn thành flow local
- nếu host không chạy, web UI sẽ hiện unavailable state thay vì fallback sang mock

## Windows-specific verification

Trước khi nghiệm thu booth machine, nên xác nhận lần lượt:

1. `cargo build` pass cho `apps/booth-host`
2. `cargo test` pass cho `apps/booth-host`
3. bridge load được Sony SDK
4. `/status` phản ánh đúng camera connected/disconnected
5. `capture -> file detected -> review/share update` chạy đúng

Checklist đầy đủ cho lượt test kế tiếp nằm ở `docs/photobooth_windows_handover.md`.
