setTimeout(() => {
  let names = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(' ').length;
  let firstName = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(' ')[0];
  let lastName = document.getElementsByClassName('pv-top-card-section__name')[0].innerText.split(' ')[names-1];
  let work = document.getElementsByClassName('pv-top-card-section__headline')[0].innerText.split(' at ');
  let company = document.getElementsByClassName('pv-top-card-section__company').length > 0 ? document.getElementsByClassName('pv-top-card-section__company')[0].innerText : work[1];
  let data = {profileURL: document.location.href,
    vertical: verticalTitle,
    adURL: adURL,
    firstName: firstName,
    lastName: lastName,
    email: '',
    title: work[0],
    company: company};

    chrome.runtime.sendMessage({profile: data});
}, 3000);
