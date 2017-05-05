let data = [];
let offset = document.getElementsByClassName('likes-left-button').length
let root = document.getElementsByClassName('feed-s-likes-list__list-item');
let base = 'https://www.linkedin.com';
for (let i = 0; i < root.length-offset; i++) {
  data.push(base + root[i].childNodes[1].attributes.href.value);
}

chrome.runtime.sendMessage({likers: data});
