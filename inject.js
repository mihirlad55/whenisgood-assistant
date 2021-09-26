var respondents = null;

(function() {
  console.log("Running inject.js");

  // Create respondentsObj which can be JSONified
  stringifyRespondents();
  // Get variable from page context
  respondents = getWindowVariable('respondentObj');

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      console.log("Received message:");
      console.log(request);

      // Perform requested action
      if (request.action === "excludeAllResponses")
        excludeAllResponses();
      else if (request.action == "includeNames")
        includeNames(request.args);
    }
  );
})();

function stringifyRespondents() {
  let script = `
  respondentObj = {};

  // Create JSON object
  for (r in respondents) {
      respondentObj[r] = respondents[r];
  }
  `

  injectScript(script);
}

function excludeAllResponses() {
  let script = `
  // Get all respondent elements
  people = document.getElementsByClassName('respondents')[0];

  // Iterate through all respondent nodes
  for (r of people.children) {

      // If respondent is active
      if (r.className == "respondentActive") {
          // Exclude response
          clickRespondent(r);
          toggleRespondent();
      }
  }`;

  injectScript(script);
}

function getRespondentIds(names) {
  let ids = [];

  // Iterate through all names
  for (name of names) {
    // Iterate through all respondents
    for (r in respondents) {
      // Make name format consistent
      respondentName = respondents[r].name.trim().toLowerCase().replaceAll(' ', '');
      name = name.trim().toLowerCase().replaceAll(' ', '');

      if (respondentName === name) {
        // Skip 'r' character in id
        ids.push(r.substr(1));
      }
    }
  }

  return ids;
}

function includeNames(names) {
  let ids = getRespondentIds(names);

  let script = `
  // Get all respondent elements
  people = document.getElementsByClassName('respondents')[0];
  // Set array of respondent ids
  includeIds = JSON.parse('`+ JSON.stringify(ids) + `');

  // Iterate through all respondent nodes
  for (r of people.children) {
      // If respondent is inactive and ID matches
      if (includeIds.indexOf(r.id) !== -1 && r.className == 'respondentInactive') {
          // Include response
          clickRespondent(r);
          toggleRespondent();
      }
  }`;

  injectScript(script);
}

function injectScript(script) {
  console.log("Injecting script: \n" + script);

  // Create script element
  let scriptElement = document.createElement('script');

  // Create random ID
  scriptElement.id = "tmpScript_" + Math.random().toString(36).substr(2, 5);

  // Append script content as text
  scriptElement.appendChild(document.createTextNode(script));

  // Append script element to document
  (document.body || document.head || document.documentElement).appendChild(scriptElement);

  // Remove script element
  (document.body || document.head || document.documentElement).removeChild(scriptElement);
}

function getWindowVariable(variable) {
  // Stringify variable and set as attribute of document body
  let scriptContent = "if (typeof " + variable + " !== 'undefined') " +
      "document.body.setAttribute('tmp_" + variable + "', JSON.stringify(" + variable + "));";

  // Inject and run script
  injectScript(scriptContent);

  // Extract variable value from attribute
  variableValue = JSON.parse(document.body.getAttribute("tmp_" + variable));

  // Remove temporary attribute
  document.body.removeAttribute("tmp_" + variable);

  return variableValue;
}
