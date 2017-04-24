var merge = require('lodash.merge');
var contacts = [];
var profiles = [];
var vertical = "";
var adURL = "";

document.addEventListener("DOMContentLoaded", () => {
  //catches message to either get likers profile urls or profile info
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
    if (message.profiles) {
      profiles = message.profiles;
      adURL = profiles[0];
      console.log(adURL);
      debugger
      for (let i = 1; i < profiles.length; i++) {
        getProfile(profiles[i]);
      }
    }
    else{
      console.log('returned from getProfile');
      console.log(message.contact);
      contacts.push(merge(message.contact, {vertical: vertical, ad: adURL}));
      console.log(contacts);
      if (contacts.length === profiles.length) {
        debugger
        writeToCSV();
      }
    }
  });

  document.getElementById('extract-description').addEventListener('click', runScrape);
});

function runScrape(){
  let vertical = document.getElementById('vertical-input').value;

  getProfiles();
}

//content scripts - load jquery then run pullDescription
function getProfiles() {
  chrome.tabs.executeScript({file:"./lib/jquery-3.1.1.min.js"}, () => {
    chrome.tabs.executeScript({file: "./lib/pullInfoFromPage.js"});
  });
}

function getProfile(url){
  //create blank tab, executeScript, closetab
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {file:"./lib/jquery-3.1.1.min.js"}, () => {
      chrome.tabs.executeScript(tab.id, {file: "./lib/pullInfoFromPageProfile.js"}, (tab) => chrome.tabs.remove(tab.id));
    });
  });
}

function convertToCSV(){
  if(contacts.length === 0) {
    return null;
  }

  let cToK = columnToKeyMap();

  let headers = ['Profile', 'First Name', 'Last Name', 'Email', 'Company', 'Title', 'Ad', 'Vertical'];
  let result = headers.join(",")+"\n";
  for (let i = 0; i < contacts.length; i++) {
    let res = [];
    for (let j = 0; j < headers.length; j++) {
      res.push(contacts[i][cToK[headers[j]]]);
    }
    result += res.join(",")+"\n";
  }
  return result;
}

function columnToKeyMap(){
  return {
    'Profile': 'profile_url',
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Email': 'email',
    'Company': 'company',
    'Title': 'title',
    'Ad': 'ad',
    'Vertical': 'vertical'
  };
}

function writeToCSV(){
  let csv = convertToCSV();
  console.log(csv);
  if (csv === null) {
    return false;
  }
  let data = encodeURI('data:text/csv;charset=utf-8'+csv);

  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', data);
  downloadLink.setAttribute('download', filename);
  downloadLink.click();
}
