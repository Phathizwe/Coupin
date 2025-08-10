// Hey Oliver Advanced Customization
// Add this script after the main Hey Oliver script in your index.html

// Wait for Hey Oliver to load
document.addEventListener('heyOliverLoaded', function() {
  // Customize the appearance
  window.HeyOliver.customize({
    // Change the main color to match your brand
    primaryColor: '#4a6cf7', // Replace with your brand's primary color
    
    // Customize the chat bubble
    bubbleIcon: 'default', // Options: 'default', 'message', 'question', or URL to custom image
    bubbleText: 'Need help?', // Text that appears in the bubble
    
    // Welcome message
    welcomeMessage: 'Welcome to TYCA! How can we help you with your coupon and loyalty programs today?',
    
    // Widget position
    position: 'right', // 'right' or 'left'
    
    // Widget labels
    title: 'TYCA Support',
    subtitle: 'We typically reply within minutes',
    
    // Team member display
    showTeamMember: true,
    
    // Mobile optimization
    mobileOptimized: true
  });
  
  // Optional: Track custom events
  window.HeyOliver.trackEvent('widget_loaded');
});