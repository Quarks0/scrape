let ads = [];
let adLinks = document.getElementsByClassName('commentary');

for (let i = 0; i < adLinks.length; i+=2) {
  let el = adLinks[i];
  if (document.getElementById(`toggle-${el.nextSibling.nextSibling.innerText.match(/\d+$/)[0]}`).checked){
    ads.push({
      verticalTitle: verticalTitle,
      adTitle: el.firstChild.innerText,
      url: el.firstChild.href
    });
  }
}

chrome.runTime.sendMessage({ads: ads})
