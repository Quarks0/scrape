let profileInformation = [];
let numLikers = 0;

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>{
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
  chrome.tabs.executeScript({file: './lib/pullVerticalsFromCampaignManager.js'});
}

function getAds({verticalTitle, url}) {
  setStatus(`Fetching ads from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript({
      file: './lib/pullAdsFromVertical.js',
      code: `let verticalTitle = ${verticalTitle};`
    }, () => chrome.tabs.remove(tab.id));
  });
}

function getLikers({verticalTitle, adTitle, url}) {
  setStatus(`Fetching likers from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript({
      file: './lib/pullLikersFromAdPage.js',
      code: `let title = {verticalTitle: ${verticalTitle}, adTitle: ${adTitle}};`
    }, () => chrome.tabs.remove(tab.id));
  });
}

function getProfile({verticalTitle, adTitle, url}){
  setStatus(`Fetching profile information from ${verticalTitle}`);
  chrome.tabs.create({url: url, active: false}, (tab) => {
    chrome.tabs.executeScript(tab.id, {
      file: './lib/pullInfoFromPageProfile.js',
      code: `let title = {verticalTitle: ${verticalTitle}, adTitle: ${adTitle}};`
    }, () => chrome.tabs.remove(tab.id));
  });
}

function receiveVerticals(verticals){
  console.log(`verticals: ${verticals.length}`);
  console.log(verticals);
  for (let i = 0; i < verticals.length; i++) {
    getAds(verticals[i]);
  }
}

function receiveAds(ads){
  for (let i = 0; i < ads.length; i++) {
    getLikers(ads[i]);
  }
}

function receiveLikers(likers){
  numLikers += likers.length;
  for (let i = 1; i < likers.length; i++) {
    getProfile(likers[i]);
  }
}

function receiveProfile(profile){
  profileInformation.push(profile);
  console.log(`likes: ${numLikers}\nprofiles: ${profileInformation.length}`);
}

function writeToCSV(){
  let csv = convertToCSV();
  if (csv === null) {
    setStatus('Error creating CSV');
    return undefined;
  }
  let data = encodeURI('data:text/csv;charset=utf-8,'+csv);

  let downloadLink = document.createElement('a');
  downloadLink.setAttribute('href', data);
  downloadLink.setAttribute('download', `${vertical}_ad_likers.csv`);
  downloadLink.click();
  setStatus('completed');
}

function setStatus(status){
  document.getElementById('status').innerText = status;
}

function convertToCSV(){
  if(contacts.length === 0) {
    setStatus('Error - No contacts found');
    return undefined;
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
