import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
:root {
  &, &.light-mode {
    /* ===== GREY SCALE (0-900) ===== */
    --color-grey-0: #ffffff;
    --color-grey-50: #f9fafb;
    --color-grey-100: #f3f4f6;
    --color-grey-200: #e5e7eb;
    --color-grey-300: #d1d5db;
    --color-grey-400: #9ca3af;
    --color-grey-500: #6b7280;
    --color-grey-600: #4b5563;
    --color-grey-700: #374151;
    --color-grey-800: #1f2937;
    --color-grey-900: #111827;

    /* ===== BLUE (0-900) ===== */
    --color-blue-0: #ffffff;
    --color-blue-50: #f0f9ff;
    --color-blue-100: #e0f2fe;
    --color-blue-200: #bae6fd;
    --color-blue-300: #7dd3fc;
    --color-blue-400: #38bdf8;
    --color-blue-500: #0ea5e9;
    --color-blue-600: #3b82f6;
    --color-blue-700: #0369a1;
    --color-blue-800: #075985;
    --color-blue-900: #0c4a6e;

    /* ===== GREEN (0-900) ===== */
    --color-green-0: #ffffff;
    --color-green-50: #f0fdf4;
    --color-green-100: #dcfce7;
    --color-green-200: #bbf7d0;
    --color-green-300: #86efac;
    --color-green-400: #4ade80;
    --color-green-500: #22c55e;
    --color-green-600: #16a34a;
    --color-green-700: #15803d;
    --color-green-800: #166534;
    --color-green-900: #14532d;

    /* ===== YELLOW (0-900) ===== */
    --color-yellow-0: #ffffff;
    --color-yellow-50: #fefce8;
    --color-yellow-100: #fef9c3;
    --color-yellow-200: #fef08a;
    --color-yellow-300: #fde047;
    --color-yellow-400: #facc15;
    --color-yellow-500: #eab308;
    --color-yellow-600: #ca8a04;
    --color-yellow-700: #a16207;
    --color-yellow-800: #854d0e;
    --color-yellow-900: #713f12;

    /* ===== ORANGE (0-900) ===== */
    --color-orange-0: #ffffff;
    --color-orange-50: #fff7ed;
    --color-orange-100: #ffedd5;
    --color-orange-200: #fed7aa;
    --color-orange-300: #fdba74;
    --color-orange-400: #fb923c;
    --color-orange-500: #f97316;
    --color-orange-600: #ea580c;
    --color-orange-700: #c2410c;
    --color-orange-800: #9a3412;
    --color-orange-900: #7c2d12;

    /* ===== SILVER (0-900) ===== */
    --color-silver-0: #ffffff;
    --color-silver-50: #f8fafc;
    --color-silver-100: #f1f5f9;
    --color-silver-200: #e2e8f0;
    --color-silver-300: #cbd5e1;
    --color-silver-400: #94a3b8;
    --color-silver-500: #64748b;
    --color-silver-600: #475569;
    --color-silver-700: #334155;
    --color-silver-800: #1e293b;
    --color-silver-900: #0f172a;

    /* ===== INDIGO (0-900) ===== */
    --color-indigo-0: #ffffff;
    --color-indigo-50: #eef2ff;
    --color-indigo-100: #e0e7ff;
    --color-indigo-200: #c7d2fe;
    --color-indigo-300: #a5b4fc;
    --color-indigo-400: #818cf8;
    --color-indigo-500: #6366f1;
    --color-indigo-600: #4f46e5;
    --color-indigo-700: #4338ca;
    --color-indigo-800: #3730a3;
    --color-indigo-900: #312e81;

    /* ===== PURPLE (0-900) ===== */
    --color-purple-0: #ffffff;
    --color-purple-50: #f5f3ff;
    --color-purple-100: #ede9fe;
    --color-purple-200: #ddd6fe;
    --color-purple-300: #c4b5fd;
    --color-purple-400: #a78bfa;
    --color-purple-500: #8b5cf6;
    --color-purple-600: #7c3aed;
    --color-purple-700: #6d28d9;
    --color-purple-800: #5b21b6;
    --color-purple-900: #4c1d95;

    /* ===== RED (0-900) ===== */
    --color-red-0: #ffffff;
    --color-red-50: #fef2f2;
    --color-red-100: #fee2e2;
    --color-red-200: #fecaca;
    --color-red-300: #fca5a5;
    --color-red-400: #f87171;
    --color-red-500: #ef4444;
    --color-red-600: #dc2626;
    --color-red-700: #b91c1c;
    --color-red-800: #991b1b;
    --color-red-900: #7f1d1d;

    /* ===== BRAND COLORS (INDIGO) (0-900) ===== */
    --color-brand-0: #ffffff;
    --color-brand-50: #eef2ff;
    --color-brand-100: #e0e7ff;
    --color-brand-200: #c7d2fe;
    --color-brand-300: #a5b4fc;
    --color-brand-400: #818cf8;
    --color-brand-500: #6366f1;
    --color-brand-600: #4f46e5;
    --color-brand-700: #4338ca;
    --color-brand-800: #3730a3;
    --color-brand-900: #312e81;

    /* ===== SEMANTIC COLORS - LIGHT MODE ===== */
    
    /* Success (Green) */
    --color-success-0: var(--color-green-0);
    --color-success-50: var(--color-green-50);
    --color-success-100: var(--color-green-100);
    --color-success-200: var(--color-green-200);
    --color-success-300: var(--color-green-300);
    --color-success-400: var(--color-green-400);
    --color-success-500: var(--color-green-500);
    --color-success-600: var(--color-green-600);
    --color-success-700: var(--color-green-700);
    --color-success-800: var(--color-green-800);
    --color-success-900: var(--color-green-900);

    /* Warning (Yellow) */
    --color-warning-0: var(--color-yellow-0);
    --color-warning-50: var(--color-yellow-50);
    --color-warning-100: var(--color-yellow-100);
    --color-warning-200: var(--color-yellow-200);
    --color-warning-300: var(--color-yellow-300);
    --color-warning-400: var(--color-yellow-400);
    --color-warning-500: var(--color-yellow-500);
    --color-warning-600: var(--color-yellow-600);
    --color-warning-700: var(--color-yellow-700);
    --color-warning-800: var(--color-yellow-800);
    --color-warning-900: var(--color-yellow-900);

    /* Error (Red) */
    --color-error-0: var(--color-red-0);
    --color-error-50: var(--color-red-50);
    --color-error-100: var(--color-red-100);
    --color-error-200: var(--color-red-200);
    --color-error-300: var(--color-red-300);
    --color-error-400: var(--color-red-400);
    --color-error-500: var(--color-red-500);
    --color-error-600: var(--color-red-600);
    --color-error-700: var(--color-red-700);
    --color-error-800: var(--color-red-800);
    --color-error-900: var(--color-red-900);

    /* Info (Blue) */
    --color-info-0: var(--color-blue-0);
    --color-info-50: var(--color-blue-50);
    --color-info-100: var(--color-blue-100);
    --color-info-200: var(--color-blue-200);
    --color-info-300: var(--color-blue-300);
    --color-info-400: var(--color-blue-400);
    --color-info-500: var(--color-blue-500);
    --color-info-600: var(--color-blue-600);
    --color-info-700: var(--color-blue-700);
    --color-info-800: var(--color-blue-800);
    --color-info-900: var(--color-blue-900);

    /* ===== OTHER VARIABLES ===== */
    --backdrop-color: rgba(255, 255, 255, 0.1);
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.12);
    
    --image-grayscale: 0;
    --image-opacity: 100%;

    /* ===== CONTAINER WIDTHS ===== */
    --container-xs: 48rem;
    --container-sm: 64rem;
    --container-md: 76.8rem;
    --container-lg: 102.4rem;
    --container-xl: 128rem;
    --container-2xl: 144rem;
    --container-full: 100%;

    /* ===== COMPONENT SPECIFIC TOKENS ===== */
    --input-height-sm: 3.2rem;
    --input-height-md: 4.0rem;
    --input-height-lg: 4.8rem;
    
    --button-height-sm: 3.2rem;
    --button-height-md: 4.0rem;
    --button-height-lg: 4.8rem;
  }
  
  /* ===== DARK MODE ENHANCEMENTS ===== */
  &[data-theme="dark"] {
    /* ===== GREY SCALE - DARK MODE (INVERTED) ===== */
    --color-grey-0: #0f172a;
    --color-grey-50: #1e293b;
    --color-grey-100: #334155;
    --color-grey-200: #475569;
    --color-grey-300: #64748b;
    --color-grey-400: #94a3b8;
    --color-grey-500: #cbd5e1;
    --color-grey-600: #e2e8f0;
    --color-grey-700: #f1f5f9;
    --color-grey-800: #f8fafc;
    --color-grey-900: #ffffff;

    /* ===== BLUE - DARK MODE ===== */
    --color-blue-0: #0c4a6e;
    --color-blue-50: #075985;
    --color-blue-100: #0369a1;
    --color-blue-200: #0284c7;
    --color-blue-300: #0ea5e9;
    --color-blue-400: #38bdf8;
    --color-blue-500: #7dd3fc;
    --color-blue-600: #bae6fd;
    --color-blue-700: #e0f2fe;
    --color-blue-800: #f0f9ff;
    --color-blue-900: #ffffff;

    /* ===== GREEN - DARK MODE ===== */
    --color-green-0: #14532d;
    --color-green-50: #166534;
    --color-green-100: #15803d;
    --color-green-200: #16a34a;
    --color-green-300: #22c55e;
    --color-green-400: #4ade80;
    --color-green-500: #86efac;
    --color-green-600: #bbf7d0;
    --color-green-700: #dcfce7;
    --color-green-800: #f0fdf4;
    --color-green-900: #ffffff;

    /* ===== YELLOW - DARK MODE ===== */
    --color-yellow-0: #713f12;
    --color-yellow-50: #854d0e;
    --color-yellow-100: #a16207;
    --color-yellow-200: #ca8a04;
    --color-yellow-300: #eab308;
    --color-yellow-400: #facc15;
    --color-yellow-500: #fde047;
    --color-yellow-600: #fef08a;
    --color-yellow-700: #fef9c3;
    --color-yellow-800: #fefce8;
    --color-yellow-900: #ffffff;

    /* ===== ORANGE - DARK MODE ===== */
    --color-orange-0: #7c2d12;
    --color-orange-50: #9a3412;
    --color-orange-100: #c2410c;
    --color-orange-200: #ea580c;
    --color-orange-300: #f97316;
    --color-orange-400: #fb923c;
    --color-orange-500: #fdba74;
    --color-orange-600: #fed7aa;
    --color-orange-700: #ffedd5;
    --color-orange-800: #fff7ed;
    --color-orange-900: #ffffff;

    /* ===== SILVER - DARK MODE ===== */
    --color-silver-0: #0f172a;
    --color-silver-50: #1e293b;
    --color-silver-100: #334155;
    --color-silver-200: #475569;
    --color-silver-300: #64748b;
    --color-silver-400: #94a3b8;
    --color-silver-500: #cbd5e1;
    --color-silver-600: #e2e8f0;
    --color-silver-700: #f1f5f9;
    --color-silver-800: #f8fafc;
    --color-silver-900: #ffffff;

    /* ===== INDIGO - DARK MODE ===== */
    --color-indigo-0: #312e81;
    --color-indigo-50: #3730a3;
    --color-indigo-100: #4338ca;
    --color-indigo-200: #4f46e5;
    --color-indigo-300: #6366f1;
    --color-indigo-400: #818cf8;
    --color-indigo-500: #a5b4fc;
    --color-indigo-600: #c7d2fe;
    --color-indigo-700: #e0e7ff;
    --color-indigo-800: #eef2ff;
    --color-indigo-900: #ffffff;

    /* ===== PURPLE - DARK MODE ===== */
    --color-purple-0: #4c1d95;
    --color-purple-50: #5b21b6;
    --color-purple-100: #6d28d9;
    --color-purple-200: #7c3aed;
    --color-purple-300: #8b5cf6;
    --color-purple-400: #a78bfa;
    --color-purple-500: #c4b5fd;
    --color-purple-600: #ddd6fe;
    --color-purple-700: #ede9fe;
    --color-purple-800: #f5f3ff;
    --color-purple-900: #ffffff;

    /* ===== RED - DARK MODE ===== */
    --color-red-0: #7f1d1d;
    --color-red-50: #991b1b;
    --color-red-100: #b91c1c;
    --color-red-200: #dc2626;
    --color-red-300: #ef4444;
    --color-red-400: #f87171;
    --color-red-500: #fca5a5;
    --color-red-600: #fecaca;
    --color-red-700: #fee2e2;
    --color-red-800: #fef2f2;
    --color-red-900: #ffffff;

    /* ===== BRAND COLORS - DARK MODE ===== */
    --color-brand-0: #312e81;
    --color-brand-50: #3730a3;
    --color-brand-100: #4338ca;
    --color-brand-200: #4f46e5;
    --color-brand-300: #6366f1;
    --color-brand-400: #818cf8;
    --color-brand-500: #a5b4fc;
    --color-brand-600: #c7d2fe;
    --color-brand-700: #e0e7ff;
    --color-brand-800: #eef2ff;
    --color-brand-900: #ffffff;

    /* ===== SEMANTIC COLORS - DARK MODE ===== */
    
    /* Success (Green) - Dark Mode */
    --color-success-0: var(--color-green-0);
    --color-success-50: var(--color-green-50);
    --color-success-100: var(--color-green-100);
    --color-success-200: var(--color-green-200);
    --color-success-300: var(--color-green-300);
    --color-success-400: var(--color-green-400);
    --color-success-500: var(--color-green-500);
    --color-success-600: var(--color-green-600);
    --color-success-700: var(--color-green-700);
    --color-success-800: var(--color-green-800);
    --color-success-900: var(--color-green-900);

    /* Warning (Yellow) - Dark Mode */
    --color-warning-0: var(--color-yellow-0);
    --color-warning-50: var(--color-yellow-50);
    --color-warning-100: var(--color-yellow-100);
    --color-warning-200: var(--color-yellow-200);
    --color-warning-300: var(--color-yellow-300);
    --color-warning-400: var(--color-yellow-400);
    --color-warning-500: var(--color-yellow-500);
    --color-warning-600: var(--color-yellow-600);
    --color-warning-700: var(--color-yellow-700);
    --color-warning-800: var(--color-yellow-800);
    --color-warning-900: var(--color-yellow-900);

    /* Error (Red) - Dark Mode */
    --color-error-0: var(--color-red-0);
    --color-error-50: var(--color-red-50);
    --color-error-100: var(--color-red-100);
    --color-error-200: var(--color-red-200);
    --color-error-300: var(--color-red-300);
    --color-error-400: var(--color-red-400);
    --color-error-500: var(--color-red-500);
    --color-error-600: var(--color-red-600);
    --color-error-700: var(--color-red-700);
    --color-error-800: var(--color-red-800);
    --color-error-900: var(--color-red-900);

    /* Info (Blue) - Dark Mode */
    --color-info-0: var(--color-blue-0);
    --color-info-50: var(--color-blue-50);
    --color-info-100: var(--color-blue-100);
    --color-info-200: var(--color-blue-200);
    --color-info-300: var(--color-blue-300);
    --color-info-400: var(--color-blue-400);
    --color-info-500: var(--color-blue-500);
    --color-info-600: var(--color-blue-600);
    --color-info-700: var(--color-blue-700);
    --color-info-800: var(--color-blue-800);
    --color-info-900: var(--color-blue-900);

    /* ===== DARK MODE SPECIFIC OVERRIDES ===== */
    --backdrop-color: rgba(0, 0, 0, 0.6);
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);
    
    --image-grayscale: 10%;
    --image-opacity: 90%;
  }
  
  /* ===== ADDITIONAL DESIGN TOKENS ===== */
  
  /* Border Radius */
  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;
  --border-radius-xl: 12px;
  --border-radius-2xl: 16px;
  --border-radius-full: 9999px;

  /* Typography */
  --font-size-xxs: 1rem;
  --font-size-xs: 1.2rem;
  --font-size-sm: 1.4rem;
  --font-size-base: 1.6rem;
  --font-size-lg: 1.8rem;
  --font-size-xl: 2.0rem;
  --font-size-2xl: 2.4rem;
  --font-size-3xl: 3.0rem;
  --font-size-4xl: 3.6rem;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-1: 0.4rem;
  --spacing-2: 0.8rem;
  --spacing-3: 1.2rem;
  --spacing-4: 1.6rem;
  --spacing-5: 2.0rem;
  --spacing-6: 2.4rem;
  --spacing-8: 3.2rem;
  --spacing-10: 4.0rem;
  --spacing-12: 4.8rem;
  --spacing-16: 6.4rem;
  --spacing-20: 8.0rem;

  /* Z-Index */
  --z-dropdown: 1000;
  --z-sticky: 1010;
  --z-fixed: 1020;
  --z-modal-backdrop: 1030;
  --z-sidebar: 1035;
  --z-modal: 1040;
  --z-popover: 1050;
  --z-tooltip: 1060;

  /* Transitions - ENHANCED FOR DARK MODE */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== RESET & BASE STYLES ===== */

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;

  /* Creating animations for dark mode */
  transition: background-color 0.3s, border 0.3s, color 0.3s;
}

html {
  font-size: 62.5%;
  
  @media (max-width: 768px) {
    font-size: 56.25%;
  }
}

body {
  font-family: "Poppins", sans-serif;
  color: var(--color-grey-700);
  background-color: var(--color-grey-0);
  transition: color 0.3s, background-color 0.3s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.6rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  /* outline: 2px solid var(--color-brand-600); */
  outline-offset: -1px;
}

/* Parent selector, finally 😃 */
button:has(svg) {
  line-height: 0;
}

a {
  color: inherit;
  text-decoration: none;
  
  &:hover {
    color: var(--color-brand-600);
  }
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: auto;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--color-grey-800);
  font-weight: var(--font-weight-semibold);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  
  /* For dark mode */
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}

/* ===== UTILITY CLASSES ===== */

.text-success {
  color: var(--color-success-600);
}

.text-warning {
  color: var(--color-warning-600);
}

.text-error {
  color: var(--color-error-600);
}

.text-info {
  color: var(--color-info-600);
}

.bg-success {
  background-color: var(--color-success-100);
}

.bg-warning {
  background-color: var(--color-warning-100);
}

.bg-error {
  background-color: var(--color-error-100);
}

.bg-info {
  background-color: var(--color-info-100);
}

/* ===== RESPONSIVE UTILITIES ===== */

@media (max-width: 640px) {
  .hidden-mobile {
    display: none !important;
  }
}

@media (min-width: 641px) {
  .mobile-only {
    display: none !important;
  }
}

/* ===== SCROLLBAR STYLING ===== */

::-webkit-scrollbar {
  width: 0.8rem;
  height: 0.8rem;
}

::-webkit-scrollbar-track {
  background: var(--color-grey-100);
  border-radius: var(--border-radius-full);
}

::-webkit-scrollbar-thumb {
  background: var(--color-grey-300);
  border-radius: var(--border-radius-full);
  
  &:hover {
    background: var(--color-grey-400);
  }
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--color-grey-300) var(--color-grey-100);
}

/* ===== PERFORMANCE OPTIMIZATIONS ===== */

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  * {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  
  .no-print {
    display: none !important;
  }
}

/* ===== ELEVATION/SHADOW UTILITIES ===== */
.elevation-0 {
  box-shadow: none;
}

.elevation-1 {
  box-shadow: var(--shadow-sm);
}

.elevation-2 {
  box-shadow: var(--shadow-md);
}

.elevation-3 {
  box-shadow: var(--shadow-lg);
}

/* ===== SCREEN READER ONLY ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;

export default GlobalStyles;
