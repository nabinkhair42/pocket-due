/**
 * DEPRECATED — this file used to be a byte-identical copy of ThemeContext.tsx.
 *
 * Two copies meant two separate `createContext` calls: any component importing
 * this path would read from a provider that was never mounted and throw
 * "useTheme must be used within a ThemeProvider". On a case-insensitive
 * filesystem (macOS) `./theme-context` and `./ThemeContext` can also resolve to
 * each other, so the bug would appear only on Linux/CI/Android builds.
 *
 * Now a pure re-export, so both paths share one context. Safe to delete once no
 * imports remain: `grep -rn "contexts/theme-context" app/`
 */
export { ThemeProvider, useTheme } from "./ThemeContext";
export type { Theme } from "./ThemeContext";
