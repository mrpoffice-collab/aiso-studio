import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // JSX Accessibility rules for WCAG compliance
  {
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      // Require alt text for images
      "jsx-a11y/alt-text": "error",
      // Require anchor elements to have content
      "jsx-a11y/anchor-has-content": "error",
      // Require valid anchor href
      "jsx-a11y/anchor-is-valid": "warn",
      // Require ARIA roles to be valid
      "jsx-a11y/aria-role": "error",
      // Require ARIA props to be valid
      "jsx-a11y/aria-props": "error",
      // Require ARIA state and property values to be valid
      "jsx-a11y/aria-proptypes": "error",
      // Require all elements with ARIA roles have required properties
      "jsx-a11y/role-has-required-aria-props": "error",
      // Require click events to have key events
      "jsx-a11y/click-events-have-key-events": "warn",
      // Require interactive elements to be focusable
      "jsx-a11y/interactive-supports-focus": "warn",
      // Require form labels
      "jsx-a11y/label-has-associated-control": "warn",
      // Require mouse events to have key events
      "jsx-a11y/mouse-events-have-key-events": "warn",
      // No access key (screen reader conflicts)
      "jsx-a11y/no-access-key": "error",
      // No autofocus (disorienting for screen readers)
      "jsx-a11y/no-autofocus": "warn",
      // No redundant roles
      "jsx-a11y/no-redundant-roles": "warn",
      // Require tabIndex on non-interactive elements with handlers
      "jsx-a11y/no-noninteractive-element-interactions": "warn",
      // Require heading elements to have content
      "jsx-a11y/heading-has-content": "error",
      // Require html element to have lang attribute
      "jsx-a11y/html-has-lang": "error",
      // Require iframe to have title
      "jsx-a11y/iframe-has-title": "error",
      // Require img alt to not have redundant words
      "jsx-a11y/img-redundant-alt": "warn",
      // Require tabIndex value to be valid
      "jsx-a11y/tabindex-no-positive": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
