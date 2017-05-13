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
	var numAds = 0; //Currently 21
	var numVerticals = 0; //Currently 14
	
	document.addEventListener('DOMContentLoaded', function () {
	  chrome.runtime.onMessage.addListener(function (message) {
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
	  chrome.tabs.executeScript({ file: './lib/pullVerticals.js' });
	}
	
	function getAds(_ref) {
	  var verticalTitle = _ref.verticalTitle,
	      url = _ref.url;
	
	  setStatus('Fetching ads');
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullAds.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 2500);
	      });
	    });
	  });
	}
	
	function getLikers(_ref2) {
	  var verticalTitle = _ref2.verticalTitle,
	      adURL = _ref2.adURL,
	      url = _ref2.url;
	
	  setStatus('Fetching likers');
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'; let adURL = \'' + adURL + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullLikers.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 3500);
	      });
	    });
	  });
	}
	
	function getProfile(_ref3) {
	  var verticalTitle = _ref3.verticalTitle,
	      adURL = _ref3.adURL,
	      url = _ref3.url;
	
	  setStatus('Fetching profile information');
	  chrome.tabs.create({ url: url, active: false }, function (tab) {
	    chrome.tabs.executeScript(tab.id, { code: 'let verticalTitle = \'' + verticalTitle + '\'; let adURL = \'' + adURL + '\'' }, function () {
	      chrome.tabs.executeScript(tab.id, { file: './lib/pullProfileInfo.js' }, function () {
	        return setTimeout(function () {
	          return chrome.tabs.remove(tab.id);
	        }, 9000);
	      });
	    });
	  });
	}
	
	function receiveVerticals(verticals) {
	  var _loop = function _loop(i) {
	    setTimeout(function () {
	      return getAds(verticals[i]);
	    }, i * 3000);
	  };
	
	  for (var i = 0; i < verticals.length; i++) {
	    _loop(i);
	  }
	}
	
	function receiveAds(ads) {
	  numAds = numAds.concat(ads);
	  console.log(numAds.length);
	
	  var _loop2 = function _loop2(i) {
	    setTimeout(function () {
	      return getLikers(ads[i]);
	    }, i * 4000);
	  };
	
	  for (var i = 0; i < ads.length; i++) {
	    _loop2(i);
	  }
	}
	
	function receiveLikers(likers) {
	  numLikers += likers.length;
	
	  var _loop3 = function _loop3(i) {
	    setTimeout(function () {
	      return getProfile(likers[i]);
	    }, i * 8000);
	  };
	
	  for (var i = 0; i < likers.length; i++) {
	    _loop3(i);
	  }
	}
	
	function receiveProfile(profile) {
	  profileInformation.push(profile);
	  console.log('verticals: ' + numVerticals + '  ads: ' + numAds + '  likers: ' + numLikers + '   profiles: ' + profileInformation.length);
	  if (profileInformation.length === 1 /*numLikers*/) {
	      profileInformation = profileInformation.filter(function (profile, index, self) {
	        return self.findIndex(function (a) {
	          return a.profileURL === profile.profileURL && a.adURL === profile.adURL;
	        }) === index;
	      });
	      console.log('After filter profiles: ' + profileInformation.length);
	      writeToCSV();
	    }
	}
	
	function writeToCSV() {
	  var csv = convertToCSV();
	  setStatus('Writing CSV');
	  if (!csv) {
	    setStatus('Error creating CSV');
	    reset();
	    return;
	  }
	
	  chrome.identity.getAuthToken({ 'interactive': true }, function (token) {
	    if (chrome.runtime.lastError) {
	      console.log(chrome.runtime.lastError);
	    }
	    ajaxToSheets(csv);
	  });
	}
	
	function ajaxToSheets(csv) {
	  $.ajax({
	    method: 'POST',
	    url: 'https://sheets.googleapis.com/v4/spreadsheets/1oirryM7Micu6syecPJvmefuQMg64YqFtViaf5pXyo4o:batchUpdate',
	    data: {
	      requests: [{
	        pasteData: {
	          coordinate: {
	            sheedId: 1,
	            rowIndex: 0,
	            columnIndex: 0
	          },
	          data: csv,
	          type: 'PASTE_NORMAL',
	          delimiter: ','
	        }
	      }],
	      includeSpreadsheetInResponse: true,
	      responseIncludeGridData: false
	    },
	    success: function success() {
	      setStatus('Completed scrape');
	    },
	    error: function error(_error) {
	      setStatus('Error writing to sheets');reset();console.log(_error);
	    }
	  });
	}
	
	function convertToCSV() {
	  setStatus('Converting to CSV');
	  if (profileInformation.length === 0) {
	    setStatus('Error - No profiles found');
	    reset();
	    return;
	  }
	
	  var cToK = columnToKeyMap();
	
	  var headers = ['\"Profile\"', '\"First Name\"', '\"Last Name\"', '\"Email\"', '\"Company\"', '\"Title\"', '\"Ad\"', '\"Vertical\"'];
	  var result = headers.join(',') + '\n';
	  for (var i = 0; i < profileInformation.length; i++) {
	    var res = [];
	    for (var j = 0; j < headers.length; j++) {
	      res.push('"' + profileInformation[i][cToK[headers[j]]] + '"');
	    }
	    result += res.join(',') + '\n';
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
	    '\"Ad\"': 'adURL',
	    '\"Vertical\"': 'verticalTitle'
	  };
	}
	
	function setStatus(status) {
	  document.getElementById('status').innerText = status;
	}
	
	function reset() {
	  var button = document.getElementById('extract-description');
	  button.disabled = false;
	  button.style.opacity = '1';
	}

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map