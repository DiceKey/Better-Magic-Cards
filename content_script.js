var getQueryReg = new RegExp('(?:[\\?&]q=)(.+?)(?:$|&)');
var getPageReg  = new RegExp('(?:[\\?&]p=)(\\d+)(?:$|&)');
var getViewReg  = new RegExp('(?:[\\?&]v=)([\\w]+)(?:$|&)');

var anyReg      = new RegExp('(^| |\\()(c[:=!][wubrgcml]*[012345]+[wubrgcml]*|ci![wubrgc]+|cw[:=!][wubrg]+)');
var cNumericReg = new RegExp('^\\(*c[:=!][wubrgcml]*[012345]+[wubrgcml]*\\)*');
var ciStrictReg = new RegExp('^\\(*ci![wubrgc]+\\)*');
var castWithReg = new RegExp('^\\(*cw[:=!][wubrg]+\\)*');
var equalityReg = new RegExp('[:=!><]');

var colorArr    = ['w', 'u', 'b', 'r', 'g'];

// Numeric Colors
function cNumeric(inStr){
  var outStr   = '';
  var modIdx   = inStr.indexOf('c') + 1;
  var parIdx   = inStr.indexOf(')') == -1 ? inStr.length : inStr.indexOf(')');
  var len      = parIdx - modIdx - 1;
  var inValues = inStr.substr(modIdx + 1, len);

  var letStr = '';
  var numArr = [];
  inValues.split('').every(function(ele1, idx1, arr1){
    switch (ele1){
      case '0':
        numArr.push('c:cl');
        break;
      case '1':
        numArr.push('(-c:m -c:cl)');
        break;
      case '2':
        numArr.push('(c!wum or c!wbm or c!wrm or c!wgm or c!ubm or c!urm or c!ugm or c!brm or c!bgm or c!rgm)');
        break;
      case '3':
        numArr.push('(c!wubm or c!wurm or c!wugm or c!wbrm or c!wbgm or c!wrgm or c!ubrm or c!ubgm or c!urgm or c!brgm)');
        break;
      case '4':
        numArr.push('(c!wubrm or c!ubrgm or c!brgwm or c!rgwum or c!gwubm)');
        break;
      case '5':
        numArr.push('(c!wubrgm)');
        break;
      default:
        letStr += ele1;
        break;
    }
    return true;
  });
  outStr = numArr.join(' or ');
  if (numArr.length > 1){
    outStr = '(' + outStr + ')';
  }
  if (letStr != ''){
    if (inStr[modIdx] == '!'){ 
      outArr = [];
      letStr.split('').every(function(ele, idx, arr){
        if (colorArr.indexOf(ele) != -1){
          outArr.push('c:' + ele);
        }
        return true;
      });
      outStr = '(' + outArr.join(' ') + ' ' + outStr + ')';
    }else{
      outStr = '(c:' + letStr + ' ' + outStr + ')';
    }
  }
  return outStr;
}

// Strict Color Identity
function ciStrict(inStr){
  if (inStr.match(ciStrictReg) != null){
    var outStr   = '';
    var modIdx   = inStr.indexOf('ci') + 2;
    var parIdx   = inStr.indexOf(')') == -1 ? inStr.length : inStr.indexOf(')');
    var len      = parIdx - modIdx - 1;
    var inColors = inStr.substr(modIdx + 1, len);
    if (len > 1){
      outArr  = ['ci:' + inColors];
      var combArr = combine(inColors.split(''), len - 1);
      combArr.every(function(ele1, idx1, arr1){
        ele1.every(function(ele2, idx2, arr2){
          outArr.push('-ci:' + ele2);
          return true;
        });
        return true;
      });
      
      outStr = '(' + outArr.join(' ') + ')';

      return outStr;
    }else if (inColors != 'c'){
      return 'ci:' + inColors + ' -ci:c';
    }else{
      return 'ci:c';
    }
  }
  return inStr;
}

// Cast With
function castWith(inStr){
  var outStr   = '';
  var modIdx   = inStr.indexOf('cw') + 2;
  var parIdx   = inStr.indexOf(')') == -1 ? inStr.length : inStr.indexOf(')');
  var len      = parIdx - modIdx - 1;
  var inColors = inStr.substr(modIdx + 1, len);

  if (inColors.length == 1){
    outStr = 'cmc>0 c:' + inColors;
    colorArr.every(function(ele, idx, arr){
      if (ele == inColors){
        outStr += ' (c!' + ele + ' or -mana:' + ele + ')';
      }else{
        outStr += ' -mana:' + ele;
      }
    });

    console.log(outStr)
  }else{
    var outArr = [];
    var incArr = [];
    colorArr.every(function(ele, idx, arr){
      if (inColors.indexOf(ele) != -1){
        incArr.push('c:' + ele);
        outArr.push('(-mana:' + ele + ' or c:' + inColors.replace(ele, '') + ')');
      }else{
        outArr.push('-mana:' + ele);
      }
      return true;
    });

    outStr = '(' + incArr.join(' or ');
    outStr += ' (' + outArr.join(' ') + ') cmc>0 -c:cl)';

  }

  if (inStr[modIdx] == '!'){
    outStr += ' -c!' + inColors;
  }
  return outStr;
}

function plainText(inStr){
  return '(' + inStr + ' or o:' + inStr +')';
}

// Find all combinations of a certain size using selected colors
function combine(elemArr, size){
  if (size == 1){
    return [elemArr];
  }else{
    var combArr  = combine(elemArr, size - 1);
    var lastComb = combArr[0];
    var currComb = [];
    lastComb.every(function(ele1, idx1, arr1){
      elemArr.every(function(ele2, idx2, arr2){
        if (ele1.indexOf(ele2) == -1){
          currComb.push(ele1 + ele2);
        }
        return true;
      });
      return true;
    });
    combArr.push(currComb);
    return combArr;
  }
}

// Parse and fill the search box
function fillQ(e){
  e.preventDefault();
  var oldQuery = q.value;
  var newQuery = parseQuery(oldQuery);
  chrome.storage.sync.set({'storedQuery': [oldQuery, newQuery]}, function(){
    q.value = newQuery;
    e.srcElement.submit();
  });
}

// Parse and transform the input string
function parseQuery(inStr){
  var outStr   = '';
  var curStr   = '';
  var isQuoted = false;
  var inStrLen = inStr.length;

  for (var i = 0; i < inStrLen; i++){
    if (inStr[i] == '(' || inStr[i] == ')' || inStr[i] == '-' || (inStr[i] == ' ' && isQuoted == false)){
      if (curStr != ''){
        outStr += parseChunk(curStr);
        curStr = '';
      }
      outStr += inStr[i];
    }else if (inStr[i] != ' '){
      curStr += inStr[i];

      if (inStr[i] == '"'){
        isQuoted = !isQuoted;
      }
    }
  }
  if (curStr != ''){
    outStr += parseChunk(curStr);
  }

  return outStr;
}

function parseChunk(inStr){
  if (inStr == 'or' || inStr == 'and'){
    return inStr;
  }else if (inStr.match(cNumericReg) != null){
    inStr = cNumeric(inStr);
  }else if (inStr.match(ciStrictReg) != null){
    inStr = ciStrict(inStr);
  }else if (inStr.match(castWithReg) != null){
    inStr = castWith(inStr);
  }else if (inStr.match(equalityReg) == null){
    inStr = plainText(inStr);
  }
  return inStr;
}

// Handle requests made by background/page_action scripts
function handleRequests(request, sender, sendResponse){
  switch (request.action){
    case 'fillQ':
      if (q !== null){
        q.value = request.query;
        q.focus();
      }else{
        chrome.storage.sync.set({'exampleQuery': request.query}, function(){
          location.replace('http://magiccards.info/');  
        });
      }
      sendResponse({text: 'success'});
      break;
    case 'checkGET':
      var reqURL  = request.url;
      var matches = reqURL.match(getQueryReg);
      if (matches != null){
        var oldQuery = matches[1];
        var newQuery = unescape(oldQuery);
        if (newQuery.match(anyReg) != null){
          newQuery = parseQuery(newQuery);
          newQuery = escape(newQuery);
          reqURL   = reqURL.replace(oldQuery, newQuery);
          chrome.storage.sync.set({'storedQuery': [oldQuery, newQuery]}, function(){
            location.replace(reqURL);
          });
        }
      }
      break;
    default:
      sendResponse({text: 'unrecognized action'});
      break;
  }
}


function loadNext(){
  errorDiv.style.display = 'none';
  if (currentPage * cardsPerPage < totalCards){
    // 'lock' the auto-pagination
    window.removeEventListener('scroll', checkForNextPage, true);

    // Increment the GET string and URL, for making the AJAX request
    // Only increment the page counter on success
    var oldPageStr = getPageStr;
    getPageStr = getPageStr.replace(currentPage, currentPage + 1);
    url = url.replace(oldPageStr, getPageStr);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(responseText){
      if (xhr.readyState == 4){
        if (xhr.status == 200){
          loadingDiv.style.display = 'none';

          // Remove elements for the sake of styling
          var tables = document.getElementsByTagName('table');
          var lTable = tables[tables.length - 1];
          lTable.parentNode.removeChild(lTable);
          var hrs    = document.getElementsByTagName('hr');
          var lhr    = hrs[hrs.length - 1];
          lhr.parentNode.removeChild(lhr);

          // Grab the useful parts of the response text
          var rText  = responseText.target.response;
          var rStart = rText.indexOf('<table border="0" cellpadding="0" cellspacing="0" width="100%">');
          var rEnd   = rText.indexOf('<br>\n<small style="color: #aaa;font-size: 0.6em;"');
          var rLen   = rEnd - rStart - 1;
          var nextPg = rText.substr(rStart, rLen);

          var newDiv  = document.createElement('div');
          newDiv.setAttribute('id', 'page' + currentPage);
          newDiv.innerHTML = nextPg;
          body.insertBefore(newDiv, loadingDiv);

          // Increment the currentPage, release the lock, and check if the user is already trying to load another page.
          currentPage ++;
          window.addEventListener('scroll', checkForNextPage, true);
          checkForNextPage();
        }else{
          loadingDiv.style.display = 'none';
          errorDiv.style.display = 'block';
        }
      }
    };

    xhr.send();
    loadingDiv.style.display = 'block';

  }else{
    // After reaching the end of the results, remove the event listener.
    window.removeEventListener('scroll', checkForNextPage, true);
  }
}

function checkForNextPage(){
  if (body.scrollTop < body.scrollHeight - 900){
    return;
  }else{
    loadNext();
  }
}

function prepAutoPage(){
  try{
    totalCards = parseInt(document.getElementsByTagName('table')[2].rows[0].cells[2].innerHTML);
  }catch (err){
    return;
  }

  // Identify page number
  var matches = url.match(getPageReg);
  if (matches !== null){
    getPageStr  = matches[0];
    currentPage = parseInt(matches[1]);
  }else{
    getPageStr  = '&p=1';
    currentPage = 1;
    url         += '&p=1';
  }

  // Identify the display mode, in order to determine how many cards are displayed on a single page
  cardsPerPage = 20;
  matches = url.match(getViewReg);
  if (matches !== null){
    vStr = matches[1];
    switch(vStr){
      case 'list':
      case 'olist':
        cardsPerPage = 1000;
        break;
      case 'scan':
        cardsPerPage = 15;
        break;
      case 'spoiler':
        cardsPerPage = 600;
        break;
      default:
        break;
    }
  }

  // Remove the second-to-last <br/> for styling reasons
  var brs  = document.getElementsByTagName('br');
  var slbr = brs[brs.length - 2];
  slbr.parentNode.removeChild(slbr);

  // Identify the disclaimer text, so we know where to put new elements
  var smallTexts = document.getElementsByTagName('small');
  var disclaimer = smallTexts[smallTexts.length - 1];

  errorDiv = document.createElement('div');
  errorDiv.setAttribute('id', 'errorDiv');
  errorDiv.setAttribute('style', 'display:none; width:100%; height:25px; text-align:center; cursor:pointer; color:blue;');
  errorDiv.innerHTML = "Sorry, looks like something went wrong. Click me to try again!";
  errorDiv.addEventListener('click', loadNext, true);
  body.insertBefore(errorDiv, disclaimer);

  loadingDiv = document.createElement('div');
  loadingDiv.setAttribute('id', 'loadingDiv');
  loadingDiv.setAttribute('style', 'display:none; width:100%; height:25px; text-align:center;');
  loadingDiv.innerHTML = "<img src='http://i.imgur.com/1760Kkd.gif' style='height:25px; width:25px;' />";
  body.insertBefore(loadingDiv, errorDiv);

  // Listen for scrolling, and check if the user is already at the bottom of the page
  window.addEventListener('scroll', checkForNextPage, true);
  checkForNextPage();
}

chrome.runtime.onMessage.addListener(handleRequests);

var q = document.getElementById('q');
if (q !== null){
  // if there is a stored query,
  // and it corresponds to the searchbox contents
  // then load in the stored query
  if (q.value == ''){
    chrome.storage.sync.get('exampleQuery', function(exampleQuery){
      if (exampleQuery !== null){
        chrome.storage.sync.set({'exampleQuery': ''}, function(){
          q.value = unescape(exampleQuery.exampleQuery);
          q.focus();
        });
      }
    });
  }else{
    chrome.storage.sync.get('storedQuery', function(storedQuery){
      if (storedQuery.storedQuery !== null){
        oldStoredQuery = unescape(storedQuery.storedQuery[0]).replace('+',' ');
        newStoredQuery = unescape(storedQuery.storedQuery[1]).replace('+',' ');
        if (q.value == newStoredQuery){
          q.value = oldStoredQuery;
          document.getElementsByTagName('title')[0].innerHTML = oldStoredQuery;
          q.focus();
        }
      }
    });
  }

  var body = document.getElementsByTagName('body')[0];

  var url  = window.location.href;
  if (url.match(getQueryReg) !== null){
    prepAutoPage();
  }

  var form = document.getElementsByName("f")[0];
  form.addEventListener('submit', fillQ, true);
}