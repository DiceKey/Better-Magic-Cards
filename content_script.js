var anyReg      = new RegExp('(^| |\\()(c[:=!][wubrgcml]*[012345]+[wubrgcml]*|ci![wubrgc]+|cw[:=!][wubrg]+)');
var getDataReg  = new RegExp('(?:q=)(.+?)(?:$|&)');
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
      outStr = '(' + outStr + ' c:' + letStr + ')';
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

var form = document.getElementsByName("f")[0];
form.addEventListener('submit', fillQ, true);

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    switch (request.action){
      case 'fillQ':
        var q = document.getElementById('q');
        q.value = request.query;
        q.focus();
        sendResponse({text: "success"});
        break;
      case 'checkGET':
        var url     = request.url;
        var matches = url.match(getDataReg);
        if (matches[1] != null){
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
});