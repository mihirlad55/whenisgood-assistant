document.addEventListener('DOMContentLoaded', function() {
  // Inject inject.js into tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, {
      file: 'inject.js'
    });
  });

  // Add event listener for exclude button
  let btnExcludeAll = document.getElementById('btnExcludeAll');
  btnExcludeAll.addEventListener('click', excludeAllResponses);

  let btnIncludeNames = document.getElementById('btnIncludeNames');
  btnIncludeNames.addEventListener('click', includeNames);
});

function sendAction(action, args) {
  // Send message to injected script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: action, args: args }, function (response) {});
  });
}

function excludeAllResponses() {
  sendAction('excludeAllResponses');
}

function includeNames() {
  let txtNames = document.getElementById('txtNames');
  names = [];

  // If no newlines, there may only be one name
  if (txtNames.value.indexOf('\n') == -1) {
    names.push(txtNames.value.trim());
  } else {
    for (line of txtNames.value.split('\n')) {
      // Add non-empty trimmed names to array
      if (line !== '')
        names.push(line.trim());
    }
  }

  sendAction('includeNames', names);
}
