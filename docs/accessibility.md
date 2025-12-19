# Accessibility Audit

## Automated coverage
- Added `jest-axe` regression tests that render the chat dashboard, notes workspace, portfolio view, and screener experience (including the markets dashboard) to ensure new UI changes continue to meet baseline accessibility rules.

## Fixes implemented
- Added explicit labels and descriptive text for comboboxes, search inputs, and icon-only buttons across the chat, notes, portfolio, screener, and markets surfaces.
- Announced chart visualizations and knowledge graph canvases with screen-reader descriptions so data-heavy views expose meaningful alternatives.
- Updated navigation landmarks and headings to follow a logical order and expose current location via `aria-current`.
- Ensured tabular data provides captions, scoped headers, and labelled action columns to satisfy axe table rules.

## Known issues
- **Ticker search suggestions lack keyboard navigation.** The combobox opens results but does not yet provide arrow-key traversal or active descendant management, making selection difficult for keyboard-only users.
- **Data visualizations do not expose raw values.** While charts now include summaries, users still lack an accessible table view or downloadable data for programmatic consumption.
- **Live market updates refresh automatically without user control.** The market events feed and Kalshi data poll in the background and may introduce unexpected focus changes for assistive technology users during long sessions.
