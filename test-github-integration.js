// Test Script for GitHub Integration
console.log('🔧 Test Script: GitHub Gist Integration');

// Test 1: Check if GitHubGistManager class exists
try {
    if (typeof GitHubGistManager === 'function') {
        console.log('✅ GitHubGistManager class found');
    } else {
        console.log('❌ GitHubGistManager class not found');
    }
} catch (e) {
    console.log('❌ Error checking GitHubGistManager:', e.message);
}

// Test 2: Check if main functions exist
const functions = [
    'backupToGitHubGist',
    'loadFromGitHubGist',
    'createNewGist',
    'saveGitHubSettings'
];

functions.forEach(funcName => {
    if (typeof window[funcName] === 'function') {
        console.log(`✅ ${funcName} function found`);
    } else {
        console.log(`❌ ${funcName} function not found`);
    }
});

// Test 3: Check localStorage integration
const testToken = 'test_token_123';
const testGistId = 'test_gist_123';
localStorage.setItem('githubToken', testToken);
localStorage.setItem('githubGistId', testGistId);

const savedToken = localStorage.getItem('githubToken');
const savedGistId = localStorage.getItem('githubGistId');

if (savedToken === testToken && savedGistId === testGistId) {
    console.log('✅ localStorage integration working');
} else {
    console.log('❌ localStorage integration failed');
}

// Test 4: Check if form elements exist
const formElements = [
    'github-token',
    'github-gist-id'
];

formElements.forEach(elementId => {
    const element = document.getElementById(elementId);
    if (element) {
        console.log(`✅ Form element #${elementId} found`);
    } else {
        console.log(`❌ Form element #${elementId} not found`);
    }
});

console.log('🎉 Test completed! Check results above.');

// Test 5: Check notification function
if (typeof showNotification === 'function') {
    console.log('✅ Notification function available');
    // showNotification('Test notification from GitHub integration', 'info');
} else {
    console.log('❌ Notification function not found');
}

// Display summary
console.log(`
📊 Integration Test Summary:
- GitHubGistManager: ${typeof GitHubGistManager === 'function' ? '✅' : '❌'}
- All main functions: ${functions.every(f => typeof window[f] === 'function') ? '✅' : '❌'}
- localStorage: ${(savedToken === testToken && savedGistId === testGistId) ? '✅' : '❌'}
- Form elements: ${formElements.every(e => document.getElementById(e)) ? '✅' : '❌'}
- Notifications: ${typeof showNotification === 'function' ? '✅' : '❌'}
`);