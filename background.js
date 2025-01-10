

chrome.commands.onCommand.addListener((command) => {
    if (command === "create-search-tab") {
        createSearchTab();
    }
});

async function createSearchTab() {
    const currentTab = await chrome.tabs.getCurrent();
    const title = currentTab.title;
    const keywords = extractKeywords(title);
    // twitter search url in the format (<keyword> OR <keyword> OR <keyword>)
    const query = `(${keywords.join(" OR ")})`;
    const searchUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}`;
    chrome.tabs.create({ url: searchUrl });
}

function extractKeywords(text) {

    const keywords = text.split(" ");
    // remove the words that are not keywords 
    const filteredKeywords = keywords.filter((keyword) => {
        return keyword.length > 3;
    });
    return filteredKeywords
}
