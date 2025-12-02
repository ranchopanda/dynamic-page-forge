/**
 * Emergency localStorage cleaner
 * Run this in the browser console if you're getting quota exceeded errors:
 * 
 * Copy and paste this entire script into your browser console and press Enter
 */

(function clearLocalStorage() {
  try {
    console.log('Checking localStorage usage...');
    
    // Get all keys and their sizes
    const items = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        const size = value ? value.length : 0;
        items.push({ key, size });
      }
    }
    
    // Sort by size (largest first)
    items.sort((a, b) => b.size - a.size);
    
    console.log('localStorage items by size:');
    items.forEach(item => {
      const sizeKB = (item.size / 1024).toFixed(2);
      console.log(`  ${item.key}: ${sizeKB} KB`);
    });
    
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);
    console.log(`Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    
    // Ask user what to do
    const shouldClear = confirm(
      `localStorage is using ${(totalSize / 1024).toFixed(2)} KB.\n\n` +
      'Do you want to clear ALL localStorage data?\n\n' +
      '(This will log you out and clear saved preferences)'
    );
    
    if (shouldClear) {
      localStorage.clear();
      console.log('✅ localStorage cleared successfully!');
      console.log('Please refresh the page.');
      
      const shouldRefresh = confirm('Refresh the page now?');
      if (shouldRefresh) {
        window.location.reload();
      }
    } else {
      console.log('Cancelled. No changes made.');
    }
    
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    console.log('localStorage might be disabled in your browser.');
  }
})();
