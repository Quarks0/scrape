//Pulls name, work info from linkedIn profile
var root = $('.pv-top-card-section__body');
var names = $('.pv-top-card-section__name')[0].innerText.split(" ").length;
var first_name = $('.pv-top-card-section__name')[0].innerText.split(" ")[0];
var last_name = $('.pv-top-card-section__name')[0].innerText.split(" ")[names-1];
var work = $('.pv-top-card-section__headline')[0].innerText.split(" at ");
var company = $('.pv-top-car-section__company').length > 0 ? $('.pv-top-car-section__company')[0].innerText : work[1];
var data = {profile_url: document.location.href,
  first_name: first_name,
  last_name: last_name,
  email: "",
  title: work[0],
  company: company};

//Passes the information from content script back to extension
chrome.runtime.sendMessage({contact: data});
