

document.addEventListener('DOMContentLoaded', () => {
    // Load saved API key
    chrome.storage.sync.get(['apiKey'], (result) => {
        if (result.apiKey) {
        document.getElementById('apiKey').value = result.apiKey;
        }
    });

    // Save API key
    document.getElementById('save').addEventListener('click', () => {
        const apiKey = document.getElementById('apiKey').value.trim();
        const status = document.getElementById('status');
        
        if (!apiKey) {
        showStatus('Please enter an API key', 'error');
        return;
        }

        chrome.storage.sync.set({ apiKey }, () => {
        if (chrome.runtime.lastError) {
            showStatus('Error saving API key', 'error');
        } else {
            showStatus('API key saved successfully', 'success');
        }
        });
    });

    function showStatus(message, type) {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        setTimeout(() => {
        status.style.display = 'none';
        }, 3000);
    }
});