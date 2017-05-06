/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

	'use strict';
	
	var profileInformation = [];
	var numLikers = 0;
	
	document.addEventListener('DOMContentLoaded', function () {
	  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	    console.log(message);
	    if (message.verticals) {
	      receiveVerticals(message.verticals);
	    } else if (message.ads) {
	      receiveAds(message.ads);
	    } else if (message.likers) {
	      receiveLikers(message.likers);
	    } else if (message.profile) {
	      receiveProfile(message.profile);
	    }
	  });
	
	  document.getElementById('extract-description').addEventListener('click', runScrape);
	});
	
	function runScrape() {
	  var button = document.getElementById('extract-description');
	  button.disabled = true;
	  button.style.opacity = '0.7';
	  getVerticals();
	}
	
	function getVerticals() {
	  setStatus('Fetching verticals');
	  chrome.tabs.executeScript({ file: './lib/pullVerticalsFromCampaignManager.js' });
	}
	
	function getAds(_ref) {
	  var verticalTitle = _ref.verticalTitle,
	      url = _ref.url;
	
	  setStatus('Fetching ads from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript({
	      file: './lib/pullAdsFromVertical.js',
	      code: 'let verticalTitle = ' + verticalTitle + ';'
	    }, function () {
	      return chrome.tabs.remove(tab.id);
	    });
	  });
	}
	
	function getLikers(_ref2) {
	  var verticalTitle = _ref2.verticalTitle,
	      adTitle = _ref2.adTitle,
	      url = _ref2.url;
	
	  setStatus('Fetching likers from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript({
	      file: './lib/pullLikersFromAdPage.js',
	      code: 'let title = {verticalTitle: ' + verticalTitle + ', adTitle: ' + adTitle + '};'
	    }, function () {
	      return chrome.tabs.remove(tab.id);
	    });
	  });
	}
	
	function getProfile(_ref3) {
	  var verticalTitle = _ref3.verticalTitle,
	      adTitle = _ref3.adTitle,
	      url = _ref3.url;
	
	  setStatus('Fetching profile information from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, {
	      file: './lib/pullInfoFromPageProfile.js',
	      code: 'let title = {verticalTitle: ' + verticalTitle + ', adTitle: ' + adTitle + '};'
	    }, function () {
	      return chrome.tabs.remove(tab.id);
	    });
	  });
	}
	
	function receiveVerticals(verticals) {
	  console.log('verticals: ' + verticals.length);
	  console.log(verticals);
	  for (var i = 0; i < verticals.length; i++) {
	    getAds(verticals[i]);
	  }
	}
	
	function receiveAds(ads) {
	  for (var i = 0; i < ads.length; i++) {
	    getLikers(ads[i]);
	  }
	}
	
	function receiveLikers(likers) {
	  numLikers += likers.length;
	  for (var i = 1; i < likers.length; i++) {
	    getProfile(likers[i]);
	  }
	}
	
	function receiveProfile(profile) {
	  profileInformation.push(profile);
	  console.log('likes: ' + numLikers + '\nprofiles: ' + profileInformation.length);
	}
	
	function writeToCSV() {
	  var csv = convertToCSV();
	  if (csv === null) {
	    setStatus('Error creating CSV');
	    return undefined;
	  }
	  var data = encodeURI('data:text/csv;charset=utf-8,' + csv);
	
	  var downloadLink = document.createElement('a');
	  downloadLink.setAttribute('href', data);
	  downloadLink.setAttribute('download', vertical + '_ad_likers.csv');
	  downloadLink.click();
	  setStatus('completed');
	}
	
	function setStatus(status) {
	  document.getElementById('status').innerText = status;
	}
	
	function convertToCSV() {
	  if (contacts.length === 0) {
	    setStatus('Error - No contacts found');
	    return undefined;
	  }
	
	  var cToK = columnToKeyMap();
	
	  var headers = ['\"Profile\"', '\"First Name\"', '\"Last Name\"', '\"Email\"', '\"Company\"', '\"Title\"', '\"Ad\"', '\"Vertical\"'];
	  var result = headers.join(",") + "\n";
	  for (var i = 0; i < contacts.length; i++) {
	    var res = [];
	    for (var j = 0; j < headers.length; j++) {
	      res.push('"' + contacts[i][cToK[headers[j]]] + '"');
	    }
	    result += res.join(",") + "\n";
	  }
	  return result;
	}
	
	function columnToKeyMap() {
	  return {
	    '\"Profile\"': 'profile_url',
	    '\"First Name\"': 'first_name',
	    '\"Last Name\"': 'last_name',
	    '\"Email\"': 'email',
	    '\"Company\"': 'company',
	    '\"Title\"': 'title',
	    '\"Ad\"': 'ad',
	    '\"Vertical\"': 'vertical'
	  };
	}

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map