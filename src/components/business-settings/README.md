# Mobile-Friendly Business Settings Components

This directory contains components for the business settings page with mobile-friendly layouts and responsive design.

## Components

### ResponsiveSettingsLayout

The main wrapper component that determines whether to use the desktop or mobile layout based on screen size.

- Uses `BusinessSettingsLayout` for desktop screens
- Uses `MobileSettingsLayout` for mobile screens
- Handles preview panel refreshing

### MobileSettingsLayout

A mobile-optimized layout for the business settings page.

- Replaces the horizontal tab navigation with a dropdown menu
- Shows a simplified progress bar
- Optimizes spacing and layout for smaller screens

### MobileCustomerPreviewPanel

A mobile-friendly version of the customer preview panel.

- Simplified controls
- Optimized preview sizes for mobile screens
- Reduced number of preview options to save space
## Usage

Import and use the `ResponsiveSettingsLayout` component in your settings page:
```tsx
import ResponsiveSettingsLayout from '../components/business-settings/ResponsiveSettingsLayout';
const SettingsPage = () => {
  return (
    <ResponsiveSettingsLayout
      activeTab="profile"
      completionPercentage={70}
      onTabChange={handleTabChange}
    >
      {/* Your settings form content here */}
    </ResponsiveSettingsLayout>
  );
};