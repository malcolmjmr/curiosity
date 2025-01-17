

chrome.commands.onCommand.addListener((command) => {
    if (command === "create-search-tab") {
        createSearchTab('x');
    } else if (command === "search-on-exa") {
        createSearchTab('exa');
    } else if (command === 'add-to-reading-list') {
        addTabToReadingList();
    }
});

chrome.action.onClicked.addListener((tab) => {
    // Optional: Add functionality for extension icon click
    // Could show options page or trigger search with current tab title
    searchText({text: tab.title, searchType: 'x', tab: tab});
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'searchOnX',
      title: 'Search on X',
      contexts: ['selection', 'page']
    });
    
    chrome.contextMenus.create({
      id: 'searchOnExa',
      title: 'Search on Exa',
      contexts: ['selection', 'page']
    });
  });
  
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    searchText({
        text: info.selectionText || tab.title, 
        searchType: info.menuItemId === 'searchOnX' ? 'x' : 'exa',
        tab: tab
    });
  });


async function addTabToReadingList() {
    const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    const searchType = 'exa';
    const title = await processWithGemini(activeTab.title, searchType);
    const searchUrl = createSearchUrl(title, searchType);
    chrome.readingList.addEntry({
        title: title,
        url: searchUrl,
        hasBeenRead: false
    });
}

async function searchText({text, searchType, tab}) {

    const searchUrl = await generateSearchUrl(text, searchType);
    chrome.tabs.create({ url: searchUrl, active: true, windowId: tab.windowId, index: tab.index + 1});


}

async function generateSearchUrl(text, searchType) {
    
    if (searchType === 'x' && text.includes('on X:')) { 
        text = text.split('on X:')[1].trim();
    }
    const processedQuery = await processWithGemini(text, searchType);
    const searchUrl = createSearchUrl(processedQuery, searchType);
    return searchUrl;
}






async function createSearchTab(searchType) {
    const activeTab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0];
    searchText({text: activeTab.title, searchType: searchType, tab: activeTab});
}

function createSearchUrl(query, searchType) {
    if (searchType === 'x') {
      // Encode the query for X search
      const encodedQuery = encodeURIComponent(query);
      return `https://x.com/search?q=${encodedQuery}`;
    } else {
      // Encode the query for Exa search
      const encodedQuery = encodeURIComponent(query);
      return `https://exa.ai/search?q=${encodedQuery}`;
    }
  }



async function processWithGemini(text, searchType) {
    const { apiKey } = await chrome.storage.sync.get(['apiKey']);
  
    if (!apiKey) {
        console.error('API key not set');
        // Optionally open options page if API key is not set
        chrome.runtime.openOptionsPage();
        return;
    }


    const prompt = searchType === 'x' ? 
        `For the following text, provide the three most important keywords for use in a Twitter search, separated by commas: "${text}"` :
        `Generate a concise topic phrase for academic search from this text: "${text}"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
            parts: [{
                text: prompt
            }]
            }]
        })
        });
        

    const data = await response.json();
    console.log(data);
    text = data.candidates[0].content.parts[0].text;
    if (searchType === 'x') {
        return `(${text.split(',').map(keyword => `"${keyword}"`).join(' OR ')})`;
    } else {
        return text;
    }
}

function extractKeywords(text) {
    // tuples? n-grams?
    const keywords = text.split(" ");
    // remove the words that are not keywords 
    const filteredKeywords = keywords.filter((keyword) => {
        return keyword.length > 3;
    });
    return filteredKeywords
}
