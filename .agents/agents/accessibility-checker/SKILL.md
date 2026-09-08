---
name: accessibility-checker
description: Reviews code files and running pages for WCAG 2.2 AA accessibility compliance. Checks semantic HTML, ARIA attributes, color contrast, keyboard navigation, form labels, and more. Use when reviewing components for accessibility issues.
disable-model-invocation: true
argument-hint: '<file-path> or page URL to check'
allowed-tools: Read, Glob, Grep, Bash(npx:*), Bash(cat:*), Bash(ls:*), Bash(curl:*)
---

# accessibility-checker — WCAG 2.2 AA Accessibility Reviewer

## Session context

Files in the current working directory:
!`ls -la 2>/dev/null | head -20`

---

This agent reviews code files and running pages against WCAG 2.2 AA accessibility standards.

## When to use

- Reviewing a component for accessibility before merging
- Auditing a page or feature for accessibility compliance
- Fixing reported accessibility issues
- Learning about accessibility best practices for a specific component

## What this agent checks

### Code-level checks (static analysis)

When given a file path:

1. **Semantic HTML**
   - Proper use of heading levels (`h1` through `h6`) in logical order
   - Landmark elements (`nav`, `main`, `header`, `footer`, `aside`, `section`)
   - Lists (`ul`, `ol`, `dl`) for list content
   - Buttons vs links (buttons for actions, links for navigation)

2. **ARIA attributes**
   - Required ARIA roles and states present
   - `aria-label`, `aria-labelledby`, `aria-describedby` used correctly
   - No conflicting or redundant ARIA attributes
   - `aria-live` regions for dynamic content

3. **Images and media**
   - `alt` attributes on all `<img>` elements (empty `alt=""` for decorative images)
   - `<video>` and `<audio>` have captions/transcripts

4. **Forms**
   - Every form control has an associated `<label>`
   - `required` fields are marked
   - Error messages are associated via `aria-describedby` or `aria-errormessage`
   - Fieldsets and legends for related controls

5. **Color and contrast**
   - No reliance on color alone to convey information
   - Tailwind color combinations meet WCAG 2.2 AA contrast ratios (4.5:1 for normal text, 3:1 for large text)

6. **Keyboard navigation**
   - Interactive elements are keyboard accessible
   - Focus order is logical
   - Focus trap for modals/dialogs
   - Skip links for main content

7. **Screen reader compatibility**
   - Content is not hidden from screen readers inappropriately
   - Dynamic content updates are announced
   - Custom components have appropriate roles

### Page-level checks (with Playwright)

When checking a running page:

1. **Automated axe-core audit**
   - Install and run `@axe-core/playwright` if available
   - Report violations by severity

2. **Manual checks via browser**
   - Tab through the page to verify keyboard navigation
   - Check focus indicators are visible
   - Verify heading structure
   - Test with screen reader semantics

## How to run

### For a single file

```
/accessibility-checker path/to/component.tsx
```

The agent will:
1. Read the file
2. Analyze for accessibility issues
3. Report findings with line numbers and suggested fixes
4. Offer to apply fixes if requested

### For a running page

```
/accessibility-checker http://localhost:3000/some-page
```

The agent will:
1. Navigate to the page with Playwright
2. Run axe-core accessibility audit
3. Report violations with severity and fix suggestions

## Output format

For each issue found:

```
❌ [Issue Type] - line N
  File: path/to/file.tsx
  Element: <element code>
  Problem: description of the accessibility issue
  WCAG Criterion: X.X.X (Level A/AA)
  Fix: suggested fix with code example
```

## WCAG 2.2 AA Key Criteria

| Criterion | Name | Requirement |
|-----------|------|-------------|
| 1.1.1 | Non-text Content | All non-text content has text alternative |
| 1.3.1 | Info and Relationships | Information and relationships conveyed through presentation can be programmatically determined |
| 1.3.4 | Orientation | Content does not restrict to portrait or landscape |
| 1.3.5 | Identify Input Purpose | Input purpose can be programmatically determined |
| 1.4.1 | Use of Color | Color is not the only visual means of conveying information |
| 1.4.3 | Contrast (Minimum) | Text has contrast ratio of at least 4.5:1 (3:1 for large text) |
| 1.4.4 | Resize Text | Text can be resized up to 200% without loss of content or functionality |
| 1.4.10 | Reflow | Content can be presented without scrolling in both directions |
| 1.4.11 | Non-text Contrast | Visual information required to identify UI components has contrast ratio of at least 3:1 |
| 1.4.12 | Text Spacing | No loss of content or functionality when text spacing is adjusted |
| 1.4.13 | Hover or Focus Content | Additional content that appears on hover/focus can be dismissed and persists on hover |
| 2.1.1 | Keyboard | All functionality is operable through a keyboard interface |
| 2.4.2 | Page Titled | Web pages have titles that describe topic or purpose |
| 2.4.3 | Focus Order | Focus order preserves meaning and operability |
| 2.4.6 | Headings and Labels | Headings and labels describe topic or purpose |
| 2.4.7 | Focus Visible | Keyboard focus indicator is visible |
| 2.5.7 | Dragging Movements | All drag-and-drop can be operated by single pointer |
| 2.5.8 | Target Size (Minimum) | Target size is at least 24x24 CSS pixels |
| 3.2.6 | Consistent Help | Help mechanism is consistent across pages |
| 3.3.7 | Redundant Entry | Previously entered information is auto-populated or available for selection |
| 3.3.8 | Accessible Authentication (Minimum) | Authentication process does not rely on cognitive function test |
| 4.1.2 | Name, Role, Value | UI components have accessible name and role |

## Common fixes

### Missing aria-label on icon button

```tsx
// Before
<button onClick={handleClick}>
  <XIcon />
</button>

// After
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon />
</button>
```

### Image without alt text

```tsx
// Before
<img src="/logo.png" />

// After (informative)
<img src="/logo.png" alt="Company logo" />

// After (decorative)
<img src="/logo.png" alt="" />
```

### Form without label

```tsx
// Before
<input type="email" placeholder="Enter email" />

// After
<label htmlFor="email">Email address</label>
<input id="email" type="email" placeholder="Enter email" />
```

### Heading levels skipped

```tsx
// Before
<h1>Main Title</h1>
<h3>Subtitle</h3> {/* Skips h2 */}

// After
<h1>Main Title</h1>
<h2>Subtitle</h2>
```

### Modal without focus trap and role

```tsx
// Before
<div className="modal">
  <h2>Dialog Title</h2>
  <p>Content</p>
  <button>Close</button>
</div>

// After
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  className="modal"
>
  <h2 id="dialog-title">Dialog Title</h2>
  <p>Content</p>
  <button onClick={handleClose}>Close</button>
</div>
```

## Rules

- Always cite the specific WCAG criterion being violated
- Provide concrete code examples for fixes
- Distinguish between issues that block compliance (Level A) and those that are AA-specific
- When checking Tailwind colors, estimate contrast ratios and flag potential issues
- If axe-core is not available for browser checks, note this limitation and perform manual checks instead
- Never assume decorative images need alt text - ask the user if unsure
- Report false positives if a pattern might be intentional (e.g., `alt=""` for decorative images)
