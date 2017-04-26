//Pulls URLs of people who liked ad
let data = [document.location.href];
let offset = $('.likes-left-button').length
let root = $('.feed-s-likes-list__list-item');
let base = "https://www.linkedin.com";
for (let i = 0; i < root.length-offset; i++) {
  data.push(base + root[i].childNodes[1].attributes.href.value);
}

//Passes the information from content script back to extension
chrome.runtime.sendMessage({profiles: data});
