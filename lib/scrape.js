//TODO automate from campaign manager
//TODO push results into google doc

let merge = require('lodash.merge');

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
  button.style.opacity = "0.7";
  setStatus("Retrieving campaigns");
  getVerticals();
}

function getVerticals() {
  chrome.tabs.create({url: url, active: false}, (tab) => {
      chrome.tabs.executeScript({file: "./lib/pullVerticalsFromCampaignManager.js"}, () => chrome.tabs.remove(tab.id));
    });
  });
}

function getAds() {
  chrome.tabs.create({url: url, active: false}, (tab) => {
      chrome.tabs.executeScript({file: "./lib/pullAdsFromCampaign.js"}, () => chrome.tabs.remove(tab.id));
    });
  });
}

function getLikers() {
  chrome.tabs.create({url: url, active: false}, (tab) => {
      chrome.tabs.executeScript({file: "./lib/pullLikersFromAdPage.js"}, () => chrome.tabs.remove(tab.id));
    });
  });
}

function getProfile(url){
  chrome.tabs.create({url: url, active: false}, (tab) => {
      chrome.tabs.executeScript(tab.id, {file: "./lib/pullInfoFromPageProfile.js"}, () => chrome.tabs.remove(tab.id));
    });
  });
}

function receiveVerticals(verticals){
  setStatus(`Fetching ads from ${verticals.length} verticals`);

}

function receiveAds(ads){
  setStatus(`Fetching likers from ${ads.length} ads`);
}

function receiveLikers(likers){
  setStatus(`Fetching profile information from ${likers.length} likers`);
  for (let i = 1; i < profiles.length; i++) {
    getProfile(likers[i]);
  }
}

function receiveProfile(profile){
  contacts.push(merge(message.profile, {vertical: vertical, ad: adURL}));
  if (contacts.length === profile.length-1) {
    setStatus("Writing to CSV");
  }
}

function convertToCSV(){
  if(contacts.length === 0) {
    setStatus("Error getting profile information");
    return null;
  }

  let cToK = columnToKeyMap();

  let headers = ['\"Profile\"', '\"First Name\"', '\"Last Name\"', '\"Email\"', '\"Company\"', '\"Title\"', '\"Ad\"', '\"Vertical\"'];
  let result = headers.join(",")+"\n";
  for (let i = 0; i < contacts.length; i++) {
    let res = [];
    for (let j = 0; j < headers.length; j++) {
      res.push(`\"${contacts[i][cToK[headers[j]]]}\"`);
    }
    result += res.join(",")+"\n";
  }
  return result;
}

function columnToKeyMap(){
  return {
    '\"Profile\"': 'profile_url',
    '\"First Name\"': 'first_name',
    '\"Last Name\"': 'last_name',
    '\"Email\"': 'email',
    '\"Company\"': 'company',
    '\"Title\"': 'title',
    '\"Ad\"': 'ad',
    '\"Vertical\"': 'vertical'
  };
}

function writeToCSV(){
  let csv = convertToCSV();
  if (csv === null) {
    setStatus("Error creating CSV");
    return false;
  }
  let data = encodeURI('data:text/csv;charset=utf-8,'+csv);

  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', data);
  downloadLink.setAttribute('download', `${vertical}_ad_likers.csv`);
  downloadLink.click();
  setStatus("completed");
}

function setStatus(status){
  document.getElementById("status").innerText = status;
}
