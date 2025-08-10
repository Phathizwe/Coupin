# Settings Dashboard - Simple View Redesign

This directory contains components for the redesigned settings dashboard, focusing on a mobile-friendly, card-based layout with emotional design elements.

## Design Goals Achieved

1. **Aligned with Coupon Page Design**
   - Consistent color palette using orange gradients
   - Card-based layout for better scannability
   - Subtle animations for interactions

2. **Improved Mobile Friendliness**
   - Collapsible cards to reduce scrolling
   - Touch-friendly elements (minimum 44px)
   - Sticky navigation bar for easy access

3. **Simplified Navigation**
   - Single-level navigation through sticky footer
   - Visual progress indicators
   - Section breadcrumbs through card headers

4. **Enhanced Emotional Design**
   - Encouraging messages based on completion status
   - Visual feedback for completed sections
   - Celebration animations for milestones

5. **Modular and Maintainable Code**
   - Component-based architecture
   - Files under 200 lines of code
   - Reusable UI elements

## Components

### Layout Components
- `SettingsLayout`: Main container for the settings dashboard
- `SectionCard`: Collapsible card for each settings section
- `StickyNavBar`: Bottom navigation bar for quick access to sections

### Form Components
- `FormField`: Reusable form field with animations
- `CollapsibleForm`: Collapsible form section for grouping related fields
- `SaveButton`: Animated save button with loading state

### Progress Components
- `ProgressTracker`: Visual indicator of overall completion with celebrations

### Hooks
- `useProgressTracker`: Calculates completion percentages for sections

## Usage

```tsx
import SettingsLayout from '../components/settings-dashboard/SettingsLayout';
import BusinessProfileForm from '../components/settings-dashboard/BusinessProfileForm';

const SimpleSettings = () => {
  return (
    <SettingsLayout>
      <BusinessProfileForm />
    </SettingsLayout>
  );
};