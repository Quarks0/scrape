let profileInformation = [];
let numLikers = 0;

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
  setStatus('Fetching ads');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullAds.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function getLikers({verticalTitle, adTitle, url}) {
  setStatus('Fetching likers');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adTitle = '${adTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullLikers.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function getProfile({verticalTitle, adTitle, url}){
  setStatus('Fetching profile information');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adTitle = '${adTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullProfileInfo.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 7500));
    });
  });
}

function receiveVerticals(verticals){
  for (let i = 0; i < verticals.length; i++) {
    setTimeout(() => getAds(verticals[i]), i*7500);
  }
}

function receiveAds(ads){
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
    writeToCSV();
  }
}

function writeToCSV(){
  let csv = convertToCSV();
  if (csv) {
    setStatus('Error creating CSV');
    return;
  }

  chrome.identity.getAuthToken({ 'interactive': false }, (token) => {
    // POST https://sheets.googleapis.com/v4/spreadsheets/1oirryM7Micu6syecPJvmefuQMg64YqFtViaf5pXyo4o:batchUpdate

     data: {
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
  });
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
