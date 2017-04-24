document.addEventListener('DOMContentLoaded', () => {
  //Pulls name, work info from linkedIn profile
  var root = $('.pv-top-card-section__body');
  var name = $('.pv-top-card-section__name')[0].innerText.split(" ");
  var work = $('.pv-top-card-section__headline')[0].innerText.split(" at ");
  var data = {profile_url: document.location.href,
    first_name: name[0],
    last_name: name[1],
    email: "",
    title: work[0],
    company: work[1]};

    //Passes the information from content script back to extension
    chrome.runtime.sendMessage({contact: data});
});
