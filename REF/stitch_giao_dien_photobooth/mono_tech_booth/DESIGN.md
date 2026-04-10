# Design System Document

## 1. Overview & Creative North Star
**The Creative North Star: "Precision Play"**

This design system moves away from the static, "templated" feel of traditional photo applications. It embraces an aesthetic of **Precision Play**—a fusion of high-end editorial clarity and the tactile, responsive nature of modern technology. 

By utilizing **Space Grotesk** for high-impact headlines and **Inter** for clinical, readable body text, we create a high-contrast typographic landscape. The layout rejects traditional boundaries; instead of boxes and lines, we use **Tonal Layering** and **Asymmetric Breathing Room** to guide the user. The result is a premium, "gallery-grade" interface that feels like a professional studio tool yet remains approachable and intuitive.

---

## 2. Colors & Surface Logic

The palette is a sophisticated monochrome spectrum ranging from `#FFFFFF` to `#000000`, designed to let the user's photography be the only source of vibrant color.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through background color shifts. Use `surface-container-low` sections against a `surface` background to create structural rhythm.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium materials.
- **Base Layer:** `surface` (#f9f9f9).
- **Secondary Sections:** `surface-container-low` (#f3f3f3).
- **Interactive Cards:** `surface-container-lowest` (#ffffff) for a "lifted" feel.
- **System Overlays:** `surface-container-high` (#e8e8e8) for modal backdrops.

### The "Glass & Gradient" Rule
To elevate the "tech-focused" aspect of the photobooth experience, use **Glassmorphism** for floating controls (e.g., camera shutter overlays or filter pickers). 
- **Recipe:** Background: `surface` at 70% opacity + `backdrop-blur: 20px`.
- **CTAs:** Use a subtle linear gradient from `primary` (#000000) to `primary_container` (#1b1b1d) to add depth and "soul" to interactive elements.

---

## 3. Typography

The typographic system relies on the interplay between the geometric character of **Space Grotesk** and the neutral utility of **Inter**.

| Category | Token | Font | Size | Weight | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk | 3.5rem | 700 | Hero moments, "Capture" states |
| **Headline** | `headline-md` | Space Grotesk | 1.75rem | 600 | Gallery titles, major settings |
| **Title** | `title-lg` | Inter | 1.375rem | 600 | Card titles, sub-headers |
| **Body** | `body-md` | Inter | 0.875rem | 400 | General descriptions, settings |
| **Label** | `label-md` | Inter | 0.75rem | 500 | Metadata, timestamps, micro-copy |

**Editorial Note:** Use all-caps with `0.05em` letter spacing for `label-md` to give a "tech-spec" aesthetic to photo metadata.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** rather than shadows.

*   **The Layering Principle:** Place a `surface-container-lowest` card (Pure White) on top of a `surface-container-low` (Pale Grey) background. This creates a soft, natural "lift" that mimics physical paper.
*   **Ambient Shadows:** If a floating element (like a FAB) is required, use a shadow with a blur of `40px`, an opacity of `6%`, and a color derived from `on_surface` (#1a1c1c). It should feel like a soft glow, not a dark smudge.
*   **The Ghost Border:** If a border is required for accessibility in input fields, use `outline_variant` at **15% opacity**. High-contrast outlines are strictly forbidden.

---

## 5. Components

### Buttons (The Interaction Core)
*   **Primary:** Solid `primary` (#000000) with `on_primary` (#ffffff) text. Radius: `full`. No shadow.
*   **Secondary:** `secondary_container` (#e1dfe1) with `on_secondary_container` (#636264) text.
*   **Tertiary/Ghost:** No background. `primary` text. `0.25rem` radius on hover with `surface-container-high`.

### Input Fields (The Studio Interface)
*   Forgo the "box." Use a `surface-container-low` background with a bottom-only `outline_variant` (20% opacity). 
*   Focus state: Background shifts to `surface-container-lowest`, and the bottom line becomes `primary`.

### Cards & Lists (The Gallery Concept)
*   **Zero Dividers:** Never use a horizontal line to separate list items. Use `8px` of vertical white space or alternating backgrounds of `surface` and `surface-container-low`.
*   **Image Containers:** All photo thumbnails should use the `md` (0.75rem) roundedness scale to feel modern and "software-native."

### Photo-Booth Specifics
*   **The Shutter Button:** A `primary` circle with a concentric `outline` ring. Use a `0.5s` ease-out scale effect on press.
*   **Filter Chips:** Use `secondary_fixed` (#e4e2e4) for unselected states. On selection, transition to `primary` with a "pill" shape (`full` roundedness).

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins (e.g., a wider left margin than right) for headlines to create an editorial layout.
*   **Do** use `surface_container_highest` for "active" states in navigation.
*   **Do** ensure all interactive elements have at least a 44px hit target, despite the minimalist aesthetic.

### Don't
*   **Don't** use 100% black text on white. Use `on_surface` (#1a1c1c) for better readability and a "premium ink" feel.
*   **Don't** use standard Material Design drop shadows. If it doesn't look like ambient light in a studio, it's too heavy.
*   **Don't** clutter the screen. If a piece of information isn't vital to the "Capture" or "View" phase, hide it behind a "More Info" label.