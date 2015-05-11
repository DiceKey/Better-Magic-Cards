var anyReg      = new RegExp('(^| |\\()(c[:=!][wubrgcml]*[012345]+[wubrgcml]*|ci![wubrgc]+|cw[:=!][wubrg]+)');
var getQueryReg = new RegExp('(?:[\\?&]q=)(.+?)(?:$|&)');
var getPageReg  = new RegExp('(?:[\\?&]p=)(\\d+)(?:$|&)');
var getViewReg  = new RegExp('(?:[\\?&]v=)([\\w]+)(?:$|&)');

var cNumericReg = new RegExp('^\\(*c[:=!][wubrgcml]*[012345]+[wubrgcml]*\\)*');
var ciStrictReg = new RegExp('^\\(*ci![wubrgc]+\\)*');
var castWithReg = new RegExp('^\\(*cw[:=!][wubrg]+\\)*');
var colorArr    = ['w', 'u', 'b', 'r', 'g'];

function cNumeric(inStr){
  if (inStr.match(cNumericReg) != null){
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
  }else{
    return inStr;
  }
}

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
    }else{
      return inStr + ' -ci:c';
    }
  }
  return inStr;
}

function castWith(inStr){
  if (inStr.match(castWithReg) != null){
    var outStr   = '';
    var modIdx   = inStr.indexOf('cw') + 2;
    var parIdx   = inStr.indexOf(')') == -1 ? inStr.length : inStr.indexOf(')');
    var len      = parIdx - modIdx - 1;
    var inColors = inStr.substr(modIdx + 1, len);

    var outArr = [];
    var incArr = [];
    colorArr.every(function(ele, idx, arr){
      if (inColors.indexOf(ele) != -1){
        incArr.push('c:' + ele);
      }else{
        outArr.push('-mana>=' + ele);
      }
      return true;
    });

    outStr = '(' + incArr.join(' or ');
    if (inStr[modIdx] == '!'){
      outStr += ' -c!' + inColors;
    }
    outStr += ' (' + outArr.join(' ') + '))';

    return outStr;
  }else{
    return inStr;
  }
}

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

function fillQ(){
  q.value = parseQuery(q.value);
}

function parseQuery(queryStr){
  var orArr = queryStr.split('or');
  orArr.every(function(ele1, idx1, arr1){
    var spArr = ele1.split(' ');
    spArr.every(function(ele2, idx2, arr2){
      if (ele2 != '' && ele2 != '(' && ele2 != ')'){
        ele2 = cNumeric(ele2);
        ele2 = ciStrict(ele2);
        ele2 = castWith(ele2);
        arr2[idx2] = ele2;
      }

      return true;
    });

    arr1[idx1] = spArr.join(' ');
    return true;
  });
  queryStr = orArr.join('or');
  return queryStr;
}

function handleRequests(request, sender, sendResponse){
    switch (request.action){
      case 'fillQ':
        var q = document.getElementById('q');
        q.value = request.query;
        q.focus();
        sendResponse({text: "success"});
        break;
      case 'checkGET':
        var url     = request.url;
        var matches = url.match(getQueryReg);
        if (matches != null){
          var queryGet = matches[1];
          var queryStr = unescape(queryGet);
          if (queryStr.match(anyReg) != null){
            queryStr = parseQuery(queryStr);
            queryStr = escape(queryStr);
            url = url.replace(queryGet, queryStr);
            location.replace(url);
          }
        }
        break;
      default:
        sendResponse({text: "unrecognized action"});
        break;
    }
}


function constructAutoPage(){
  var body = document.getElementsByTagName('body')[0];
  var bodyHeight = body.scrollHeight;

  var smallTexts = document.getElementsByTagName('small');
  var disclaimer = smallTexts[smallTexts.length - 1];
  disclaimer.setAttribute('id', 'disclaimer');

  var url  = window.location.href;
  var matches = url.match(getPageReg);
  if (matches !== null){
    getPageStr  = matches[0];
    currentPage = parseInt(matches[1]);
  }else{
    getPageStr  = '&p=1';
    currentPage = 1;
    url   += '&p=1';
  }

  var cardsPerPage = 20;
  var matches = url.match(getViewReg);
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

  var tables = document.getElementsByTagName('table');
  var pTable = tables[2];
  //var nextLink   = pTable.getElementsByTagName('a')[0];
  //nextLink.addEventListener('click', loadNext, true);
  var totalCards = parseInt(pTable.rows[0].cells[2].innerHTML);

  var output = {
    url:          url,
    currentPage:  currentPage,
    getPageStr:   getPageStr,
    cardsPerPage: cardsPerPage,
    totalCards:   totalCards,
    divHeight:    bodyHeight,
    disclaimer:   disclaimer,
    parentDiv:    body,
    autoPage:     function(){
      if (this.currentPage * this.cardsPerPage < this.totalCards){
        oldPageStr = this.getPageStr;
        this.getPageStr = this.getPageStr.replace(this.currentPage, this.currentPage + 1)
        this.url = this.url.replace(oldPageStr, this.getPageStr);
        this.currentPage ++;

        var parentDiv   = this.parentDiv;
        var currentPage = this.currentPage;
        var disclaimer  = this.disclaimer;
        // var getPageStr  = this.getPageStr;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', this.url, true);
        xhr.onload = function(responseText){
          var tables = document.getElementsByTagName('table');
          var lTable = tables[tables.length - 1];
          var hrs    = document.getElementsByTagName('hr');
          var lhr    = hrs[hrs.length - 1];
          var brs    = document.getElementsByTagName('br');
          var slbr   = brs[brs.length - 2];

          lTable.parentNode.removeChild(lTable);
          lhr.parentNode.removeChild(lhr);
          slbr.parentNode.removeChild(slbr);

          var rText  = responseText.target.response;
          var rStart = rText.indexOf('<table border="0" cellpadding="0" cellspacing="0" width="100%">');
          var rEnd   = rText.indexOf('<small style="color: #aaa;font-size: 0.6em;"');
          var rLen   = rEnd - rStart - 1;
          var nextPg = rText.substr(rStart, rLen);

          var newDiv  = document.createElement('div');
          newDiv.setAttribute('id', 'page' + currentPage);
          newDiv.innerHTML = nextPg;

          body.insertBefore(newDiv, disclaimer);
          parentDiv = newDiv;

          // var tables   = newDiv.getElementsByTagName('table');
          // var pTable   = tables[0];
          // var nextLink = pTable.getElementsByTagName('a')[0];
          // nextLink.addEventListener('click', loadNext, true);
        };
        xhr.send();

        this.parentDiv = parentDiv;
      }else{
        window.removeEventListener('scroll', onScroll, true);
      }
    }
  };

  return output;
}

function onScroll(){
  var body = document.getElementsByTagName('body')[0];
  if (body.scrollTop < body.scrollHeight - 800){
    return;
  }

  Paginator.autoPage();
}

// function loadNext(e){
//   e.preventDefault();
//   Paginator.autoPage();
//   var nextPage = document.getElementById('disclaimer');
//   nextPage.scrollIntoView();  
// }

chrome.runtime.onMessage.addListener(handleRequests);

var form = document.getElementsByName("f")[0];
form.addEventListener('submit', fillQ, true);

var Paginator = constructAutoPage();
window.addEventListener('scroll', onScroll, true);
onScroll();