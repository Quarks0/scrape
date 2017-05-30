import $ from '../jquery-3.1.1.min.js';

let profileInformation = [];
let totalLikers = [];
let totalAds = []; // Currently 21
let numVerticals; //Currently 14
let verticalsExtracted = 0;
let adsExtracted = 0;
let likersExtracted = 0;

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.onMessage.addListener((message) =>{
    console.log(message);
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
  chrome.tabs.executeScript({file: './lib/pullVerticals.js'});
}

function getAds({verticalTitle, url}) {
  setStatus('Fetching ads');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullAds.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 3500));
    });
  });
}

function getLikers({verticalTitle, adURL, url}) {
  setStatus('Fetching likers');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adURL = '${adURL}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullLikers.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 3500));
    });
  });
}

function getProfile({verticalTitle, adURL, url}){
  setStatus('Fetching profile information');
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {code: `let verticalTitle = '${verticalTitle}'; let adURL = '${adURL}'`}, () => {
      chrome.tabs.executeScript(tab.id, {file: './lib/pullProfileInfo.js'}, () => setTimeout(() => chrome.tabs.remove(tab.id), 3500));
    });
  });
}

function receiveVerticals(verticals){
  numVerticals = verticals.length;
  for (let i = 0; i < verticals.length; i++) {
    setTimeout(() => getAds(verticals[i]), i*1000);
  }
}

function receiveAds(ads){
  verticalsExtracted++;
  totalAds = totalAds.concat(ads);
  if (numVerticals == verticalsExtracted) {
    totalAds = totalAds.filter((ad, index, self) => self.findIndex(a => a.adURL === ad.adURL && a.verticalTitle === ad.verticalTitle) === index);
    for (let i = 0; i < totalAds.length; i++) {
      setTimeout(() => getLikers(totalAds[i]), i*1000);
    }
  }
}

function receiveLikers(likers){
  adsExtracted++;
  totalLikers = totalLikers.concat(likers);
  if (totalAds.length == adsExtracted) {
    for (let i = 0; i < totalLikers.length; i++) {
      setTimeout(() => getProfile(totalLikers[i]), i*1000);
    }
  }
}

function receiveProfile(profile){
  profileInformation.push(profile);
  console.log(`verticals: ${numVerticals}  ads: ${totalAds.length}  likers: ${totalLikers.length}   profiles: ${profileInformation.length}`);
  if (profileInformation.length === totalLikers.length) {
    profileInformation = profileInformation.filter((profile, index, self) => self.findIndex(a => a.profileURL === profile.profileURL && a.adURL === profile.adURL) === index);
    console.log(`After filter profiles: ${profileInformation.length}`);
    writeToCSV();
  }
}

function writeToCSV(){
  let csv = convertToCSV();
  setStatus('Writing CSV');
  if (!csv) {
    setStatus('Error creating CSV');
    reset();
    return;
  }

  chrome.identity.getAuthToken({ 'interactive': false }, (token) => {
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
    }
    ajaxToSheets(csv,token);
  });
}

function ajaxToSheets(csv, token){
  $.ajax({
    method: 'POST',
    url: 'https://sheets.googleapis.com/v4/spreadsheets/1oirryM7Micu6syecPJvmefuQMg64YqFtViaf5pXyo4o:batchUpdate',
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
    },
    success: () => { setStatus('Completed scrape');},
    error: (error) => { setStatus('Error writing to sheets'); reset(); console.log(error);}
  });
}

function convertToCSV(){
  setStatus('Converting to CSV');
  if(profileInformation.length === 0) {
    setStatus('Error - No profiles found');
    reset();
    return;
  }

  let cToK = columnToKeyMap();

  let headers = ['\"Profile\"', '\"First Name\"', '\"Last Name\"', '\"Email\"', '\"Company\"', '\"Title\"', '\"Ad\"', '\"Vertical\"'];
  let result = headers.join(',')+'\n';
  for (let i = 0; i < profileInformation.length; i++) {
    let res = [];
    for (let j = 0; j < headers.length; j++) {
      res.push(`\"${profileInformation[i][cToK[headers[j]]]}\"`);
    }
    result += res.join(',')+'\n';
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
    '\"Ad\"': 'adURL',
    '\"Vertical\"': 'verticalTitle'
  };
}

function setStatus(status){
  document.getElementById('status').innerText = status;
}

function reset(){
  let button = document.getElementById('extract-description');
  button.disabled = false;
  button.style.opacity = '1';
}
