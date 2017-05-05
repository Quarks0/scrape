let root = document.getElementsByClassName('pv-top-card-section__body');
let names = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(" ").length;
let first_name = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(" ")[0];
let last_name = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(" ")[names-1];
let work = document.getElementsByClassName('pv-top-card-section__headline')[0].innerText.split(" at ");
let company = document.getElementsByClassName('pv-top-card-section__company').length > 0 ? document.getElementsByClassName('pv-top-card-section__company')[0].innerText : work[1];
let data = {profile_url: document.location.href,
  first_name: first_name,
  last_name: last_name,
  email: "",
  title: work[0],
  company: company};

chrome.runtime.sendMessage({profile: data});
