setTimeout(() => {
  let likers = [];
  let offset = document.getElementsByClassName('likes-left-button').length
  let root = document.getElementsByClassName('feed-s-likes-list__list-item');
  for (let i = 0; i < root.length-offset; i++) {
    likers.push({
      verticalTitle: verticalTitle,
      adTitle: adTitle,
      url: root[i].childNodes[1].href
    });
  }

  chrome.runtime.sendMessage({likers: likers});
}, 5000);
