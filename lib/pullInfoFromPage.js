//Pulls URLs of people who liked ad
var root = $('.feed-s-likes-list__list-item');
var data = [document.location.href];
var base = "https://www.linkedin.com";
for (var i = 0; i < root.length; i++) {
  data.push(base + root[i].childNodes[1].attributes.href.value);
}

//Passes the information from content script back to extension
chrome.runtime.sendMessage({profiles: data});
