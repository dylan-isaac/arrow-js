# Accessibility Principles

Rules that apply to every interactive widget.

- **Prefer semantic HTML over ARIA.** A `<button>` is always better than `<div role="button">`. Use the element that matches the behavior.
- **No ARIA is better than wrong ARIA.** An incorrect role or attribute actively misleads assistive technology. When in doubt, leave it out.
- **Every interactive element needs a visible focus indicator.** Never remove the outline without providing an equivalent.
- **Keyboard operation must not require a mouse.** All actions must be reachable and operable via keyboard alone.
- **Test with screen reader announcements in mind, not just visual output.** What the browser renders and what AT announces are not always the same.
- **Do not use `role="menu"` for navigation or general dropdowns.** Menu semantics are for desktop-style application action menus only. For most dropdowns, use a disclosure pattern with a list of buttons or links.
