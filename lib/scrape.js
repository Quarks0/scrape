import Google from 'googleapis';


let profileInformation = [];
let numLikers = 0;
  // POST https://sheets.googleapis.com/v4/spreadsheets/1oirryM7Micu6syecPJvmefuQMg64YqFtViaf5pXyo4o:batchUpdate

   {
     requests: [{
       pasteData: {
         coordinate: {
           sheedId: 1,
           rowIndex: 0,
           columnIndex: 0
         },
         data: csv,
         type: 'PASTE_NORMAL',
         delimiter: ','
       }
     }],
     includeSpreadsheetInResponse: true,
     responseIncludeGridData: false
   }
  //https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/request#PasteDataRequest

  function handleClientLoad() {
          // Loads the client library and the auth2 library together for efficiency.
          // Loading the auth2 library is optional here since `gapi.client.init` function will load
          // it if not already loaded. Loading it upfront can save one network request.
          gapi.load('client:auth2', initClient);
        }

        function initClient() {
          // Initialize the client with API key and People API, and initialize OAuth with an
          // OAuth 2.0 client ID and scopes (space delimited string) to request access.
          gapi.client.init({
              apiKey: 'YOUR_API_KEY',
              discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1"],
              clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
              scope: 'profile'
          }).then(function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          });
        }

        function updateSigninStatus(isSignedIn) {
          // When signin status changes, this function is called.
          // If the signin status is changed to signedIn, we make an API call.
          if (isSignedIn) {
            makeApiCall();
          }
        }

        function handleSignInClick(event) {
          // Ideally the button should only show up after gapi.client.init finishes, so that this
          // handler won't be called before OAuth is initialized.
          gapi.auth2.getAuthInstance().signIn();
        }

        function handleSignOutClick(event) {
          gapi.auth2.getAuthInstance().signOut();
        }

        function makeApiCall() {
          // Make an API call to the People API, and print the user's given name.
          gapi.client.people.people.get({
            resourceName: 'people/me'
          }).then(function(response) {
            console.log('Hello, ' + response.result.names[0].givenName);
          }, function(reason) {
            console.log('Error: ' + reason.result.error.message);
          });
        }


document.addEventListener("DOMContentLoaded", () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message.verticals){
      receiveVerticals(message.verticals);
    } else if (message.ads){
      receiveAds(message.ads);
    } else if (message.likers) {
      receiveLikers(message.likers);
    } else if(message.profile){
      receiveProfile(message.profile);
    }
  });

  document.getElementById('extract-description').addEventListener('click', runScrape);
});

function runScrape(){
  let button = document.getElementById('extract-description');
  button.disabled = true;
  button.style.opacity = '0.7';
  getVerticals();
}

function getVerticals() {
  setStatus('Fetching verticals');
  chrome.tabs.executeScript({file: "./lib/pullVerticals.js"});
}

function getAds({verticalTitle, url}) {
  setStatus(`Fetching ads from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullAds.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function getLikers({verticalTitle, adTitle, url}) {
  setStatus(`Fetching likers from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adTitle = '${adTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullLikers.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function getProfile({verticalTitle, adTitle, url}){
  setStatus(`Fetching profile information from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adTitle = '${adTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullProfileInfo.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function receiveVerticals(verticals){
  numVerticals += verticals.length;
  for (let i = 0; i < verticals.length; i++) {
    setTimeout(() => getAds(verticals[i]), i*7500);
  }
}

function receiveAds(ads){
  numAds += ads.length;
  for (let i = 0; i < ads.length; i++) {
    setTimeout(() => getLikers(ads[i]), i*7500);
  }
}

function receiveLikers(likers){
  numLikers += likers.length;
  for (let i = 1; i < likers.length; i++) {
    setTimeout(() => getProfile(likers[i]), i*7500);
  }
}

function receiveProfile(profile){
  profileInformation.push(profile);
  if (profileInformation.length === numLikers.length) {

  }
}

function writeToCSV(auth){
  let csv = convertToCSV();
  if (csv) {
    setStatus('Error creating CSV');
    return;
  }


}

function convertToCSV(){
  if(profileInformation.length === 0) {
    setStatus('Error - No profiles found');
    return;
  }

  let cToK = columnToKeyMap();

  let headers = ['\"Profile\"', '\"First Name\"', '\"Last Name\"', '\"Email\"', '\"Company\"', '\"Title\"', '\"Ad\"', '\"Vertical\"'];
  let result = headers.join(",")+"\n";
  for (let i = 0; i < profileInformation.length; i++) {
    let res = [];
    for (let j = 0; j < headers.length; j++) {
      res.push(`\"${profileInformation[i][cToK[headers[j]]]}\"`);
    }
    result += res.join(",")+"\n";
  }
  return result;
}

function columnToKeyMap(){
  return {
    '\"Profile\"': 'profileURL',
    '\"First Name\"': 'firstName',
    '\"Last Name\"': 'lastName',
    '\"Email\"': 'email',
    '\"Company\"': 'company',
    '\"Title\"': 'title',
    '\"Ad\"': 'adTitle',
    '\"Vertical\"': 'verticalTitle'
  };
}

function setStatus(status){
  document.getElementById('status').innerText = status;
}
