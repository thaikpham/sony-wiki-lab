# Sony Wiki — Documentation Index

**Type:** Monorepo with one active web runtime  
**Primary Language:** TypeScript  
**Architecture:** Next.js App Router + Supabase vertical slices + local booth runtime for Photobooth  
**Last Updated:** 2026-04-10

## Project Overview

Sony Wiki là repo làm việc chính cho runtime mới của dự án. Ứng dụng triển khai thật nằm trong `apps/web`, với ba vertical đang được duy trì là `Wiki`, `Color Lab`, và `Photobooth`. Thư mục `docs/` đóng vai trò `project_knowledge` theo BMAD, còn `_bmad-output/` giữ planning artifacts và implementation artifacts phản ánh trạng thái thực tế của runtime.

## Quick Reference

- **Runtime root:** `apps/web`
- **Legacy reference:** `../sony-wiki-ref/sony-wiki-dev`
- **Primary stack:** Next.js 16, React 19, TypeScript, HeroUI v3, Tailwind CSS v4, Supabase
- **Node baseline:** `22.22.0`
- **Main routes:** `/`, `/wiki`, `/wiki/[slug]`, `/color-lab`, `/photobooth`, `/photobooth/capture`, `/photobooth/gallery`
- **Key shared APIs:** `/api/search`, `/api/wiki/*`, `/api/color-lab/*`, `/api/photobooth/*`

## Core Documentation

- [../README.md](../README.md) - Repo overview, setup, runtime surface, BMAD entry points
- [../codex.md](../codex.md) - Coding protocol, runtime boundaries, verification rules
- [../design_tokens.md](../design_tokens.md) - Token authority và theme rules
- [../project_report.md](../project_report.md) - BMAD snapshot theo phase, risks, next increments
- [repository_structure.md](./repository_structure.md) - Cấu trúc repo và annotated boundaries
- [implementation_status.md](./implementation_status.md) - Current implementation status của Photobooth host/runtime
- [photobooth_architecture.md](./photobooth_architecture.md) - Architecture boundary giữa web, Rust host và C++ bridge
- [photobooth_operator_setup.md](./photobooth_operator_setup.md) - Setup checklist cho operator/booth machine
- [photobooth_windows_handover.md](./photobooth_windows_handover.md) - Handover test plan cho phiên chạy trên Windows
- [phase2_wiki_migration_plan.md](./phase2_wiki_migration_plan.md) - Current plan/backlog cho vertical `Wiki`
- [phase3_color_lab_migration_plan.md](./phase3_color_lab_migration_plan.md) - Internal-production plan và rollout notes cho `Color Lab`
- [navigation_revamp_rollout_checklist.md](./navigation_revamp_rollout_checklist.md) - Shell/navigation hardening checklist

## BMAD Artifacts

- [../_bmad-output/planning-artifacts/current-state-scan.md](../_bmad-output/planning-artifacts/current-state-scan.md) - Current-state scan
- [../_bmad-output/planning-artifacts/architecture-decisions.md](../_bmad-output/planning-artifacts/architecture-decisions.md) - Architecture decisions đang hiệu lực
- [../_bmad-output/planning-artifacts/epics-and-stories.md](../_bmad-output/planning-artifacts/epics-and-stories.md) - Epics/stories đã hoàn thành và backlog gần
- [../_bmad-output/planning-artifacts/implementation-readiness-review.md](../_bmad-output/planning-artifacts/implementation-readiness-review.md) - Readiness review
- [../_bmad-output/implementation-artifacts/typescript-hardening-progress.md](../_bmad-output/implementation-artifacts/typescript-hardening-progress.md) - Hardening progress snapshot

## Getting Started

### Setup

```bash
nvm use
npm run setup
```

### Development

```bash
npm run dev
```

### Verification

```bash
npm run test
npm run typecheck
npm run lint
npm run build
```

## Recommended Reading By Task

### Nếu sửa shell, theme hoặc navigation

Đọc:

- [../design_tokens.md](../design_tokens.md)
- [navigation_revamp_rollout_checklist.md](./navigation_revamp_rollout_checklist.md)
- [repository_structure.md](./repository_structure.md)

### Nếu sửa `Wiki`

Đọc:

- [../project_report.md](../project_report.md)
- [phase2_wiki_migration_plan.md](./phase2_wiki_migration_plan.md)
- [../_bmad-output/planning-artifacts/current-state-scan.md](../_bmad-output/planning-artifacts/current-state-scan.md)

### Nếu sửa `Color Lab`

Đọc:

- [../project_report.md](../project_report.md)
- [phase3_color_lab_migration_plan.md](./phase3_color_lab_migration_plan.md)
- [../_bmad-output/planning-artifacts/architecture-decisions.md](../_bmad-output/planning-artifacts/architecture-decisions.md)
- [../_bmad-output/implementation-artifacts/typescript-hardening-progress.md](../_bmad-output/implementation-artifacts/typescript-hardening-progress.md)

### Nếu sửa `Photobooth`

Đọc:

- [implementation_status.md](./implementation_status.md)
- [photobooth_architecture.md](./photobooth_architecture.md)
- [photobooth_operator_setup.md](./photobooth_operator_setup.md)
- [photobooth_windows_handover.md](./photobooth_windows_handover.md)
- [../README.md](../README.md)

### Nếu cập nhật docs/current state

Đọc và đồng bộ:

- [../README.md](../README.md)
- [../project_report.md](../project_report.md)
- [repository_structure.md](./repository_structure.md)
- các artifact liên quan trong `../_bmad-output/`
