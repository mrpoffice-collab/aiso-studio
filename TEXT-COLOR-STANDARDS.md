# Text Color Standards - Content Command Studio

## The Problem We Solved

**Issue**: Light grey text (like `text-slate-400` or `text-slate-500`) was appearing in inputs, making them hard to read.

**Root Cause**: Default Tailwind styles and missing color specifications on form inputs.

## Global Standards (Set in `app/globals.css`)

### All Form Inputs:
```css
input[type="text"],
input[type="email"],
input[type="password"],
input[type="url"],
input[type="search"],
textarea,
select {
  color: #0f172a !important; /* slate-900 - DARK, readable text */
}
```

### Placeholder Text:
```css
input::placeholder,
textarea::placeholder {
  color: #94a3b8 !important; /* slate-400 - visible but clearly a placeholder */
  opacity: 1 !important;
}
```

### Disabled Inputs:
```css
input:disabled,
textarea:disabled,
select:disabled {
  color: #64748b !important; /* slate-500 - slightly lighter but still readable */
  opacity: 0.7;
}
```

## When Creating New Components

### ❌ NEVER DO THIS:
```tsx
// BAD - No text color specified
<input className="px-4 py-2 border rounded" />

// BAD - Light grey text for actual content
<textarea className="text-slate-400" />

// BAD - Relying on default browser colors
<input type="text" placeholder="Enter text" />
```

### ✅ ALWAYS DO THIS:
```tsx
// GOOD - Explicit dark text, visible placeholder
<input
  className="px-4 py-2 border rounded text-slate-900 placeholder:text-slate-400"
/>

// GOOD - Using our standards
<textarea
  className="w-full text-slate-900 placeholder:text-slate-400"
  placeholder="Enter description"
/>

// GOOD - Or let globals.css handle it (preferred)
<input
  type="text"
  className="px-4 py-2 border rounded"
  placeholder="The global CSS will make this dark!"
/>
```

## Color Reference Chart

Use these Tailwind classes throughout the app:

| Use Case | Tailwind Class | Hex Color | When to Use |
|----------|---------------|-----------|-------------|
| **Primary Text** | `text-slate-900` | `#0f172a` | Body text, headings, user input |
| **Secondary Text** | `text-slate-700` | `#334155` | Labels, less important text |
| **Tertiary Text** | `text-slate-600` | `#475569` | Helper text, descriptions |
| **Placeholder Text** | `text-slate-400` | `#94a3b8` | Input placeholders ONLY |
| **Disabled Text** | `text-slate-500` | `#64748b` | Disabled form elements |
| **Brand Orange** | `text-sunset-orange` | `#F36E21` | Accent, highlights, CTAs |
| **Brand Indigo** | `text-deep-indigo` | `#2E3A8C` | Headers, primary actions |

## Never Use These for Body/Input Text:

❌ `text-slate-300` - Too light
❌ `text-slate-400` - Only for placeholders
❌ `text-slate-500` - Only for disabled states
❌ `text-gray-400` - Way too light
❌ No color specified - Unpredictable

## Accessibility Standards

### Minimum Contrast Ratios (WCAG AA):
- **Normal text**: 4.5:1 contrast ratio
- **Large text (18pt+)**: 3:1 contrast ratio

### Our Colors Meet These Standards:
- ✅ `slate-900` on white: ~16:1 (excellent)
- ✅ `slate-700` on white: ~10:1 (excellent)
- ✅ `slate-600` on white: ~7:1 (good)
- ⚠️ `slate-400` on white: ~3:1 (placeholder only!)

## Quick Checklist for New Components

When creating any new form or text input:

- [ ] Does the actual text use `text-slate-900` or darker?
- [ ] Does the placeholder use `text-slate-400`?
- [ ] Is disabled text at least `text-slate-500`?
- [ ] Can you read it easily without straining?
- [ ] Would it look good in a screenshot/demo?

## Global CSS Location

All input defaults are set in:
```
app/globals.css (lines 56-82)
```

**DO NOT MODIFY** these unless you want to change standards app-wide.

## Example: Perfect Input Component

```tsx
<div className="space-y-2">
  <label className="block text-sm font-bold text-slate-700">
    Email Address
  </label>
  <input
    type="email"
    placeholder="you@example.com"
    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200
               focus:border-blue-500 focus:ring-2 focus:ring-blue-200
               text-slate-900 placeholder:text-slate-400
               transition-all"
  />
  <p className="text-sm text-slate-600">
    We'll never share your email with anyone else.
  </p>
</div>
```

## Testing Your Component

Before considering it done:

1. **Visual Test**: Can you easily read all text?
2. **Empty State**: Is the placeholder clearly a placeholder?
3. **Filled State**: Is the actual content dark and readable?
4. **Disabled State**: Is disabled text still somewhat readable?
5. **Screenshot Test**: Would this look professional in marketing?

## Common Mistakes to Avoid

### Mistake #1: Copying Old Code
```tsx
// OLD CODE - Don't copy this pattern
<input className="text-slate-400" /> // ❌ Light grey input text
```

### Mistake #2: Forgetting Placeholder Style
```tsx
// Missing placeholder styling
<input className="text-slate-900" placeholder="Search..." />
// ❌ Placeholder will be default light grey

// CORRECT
<input
  className="text-slate-900 placeholder:text-slate-400"
  placeholder="Search..."
/>
// ✅ Dark input text, visible placeholder
```

### Mistake #3: Using Generic "text-gray"
```tsx
<input className="text-gray-500" /> // ❌ Too generic, too light

<input className="text-slate-900" /> // ✅ Specific, dark, readable
```

## Quick Reference

**Copy-paste this for any new input:**
```tsx
className="text-slate-900 placeholder:text-slate-400"
```

**Or just use this and let globals.css handle it:**
```tsx
<input type="text" placeholder="..." />
// globals.css automatically makes text dark!
```

## Summary

- **User input text**: ALWAYS dark (`text-slate-900`)
- **Placeholders**: Medium grey (`text-slate-400`)
- **Disabled**: Lighter but readable (`text-slate-500`)
- **Trust globals.css**: It's set up to handle this automatically
- **When in doubt**: Make it darker, not lighter

---

**Last Updated**: After implementing duplicate content prevention feature
**Applies To**: All current and future form inputs in the app
