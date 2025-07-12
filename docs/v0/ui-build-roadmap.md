## Midjournal App UI Build Roadmap

### Initial Setup and Core Components

**Commit 1: Project Setup and Basic Structure**
* Initialize new project (e.g., React Native, Flutter, Swift, Kotlin).
* Set up basic navigation (e.g., react-navigation, GoRouter, SwiftUI NavigationStack).
* Create an empty `HomePage` component.
* Create an empty `JournalEntryPage` component.
* Create an empty `JournalResultPage` component.
* Create an empty `JournalInsightsPage` component.
* Create an empty `JournalLibraryPage` component.

**Commit 2: Reusable UI Elements (Buttons, Headers)**
* Implement a reusable `Header` component (left text/icon, right button/icon).
* Implement a reusable `FeedbackButton` component.
* Implement a reusable `LargeActionButton` component (for "CONTINUE", "SUBMIT", "FINISH").

### Home Page Development

**Commit 3: Home Page - Basic Layout**
* Add `Header` with "Midjournal" title and profile icon.
* Add "Welcome back, X" text.
* Add the large circular `AddEntryButton` with plus icon.

**Commit 4: Home Page - Section Placeholders**
* Add "Patterns" section title with arrow.
* Add a large placeholder rectangle for "Patterns" content.
* Add "Library" section title with arrow.
* Add a large placeholder rectangle for "Library" content.
* Link `Library` section to `JournalLibraryPage`.
* Link `AddEntryButton` to `NewJournalEntryPage`.

### New Journal Entry Page Development

**Commit 5: New Journal Entry Page - Header and Prompt**
* Implement `JournalEntryPage` with `Header` (back arrow, "Journal", "FEEDBACK").
* Add "Choose your medium to begin:" text.

**Commit 6: New Journal Entry Page - Medium Selection Buttons**
* Create `MediumSelectionButton` component (circular, icon).
* Add Keyboard, Microphone, and Camera `MediumSelectionButton` instances.
* Implement basic tap interactions (e.g., change state on tap, but no functionality yet).

**Commit 7: New Journal Entry Page - Submit Button**
* Add `LargeActionButton` at the bottom for "SUBMIT".

### Journal Entry Result Page Development

**Commit 8: Journal Entry Result Page - Header and Core Image Layout**
* Implement `JournalResultPage` with `Header` ("Entry 71", "FEEDBACK").
* Add a placeholder for the main abstract image.
* Overlay the circular "71" badge on the image placeholder.

**Commit 9: Journal Entry Result Page - Text Details and Action Buttons**
* Add "Working it out" title.
* Add "26/01/25" date.
* Add expand icon.
* Add "TAP CARD FOR INSIGHTS" text.
* Add share/upload icon.
* Link "TAP CARD FOR INSIGHTS" to `JournalInsightsPage`.
* Add `LargeActionButton` for "CONTINUE".

**Commit 10: Journal Entry Result Page - Integrate Dynamic Image**
* Replace image placeholder with actual image asset from "Entry 71".

### Journal Entry Insights Page Development

**Commit 11: Journal Entry Insights Page - Header and Thumbnail**
* Implement `JournalInsightsPage` with `Header` ("Insights", "FEEDBACK").
* Add the smaller abstract image thumbnail.

**Commit 12: Journal Entry Insights Page - Insights List**
* Add the bulleted list of insight types:
    * "2 sentence summary of entry"
    * "emotional valence"
    * "emotional arousal"
    * "top 3 most emotions detected"
    * "key themes/topics spoken about"
    * "What these themes might mean and why (linked to relevant reading materials)"
    * "Follow up queries and chance to extend on entry"

**Commit 13: Journal Entry Insights Page - Finish Button**
* Add `LargeActionButton` at the bottom for "FINISH".

### Journal Library Page Development

**Commit 14: Journal Library Page - Header and Search Bar**
* Implement `JournalLibraryPage` with `Header` (back arrow, "Library", plus icon, "FEEDBACK").
* Add "Search or ask something...." input field with sparkling icon.

**Commit 15: Journal Library Page - Entry Grid Layout**
* Implement a grid layout for entry previews.
* Add multiple empty rectangular placeholders for future entries.

**Commit 16: Journal Library Page - Display Sample Entry**
* Add the abstract image from "Entry 71" as the first actual entry in the grid.
* Implement a basic `JournalEntryCard` component for reusability.
* Ensure clicking the entry navigates to `JournalResultPage` for that specific entry.

### Refinement and Polish

**Commit 17: Basic Styling and Theming**
* Apply consistent fonts, colors, and spacing based on the provided screenshots (e.g., black backgrounds, white text, rounded corners).
* Ensure all buttons and text elements are correctly styled.

**Commit 18: Responsive Layout Adjustments**
* Ensure all pages adapt well to different screen sizes and orientations (if applicable for target platform).

**Commit 19: Accessibility Improvements**
* Add appropriate `accessibilityLabel` or `contentDescription` to interactive elements.
* Ensure proper focus order.

**Commit 20: Performance Optimizations (UI Level)**
* Review for any obvious UI rendering bottlenecks (e.g., unnecessary re-renders).
* Implement lazy loading for images if many entries are expected in the library.

**Commit 21: Final UI Review and Bug Fixes**
* Thoroughly test all navigation paths and UI interactions.
* Fix any visual glitches or layout issues.

This roadmap provides a detailed, step-by-step approach to building the UI, allowing for incremental development and version control.