let verticals = Array.from(document.getElementsByClassName('campaign-link')).map((el) => {
  return {
    verticalTitle: el.innerText,
    verticalURL: el.href
  };
});

chrome.runTime.sendMessage({verticals: verticals})
