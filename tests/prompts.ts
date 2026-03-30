export interface TestCase {
  name: string;
  prompt: string;
  expectPatterns: string[];
  rejectPatterns?: string[];
}

export const TEST_CASES: TestCase[] = [
  {
    name: 'accordion',
    prompt: 'Build a FAQ page where users can expand questions to see answers. Use Arrow.js.',
    expectPatterns: ['accordion.md'],
  },
  {
    name: 'tabs',
    prompt: 'Build a settings page with three sections the user switches between, showing one at a time. Use Arrow.js.',
    expectPatterns: ['tabs.md'],
  },
  {
    name: 'dialog',
    prompt: 'Build a page with a delete button that opens a confirmation overlay before proceeding. Use Arrow.js.',
    expectPatterns: ['dialog.md'],
  },
  {
    name: 'disclosure',
    prompt: 'Build a page with a Show Advanced Options toggle that reveals extra settings. Use Arrow.js.',
    expectPatterns: ['disclosure.md'],
  },
  {
    name: 'alert',
    prompt: 'Build a form with a save button that shows a brief success message after saving. Use Arrow.js.',
    expectPatterns: ['alert.md'],
  },
  {
    name: 'tooltip',
    prompt: 'Build a toolbar with icon-only buttons that show descriptive labels on hover and focus. Use Arrow.js.',
    expectPatterns: ['tooltip.md'],
  },
  {
    name: 'combobox',
    prompt: 'Build a country selector where the user types to filter a list of suggestions. Use Arrow.js.',
    expectPatterns: ['combobox.md'],
  },
  {
    name: 'switch',
    prompt: 'Build a preferences panel with toggles for dark mode and notifications that take effect immediately. Use Arrow.js.',
    expectPatterns: ['switch.md'],
  },
  {
    name: 'listbox',
    prompt: 'Build a color picker where users select one or more colors from a visible list. Use Arrow.js.',
    expectPatterns: ['listbox.md'],
  },
  {
    name: 'fallback',
    prompt: 'Build a breadcrumb navigation trail showing Home > Products > Widget. Use Arrow.js.',
    expectPatterns: [],
    rejectPatterns: ['accordion.md', 'tabs.md', 'dialog.md', 'combobox.md'],
  },
];
