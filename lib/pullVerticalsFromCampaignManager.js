chrome.runTime.sendMessage("Inside vertical pull");
let verticals = [];
let campaignLinks = document.getElementsByClassName('campaign-link');


for (let i = 0; i < campaignLinks.length; i++) {
  let el = campaignLinks[i];
  if (document.getElementById(`toggle-${el.href.match(/\d+$/)[0]}`).checked){
    verticals.push({
      verticalTitle: el.innerText,
      url: el.href
    });
  }
}

chrome.runTime.sendMessage({verticals: verticals});
