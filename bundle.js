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
/***/ function(module, exports) {

	'use strict';
	
	var profileInformation = [];
	
	document.addEventListener("DOMContentLoaded", function () {
	  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
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
	  chrome.tabs.executeScript({ file: "./lib/pullVerticals.js" });
	}
	
	function getAds(_ref) {
	  var verticalTitle = _ref.verticalTitle,
	      url = _ref.url;
	
	  setStatus('Fetching ads from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullAds.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 7500);
	      });
	    });
	  });
	}
	
	function getLikers(_ref2) {
	  var verticalTitle = _ref2.verticalTitle,
	      adTitle = _ref2.adTitle,
	      url = _ref2.url;
	
	  setStatus('Fetching likers from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'; let adTitle = \'' + adTitle + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullLikers.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 7500);
	      });
	    });
	  });
	}
	
	function getProfile(_ref3) {
	  var verticalTitle = _ref3.verticalTitle,
	      adTitle = _ref3.adTitle,
	      url = _ref3.url;
	
	  setStatus('Fetching profile information from ' + verticalTitle);
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'; let adTitle = \'' + adTitle + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullProfileInfo.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 7500);
	      });
	    });
	  });
	}
	
	function receiveVerticals(verticals) {
	  numVerticals += verticals.length;
	
	  var _loop = function _loop(i) {
	    setTimeout(function () {
	      return getAds(verticals[i]);
	    }, i * 7500);
	  };
	
	  for (var i = 0; i < verticals.length; i++) {
	    _loop(i);
	  }
	}
	
	function receiveAds(ads) {
	  numAds += ads.length;
	
	  var _loop2 = function _loop2(i) {
	    setTimeout(function () {
	      return getLikers(ads[i]);
	    }, i * 7500);
	  };
	
	  for (var i = 0; i < ads.length; i++) {
	    _loop2(i);
	  }
	}
	
	function receiveLikers(likers) {
	  var _loop3 = function _loop3(i) {
	    setTimeout(function () {
	      return getProfile(likers[i]);
	    }, i * 7500);
	  };
	
	  for (var i = 1; i < likers.length; i++) {
	    _loop3(i);
	  }
	}
	
	function receiveProfile(profile) {
	  profileInformation.push(profile);
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
	    '\"Profile\"': 'profileURL',
	    '\"First Name\"': 'firstName',
	    '\"Last Name\"': 'lastName',
	    '\"Email\"': 'email',
	    '\"Company\"': 'company',
	    '\"Title\"': 'title',
	    '\"Ad\"': 'adTitle',
	    '\"Vertical\"': 'verticalTitle'
	  };
	}

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map