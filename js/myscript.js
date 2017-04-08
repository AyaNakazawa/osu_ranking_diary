
// グローバル変数
var localStorageFlg = true;

var initializeStatus = 0;
var loadingStatus = true;
var diffStatus = true;
var loadRankingStatus = 0;

var dateList = [];

var rankingMode = "std";

var initDate;
var initDate2;
var exitDate2;
var exitDate;

var initRank;
var exitRank;

var initRanking = new Array();
var exitRanking = new Array();

var initPlayer = new Array();
var exitPlayer = new Array();


// 定数
LOCAL_STORAGE_HISTORY_KEY = "osuRankingDiaryHistoryV1";
LOCAL_STORAGE_MODE_KEY = "osuRankingDiaryMode";

$(function() {
  
  // ----------------------------------------------------------------
  // 初期化
  initializeORD();
  
  $(document).ajaxSuccess(function() {
    console.log("initializeStatus: " + initializeStatus + ", loadRankingStatus: " + loadRankingStatus);
    if (initializeStatus === 1) {
      initializeORD();
      
    } else if (initializeStatus === 2) {
      if (loadRankingStatus === 0) {
        buildRanking();
        
      }
    }
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージ対応判定
  if(!localStorage) {
    console.log('"Local Storage" is unsupported. Data can not be saved.');
    console.log('"ローカルストレージ"機能に対応していません。データを保存することができません。');
    
    localStorageFlg = false;
    
    $("#action-save").remove();
    $("#action-load").remove();
    $("#action-reset").remove();
  }
  
  // ----------------------------------------------------------------
  // トップまでのスクロール
  $(document).on('click', '#pagetop', function() {
    console.log("Scroll to Top");
    $('body,html').animate({scrollTop:0}, 500);
  });
  
  // ----------------------------------------------------------------
  // タイトル
  $(document).on('click', '#title', function() {
    console.log("Click Title");
    
    location.reload();
    
  });
  
  // ----------------------------------------------------------------
  // モード切替
  $(document).on('click', '.action-mode', function() {
    console.log("Click Mode action: " + $(this).attr("data-mode"));
    
    changeMode(this);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージに保存
  $(document).on('click', '#action-save', function() {
    console.log("Click Save action");
    updateHistory();
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージの履歴リスト
  $(document).on('click', '#action-load-header', function() {
    console.log("Click Load header action");
    
    $('#action-load-list').empty();
    
    var arrayOfHistory = getHistory();
    
    if (arrayOfHistory.length > 0){
      $(arrayOfHistory).each(function() {
        // console.log(this);
        if (this["diff"] === "true") {
          $('#action-load-list').append(
            '<li class="action-load-item" ' +
            'data-mode="' + this["mode"] + '" ' +
            'data-diff="' + this["diff"] + '" ' +
            'data-initDate="' + this["initDate"] + '" ' +
            'data-exitDate="' + this["exitDate"] + '" ' +
            'data-initRank="' + this["initRank"] + '" ' +
            'data-exitRank="' + this["exitRank"] + '"><a>' +
            this["mode"] + ', DATE:' + 
            this["initDate"].substr(5, 2) + '/' + this["initDate"].substr(8) + '~' + 
            this["exitDate"].substr(5, 2) + '/' + this["exitDate"].substr(8) + ', RANK:' + 
            this["initRank"] + '~' + 
            this["exitRank"] + '</a></li>'
          );
        } else if (this["diff"] === "false") {
          $('#action-load-list').append(
            '<li class="action-load-item" ' +
            'data-mode="' + this["mode"] + '" ' +
            'data-diff="' + this["diff"] + '" ' +
            'data-exitDate="' + this["exitDate"] + '" ' +
            'data-initRank="' + this["initRank"] + '" ' +
            'data-exitRank="' + this["exitRank"] + '"><a>' +
            this["mode"] + ', DATE:' + 
            this["exitDate"].substr(5, 2) + '/' + this["exitDate"].substr(8) + ', RANK:' + 
            this["initRank"] + '~' + 
            this["exitRank"] + '</a></li>'
          );
        }
        
      });
    } else {
      $('#action-load-list').append('<li class="action-load-item-none"><a>Nothing</a></li>');
    }
    
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージの履歴項目
  $(document).on('click', '.action-load-item', function() {
    console.log("Click History item action");
    
    modeLocal = $(this).attr("data-mode");
    diffLocal = $(this).attr("data-diff");
    initDateLocal = $(this).attr("data-initDate");
    exitDateLocal = $(this).attr("data-exitDate");
    initRankLocal = $(this).attr("data-initRank");
    exitRankLocal = $(this).attr("data-exitRank");
    
    rankingMode = modeLocal;
    
    changeMode($("#action-" + rankingMode));
    
    if (diffLocal === "true") {
      changeViewDiff(null, true);
      
    } else {
      changeViewDiff(null, false);
      
    }
    
    $("#init-date").val(initDateLocal);
    $("#exit-date").val(exitDateLocal);
    $("#init-rank").val(initRankLocal);
    $("#exit-rank").val(exitRankLocal);
    
    updateHistory();
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージを初期化
  $(document).on('click', '#action-reset', function() {
    console.log("Click Reset action");
    
    showConfirmDialog("ローカルストレージの初期化", "<p>ローカルストレージに保存されている内容を全て初期化します。<br>よろしいですか？</p>", initializeLocalStorage)
  });
  
  // ----------------------------------------------------------------
  // View difference columnを変更
  $(document).on("change", "#view-column", function() {
    console.log("Change View difference column: " + $(this).prop("checked"));
    
    changeViewDiff(this, null);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // init-date を変更
  $(document).on("change", "#init-date", function() {
    console.log("Change Init date: " + $(this).val());
    fixRankDate(0);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // exit-date を変更
  $(document).on("change", "#exit-date", function() {
    console.log("Change Exit date: " + $(this).val());
    fixRankDate(1);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // init-rank を変更
  $(document).on("change", "#init-rank", function() {
    console.log("Change Init rank: " + $(this).val());
    fixRank(0);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // exit-rank を変更
  $(document).on("change", "#exit-rank", function() {
    console.log("Change Exit rank: " + $(this).val());
    fixRank(1);
    
    loadRanking();
    
  });
  
  // ----------------------------------------------------------------
  // type-name をクリック
  $(document).on("click", ".type-name", function() {
    console.log("Click User name: user ID: " + $(this).attr("data-user-id"));
    window.open("https://osu.ppy.sh/u/" + $(this).attr("data-user-id"), "_blank");
    
  });
  
});

// ----------------------------------------------------------------
// Functions

// ----------------------------------------------------------------
// osu! Ranking Diary 初期化
function initializeORD(){
  
  switch (initializeStatus) {
    case 0:
      // ajax
      searchDateList();
      
      break;
    case 1:
      
      rankingMode = localStorage.getItem(LOCAL_STORAGE_MODE_KEY) || rankingMode;
      
      $(".action-mode").each(function(i, element) {
        $(element).removeClass("current-mode");
      })
      $("#action-" + rankingMode).addClass("current-mode");
      
      $("#init-date").val(initDate);
      $("#exit-date").val(exitDate);
      $("#init-rank").val(1);
      $("#exit-rank").val(100);
      
      // ランキングデータが1日分しかないときは変動を表示できないようにする
      if (initDate === exitDate) {
        changeViewDiff(null, false);
        $("#setting-view-column-area").addClass("display-none");
      }
      
      // tooltip をつける
      
      $("#view-column-label").tooltip({placement: "left"});
      
      $("#init-date").attr("title", "" + initDate + " ～ " + exitDate2);
      $("#exit-date").attr("title", "" + initDate + " ～ " + exitDate);
      
      $("#init-date").tooltip();
      $("#exit-date").tooltip();
      
      $("#init-rank").tooltip();
      $("#exit-rank").tooltip();
      
      loadRanking();
      
      break;
  }
  
  initializeStatus++;
  
}

// ----------------------------------------------------------------
// ランキングを生成
function buildRanking() {
  console.log("Ranking building...");
  
  $("tbody").empty();
  
  var tr;

  var tdRank;
  var tdName;
  var tdAcc;
  var tdPlay;
  var tdBP;
  var tdBonus;
  var tdPP;
  var tdSS;
  var tdS;
  var tdA;
  var tdSSA;
  
  var tdArrow = '<td class="direction-arrow display-none"></td>';
  var tdDiffRank = '<td class="change-value type-int display-none"></td>';
  var tdDiffPPAbove = '<td class="difference-of-above display-none"></td>';
  var tdDiffAcc = '<td class="change-value type-percentage display-none"></td>';
  var tdDiffPlay = '<td class="change-value type-int display-none"></td>';
  var tdDiffBP = '<td class="change-value type-int display-none"></td>';
  var tdDiffBonus = '<td class="change-value type-float display-none"></td>';
  var tdDiffPP = '<td class="change-value type-int display-none"></td>';
  var tdDiffSS = '<td class="change-value type-int display-none"></td>';
  var tdDiffS = '<td class="change-value type-int display-none"></td>';
  var tdDiffA = '<td class="change-value type-int display-none"></td>';
  var tdDiffSSA = '<td class="change-value type-int display-none"></td>';
  
  for (var i = initRank - 1; i <= exitRank - 1; i++) {
    
    var ssaLocalExit = 1 * exitRanking[exitPlayer[i]][5] + exitRanking[exitPlayer[i]][6] + exitRanking[exitPlayer[i]][7];
    // 416.6667 (1- 0.9994^Number_of_scores)
    var bonusLocalExit = 416.6667 * (1 - Math.pow(0.9994, ssaLocalExit));
    var bpLocalExit = Math.floor(1 * exitRanking[exitPlayer[i]][4] - bonusLocalExit);
    
    tdRank = '<td class="current-value type-rank">#' + exitRanking[exitPlayer[i]][0].toLocaleString() + '</td>';
    tdName = '<td class="current-value type-string type-name" data-user-id="' + exitRanking[exitPlayer[i]][8] + '">' + exitRanking[exitPlayer[i]][1] + '</td>';
    tdAcc = '<td class="current-value type-percentage">' + exitRanking[exitPlayer[i]][2].toFixed(2) + '%</td>';
    tdPlay = '<td class="current-value type-int">' + exitRanking[exitPlayer[i]][3].toLocaleString() + '</td>';
    tdBP = '<td class="current-value type-int">' + bpLocalExit.toLocaleString() + '</td>';
    tdBonus = '<td class="current-value type-float">' + bonusLocalExit.toFixed(3).toLocaleString() + '</td>';
    tdPP = '<td class="current-value type-int">' + exitRanking[exitPlayer[i]][4].toLocaleString() + '</td>';
    tdSS = '<td class="current-value type-int">' + exitRanking[exitPlayer[i]][5].toLocaleString() + '</td>';
    tdS = '<td class="current-value type-int">' + exitRanking[exitPlayer[i]][6].toLocaleString() + '</td>';
    tdA = '<td class="current-value type-int">' + exitRanking[exitPlayer[i]][7].toLocaleString() + '</td>';
    tdSSA = '<td class="current-value type-int">' + ssaLocalExit.toLocaleString() + '</td>';
    
    if (diffStatus) {
      
      var arrowLocal = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';
      var diffRankLocal = '+' + (1001 - exitRanking[exitPlayer[i]][0]) + '~';
      var diffPPAboveLocal;
      var diffAccLocal = "";
      var diffPlayLocal = "";
      var diffBPLocal = "";
      var diffBonusLocal = "";
      var diffPPLocal = "";
      var diffSSLocal = "";
      var diffSLocal = "";
      var diffALocal = "";
      var diffSSALocal = "";
      
      if (initRanking[exitPlayer[i]] != null) {
        var ssaLocalInit = 1 * initRanking[exitPlayer[i]][5] + initRanking[exitPlayer[i]][6] + initRanking[exitPlayer[i]][7];
        var bonusLocalInit = 416.6667 * (1 - Math.pow(0.9994, ssaLocalInit));
        var bpLocalInit = Math.floor(1 * initRanking[exitPlayer[i]][4] - bonusLocalInit);
        
        arrowLocal = "";
        diffRankLocal = initRanking[exitPlayer[i]][0] - exitRanking[exitPlayer[i]][0];
        diffPPAboveLocal = "";
        diffAccLocal = exitRanking[exitPlayer[i]][2] - initRanking[exitPlayer[i]][2];
        diffPlayLocal = exitRanking[exitPlayer[i]][3] - initRanking[exitPlayer[i]][3];
        diffBPLocal = bpLocalExit - bpLocalInit;
        diffBonusLocal = bonusLocalExit - bonusLocalInit;
        diffPPLocal = exitRanking[exitPlayer[i]][4] - initRanking[exitPlayer[i]][4];
        diffSSLocal = exitRanking[exitPlayer[i]][5] - initRanking[exitPlayer[i]][5];
        diffSLocal = exitRanking[exitPlayer[i]][6] - initRanking[exitPlayer[i]][6];
        diffALocal = exitRanking[exitPlayer[i]][7] - initRanking[exitPlayer[i]][7];
        diffSSALocal = ssaLocalExit - ssaLocalInit;
        
        if (diffRankLocal === 0) {
          arrowLocal = '<i class="fa fa-arrow-right" aria-hidden="true"></i>';
          diffRankLocal = "";
        } else if (diffRankLocal > 0) {
          arrowLocal = '<i class="fa fa-arrow-up" aria-hidden="true"></i>';
          diffRankLocal = "+" + diffRankLocal.toLocaleString();
        } else if (diffRankLocal < 0) {
          arrowLocal = '<i class="fa fa-arrow-down" aria-hidden="true"></i>';
        }
        
        if (diffAccLocal > 0) {
          diffAccLocal = "+" + diffAccLocal.toFixed(2) + "%";
        } else {
          diffAccLocal = diffAccLocal.toFixed(2) + "%";
        }
        if (diffPlayLocal > 0) {
          diffPlayLocal = "+" + diffPlayLocal.toLocaleString();
        } else {
          diffPlayLocal = diffPlayLocal.toLocaleString();
        }
        if (diffBPLocal > 0) {
          diffBPLocal = "+" + diffBPLocal.toLocaleString();
        } else {
          diffBPLocal = diffBPLocal.toLocaleString();
        }
        if (diffBonusLocal > 0) {
          diffBonusLocal = "+" + diffBonusLocal.toFixed(3).toLocaleString();
        } else {
          diffBonusLocal = diffBonusLocal.toFixed(3).toLocaleString();
        }
        if (diffPPLocal > 0) {
          diffPPLocal = "+" + diffPPLocal.toLocaleString();
        } else {
          diffPPLocal = diffPPLocal.toLocaleString();
        }
        if (diffSSLocal > 0) {
          diffSSLocal = "+" + diffSSLocal.toLocaleString();
        } else {
          diffSSLocal = diffSSLocal.toLocaleString();
        }
        if (diffSLocal > 0) {
          diffSLocal = "+" + diffSLocal.toLocaleString();
        } else {
          diffSLocal = diffSLocal.toLocaleString();
        }
        if (diffALocal > 0) {
          diffALocal = "+" + diffALocal.toLocaleString();
        } else {
          diffALocal = diffALocal.toLocaleString();
        }
        if (diffSSALocal > 0) {
          diffSSALocal = "+" + diffSSALocal.toLocaleString();
        } else {
          diffSSALocal = diffSSALocal.toLocaleString();
        }
      }
      // pp above
      if (i === initRank - 1) {
        diffPPAboveLocal = "TOP";
      } else {
        diffPPAboveLocal = exitRanking[exitPlayer[i]][4] - exitRanking[exitPlayer[i - 1]][4];
        diffPPAboveLocal = diffPPAboveLocal.toLocaleString();
      }
      
      tdArrow = '<td class="direction-arrow">' + arrowLocal + '</td>';
      tdDiffRank = '<td class="change-value type-int">' + diffRankLocal + '</td>';
      tdDiffPPAbove = '<td class="difference-of-above">' + diffPPAboveLocal + '</td>';
      tdDiffAcc = '<td class="change-value type-percentage">' + diffAccLocal + '</td>';
      tdDiffPlay = '<td class="change-value type-int">' + diffPlayLocal + '</td>';
      tdDiffBP = '<td class="change-value type-int">' + diffBPLocal + '</td>';
      tdDiffBonus = '<td class="change-value type-float">' + diffBonusLocal + '</td>';
      tdDiffPP = '<td class="change-value type-int">' + diffPPLocal + '</td>';
      tdDiffSS = '<td class="change-value type-int">' + diffSSLocal + '</td>';
      tdDiffS = '<td class="change-value type-int">' + diffSLocal + '</td>';
      tdDiffA = '<td class="change-value type-int">' + diffALocal + '</td>';
      tdDiffSSA = '<td class="change-value type-int">' + diffSSALocal + '</td>';
      
    }
    
    tr = '<tr>';
    tr += tdArrow;
    tr += tdDiffRank;
    tr += tdRank;
    tr += tdName;
    tr += tdDiffPPAbove;
    tr += tdDiffAcc;
    tr += tdAcc;
    tr += tdDiffPlay;
    tr += tdPlay;
    tr += tdDiffBP;
    tr += tdBP;
    tr += tdDiffBonus;
    tr += tdBonus;
    tr += tdDiffPP;
    tr += tdPP;
    tr += tdDiffSS;
    tr += tdSS;
    tr += tdDiffS;
    tr += tdS;
    tr += tdDiffA;
    tr += tdA;
    tr += tdDiffSSA;
    tr += tdSSA;
    tr += '</tr>';
    
    $("tbody").append(tr);
    
  }
  
  // Loading を解除する
  toggleLoading();
  
}
  
// ----------------------------------------------------------------
// ランキングを読み込み
// ajax
function loadRanking() {
  console.log("Ranking loading...");
  
  loadRankingStatus = 0;
  
  // Loading にする
  if (!loadingStatus) {
    toggleLoading();
    
  }
  
  if (diffStatus) {
    console.log("init ranking loading...");
    getRanking($("#init-date").val(), 1 * $("#init-rank").val(), 1 * $("#exit-rank").val());
    
  }
  
  console.log("exit ranking loading...");
  getRanking($("#exit-date").val(), 1 * $("#init-rank").val(), 1 * $("#exit-rank").val());
  
} 

// ----------------------------------------------------------------
// ランキングをファイルから取得
function getRanking(_date, _initRank, _exitRank) {
  var dateLocal = _date || getDateString(new Date(), "%Y-%m-%d");
  var initRankLocal = 1 * _initRank || initRank;
  var exitRankLocal = 1 * _exitRank || exitRank;
  
  initRank = initRankLocal;
  exitRank = exitRankLocal;
  
  dateLocal = new Date(dateLocal);
  
  initJsonId = Math.floor((initRankLocal - 1) / 50) + 1;
  exitJsonId = Math.floor((exitRankLocal - 1) / 50) + 1;
  diffJsonId = exitJsonId - initJsonId;
  
  loadRankingStatus += diffJsonId + 1;
  
  for (var jsonId = initJsonId; jsonId <= exitJsonId; jsonId++) {
    var rankingFileName = 'rank_data/';
    rankingFileName += getDateString(dateLocal, "%Y/%m/%d");
    rankingFileName += "/" + rankingMode;
    rankingFileName += "/ranking-" + jsonId + ".json";
    
    $.getJSON(rankingFileName, function(_json, _textStatus) {
      // console.log(_json);
      // console.log("_textStatus: " + _textStatus);
      
      var dateSwitch = true;
      if (_json["date"] === $("#init-date").val()) {
        dateSwitch = true;
      } else if (_json["date"] === $("#exit-date").val()) {
        dateSwitch = false;
      }
      
      if (dateSwitch != null) {
        $(Object.keys(_json)).each(function(i, playerKey) {
          if (i === 0) {
            return true;
          }
          
          var rankLocal = 1 * _json[playerKey]["rank"];
          var nameLocal = _json[playerKey]["name"];
          var accLocal = 1 * _json[playerKey]["acc"];
          var playLocal = 1 * _json[playerKey]["play"];
          var ppLocal = 1 * _json[playerKey]["pp"];
          var ssLocal = 1 * _json[playerKey]["ss"];
          var sLocal = 1 * _json[playerKey]["s"];
          var aLocal = 1 * _json[playerKey]["a"];
          var idLocal = _json[playerKey]["id"];
          
          var player = [];
          player.push(rankLocal);
          player.push(nameLocal);
          player.push(accLocal);
          player.push(playLocal);
          player.push(ppLocal);
          player.push(ssLocal);
          player.push(sLocal);
          player.push(aLocal);
          player.push(idLocal);
          
          if (dateSwitch) {
            initRanking["" + idLocal] = player;
            initPlayer[rankLocal - 1] = "" + idLocal;
          } else {
            exitRanking["" + idLocal] = player;
            exitPlayer[rankLocal - 1] = "" + idLocal;
          }
        });
        
        loadRankingStatus--;
      }
    });
  }
}

// ----------------------------------------------------------------
// rankingMode を変更
function changeMode(_element) {
  
  modeElement = _element || $("#action-std");
  
  $(".action-mode").each(function(i, element) {
    $(element).removeClass("current-mode");
  })
  $(modeElement).addClass("current-mode");
  rankingMode = $(modeElement).attr("data-mode");
  localStorage.setItem(LOCAL_STORAGE_MODE_KEY, rankingMode);
}

// ----------------------------------------------------------------
// diffStatus を変更
function changeViewDiff(_element, _diffStatus) {
  
  checkElement = _element || $("#view-column");
  
  var checkViewColumn;
  
  if (_diffStatus === null) {
    diffStatus = toggleBoolean(diffStatus);
    checkViewColumn = $(checkElement).prop("checked");
    
  } else {
    diffStatus = _diffStatus
    checkViewColumn = diffStatus;
    
    $(checkElement).prop("checked", diffStatus);
    
  }
  
  if (checkViewColumn) {
    // 変動を表示
    $("#setting-date-area > #difference-date").removeClass("display-none");
    $("#exit-date").attr("min", initDate2);
    fixRankDate(0);
    
  } else {
    // 変動を非表示
    $("#setting-date-area > #difference-date").addClass("display-none");
    $("#exit-date").attr("min", initDate);
    
  }
  
  $(".change-value, .difference-of-above, .direction-arrow").each(function(i, element) {
    if (checkViewColumn) {
      $(element).removeClass("display-none");
      
    } else {
      $(element).addClass("display-none");
      
    }
  });
  
}

// ----------------------------------------------------------------
// 日付一覧を取得
function searchDateList(){
  $.ajax({
    url: "ruby/getRankListDates.rb",
    success: function(data, dataType) {
      var i = 0;
      
      // グローバル変数に改行区切りで分割して、最後の空白削除
      dateList = data.split('\n');
      dateList.pop();
      
      // 日付リスト回す
      $(dateList).each(function(i, date) {
        dateList[i] = date.trim();
        date = dateList[i];
        // console.log("dateList: " + i + "/" + dateList.length + ": " + date);
        
        if (i === 0) {
          initDate = date;
          initDate2 = initDate2 || date;
        }
        if (i === 1) {
          initDate2 = date;
        }
        if (i === dateList.length - 2) {
          exitDate2 = date;
        }
        if (i === dateList.length - 1) {
          exitDate = date;
          exitDate2 = exitDate2 || date;
        }
        
      });
      
      $("#init-date").attr("min", initDate);
      $("#exit-date").attr("min", initDate2);
      $("#init-date").attr("max", exitDate2);
      $("#exit-date").attr("max", exitDate);
      
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error: ajax: " + textStatus);
    }
  });

}

// ----------------------------------------------------------------
// 日付を変更したとき、もう一方の日付を修正
function fixRankDate(_id) {
  // 日付が許容値を超えていたら修正
  var initDateValLocal = $("#init-date").val();
  var initDateMaxLocal = $("#init-date").attr("max");
  var initDateMinLocal = $("#init-date").attr("min");
  var exitDateValLocal = $("#exit-date").val();
  var exitDateMaxLocal = $("#exit-date").attr("max");
  var exitDateMinLocal = $("#exit-date").attr("min");
  
  if (initDateValLocal > initDateMaxLocal) {
    $("#init-date").val($("#init-date").attr("max"));
  }
  if (initDateValLocal < initDateMinLocal) {
    $("#init-date").val($("#init-date").attr("min"));
  }
  
  if (exitDateValLocal > exitDateMaxLocal) {
    $("#exit-date").val($("#exit-date").attr("max"));
  }
  if (exitDateValLocal < exitDateMinLocal) {
    $("#exit-date").val($("#exit-date").attr("min"));
  }
  
  // もう一方の日付を超えたとき、もう一方を修正
  if (diffStatus) {
    var initDateLocal = new Date($("#init-date").val());
    var exitDateLocal = new Date($("#exit-date").val());
    
    if (initDateLocal >= exitDateLocal) {
      if (_id === 0) {
        initDateLocal.setDate(initDateLocal.getDate() + 1);
        $("#exit-date").val(getDateString(initDateLocal, "%Y-%m-%d"));
      } else if (_id === 1) {
        exitDateLocal.setDate(exitDateLocal.getDate() - 1);
        $("#init-date").val(getDateString(exitDateLocal, "%Y-%m-%d"));
      }
    }
  }
  
}

// ----------------------------------------------------------------
// ランクを変更したとき、もう一方のランクを修正
function fixRank(_id) {
  // ランクが許容値を超えていたら修正
  var initRankValLocal = 1 * $("#init-rank").val();
  var initRankMaxLocal = 1 * $("#init-rank").attr("max");
  var initRankMinLocal = 1 * $("#init-rank").attr("min");
  var exitRankValLocal = 1 * $("#exit-rank").val();
  var exitRankMaxLocal = 1 * $("#exit-rank").attr("max");
  var exitRankMinLocal = 1 * $("#exit-rank").attr("min");
  
  if (initRankValLocal > initRankMaxLocal) {
    $("#init-rank").val($("#init-rank").attr("max"));
    console.log("teetetet");
  }
  if (initRankValLocal < initRankMinLocal) {
    $("#init-rank").val($("#init-rank").attr("min"));
    console.log("teetetet");
  }
  
  if (exitRankValLocal > exitRankMaxLocal) {
    $("#exit-rank").val($("#exit-rank").attr("max"));
    console.log("teetetet");
  }
  if (exitRankValLocal < exitRankMinLocal) {
    $("#exit-rank").val($("#exit-rank").attr("min"));
    console.log("teetetet");
  }
  
  // もう一方のランクを超えたとき、もう一方を修正
  initRankValLocal = 1 * $("#init-rank").val();
  exitRankValLocal = 1 * $("#exit-rank").val();
  if (initRankValLocal >= exitRankValLocal) {
    if (_id === 0) {
      $("#exit-rank").val((initRankValLocal + 1).toString());
    } else if (_id === 1) {
      $("#init-rank").val((exitRankValLocal - 1).toString());
    }
  }
  
}

// ----------------------------------------------------------------
// Loading表記の切り替え
// _status: 
//  true: loading
//  false: main
function toggleLoading(_status){
  if (_status === null) {
    loadingStatus = _status;
    
  } else {
    loadingStatus = toggleBoolean(loadingStatus);
    
  }
  
  if (loadingStatus) {
    $("#loading").removeClass("display-none");
    $("#main").addClass("display-none");
    
  } else {
    $("#main").removeClass("display-none");
    $("#loading").addClass("display-none");
    
  }
}

// ----------------------------------------------------------------
// Dateオブジェクトからゼロ埋めした日付文字列を生成
// _date: new Date()
//  Dateオブジェクト
// _format: '%Y/%m/%d %H:%M:%S'
//  %Y: 年4桁
//  %y: 年2桁
//  %m: 月
//  %d: 日
//  %H: 時
//  %M: 分
//  %S: 秒
function getDateString(_date, _format){
  var date = _date || new Date();
  var dateString = _format || '%Y/%m/%d %H:%M:%S';
  
  if (dateString.indexOf('%Y') >= 0) {
    dateString = dateString.replace('%Y', ("000" + _date.getFullYear()).slice(-4));
  }
  if (dateString.indexOf('%y') >= 0) {
    dateString = dateString.replace('%y', ("0" + _date.getFullYear()).slice(-2));
  }
  if (dateString.indexOf('%m') >= 0) {
    dateString = dateString.replace('%m', ("0" + (_date.getMonth() + 1)).slice(-2));
  }
  if (dateString.indexOf('%d') >= 0) {
    dateString = dateString.replace('%d', ("0" + _date.getDate()).slice(-2));
  }
  if (dateString.indexOf('%H') >= 0) {
    dateString = dateString.replace('%H', ("0" + _date.getHours()).slice(-2));
  }
  if (dateString.indexOf('%M') >= 0) {
    dateString = dateString.replace('%M', ("0" + _date.getMinutes()).slice(-2));
  }
  if (dateString.indexOf('%S') >= 0) {
    dateString = dateString.replace('%S', ("0" + _date.getSeconds()).slice(-2));
  }
  return dateString;
}

// ----------------------------------------------------------------
// ローカルストレージの初期化
function initializeLocalStorage(_initializeFlg) {
  
  // var initializeFlg = _initializeFlg || true;
  // で初期値与えようとすると false がきたとき true を持ってくるから使えない

  var initializeFlg = _initializeFlg;
  if (initializeFlg === null) {
    initializeFlg = true;
  }
  
  if (initializeFlg) {
    console.log("LocalStorage Reset");
    localStorage.clear();
    
  }
}

// ----------------------------------------------------------------
// ローカルストレージの履歴を更新
function updateHistory(_mode, _diff, _initDate, _exitDate, _initRank, _exitRank){
  
  var arrayOfHistoryValue;
  
  var modeLocal = _mode || rankingMode;
  var diffLocal = _diff || diffStatus;
  var initDateLocal = _initDate || $("#init-date").val();
  var exitDateLocal = _exitDate || $("#exit-date").val();
  var initRankLocal = _initRank || $("#init-rank").val();
  var exitRankLocal = _exitRank || $("#exit-rank").val();
  
  // 履歴に追加
  var localStorageActiveKey;
  if (diffLocal) {
    localStorageActiveKey = modeLocal + ":" + diffLocal + ":" + initDateLocal + ":" + exitDateLocal + ":" + initRankLocal + ":" + exitRankLocal;
    
  } else {
    localStorageActiveKey = modeLocal + ":" + diffLocal + "::" + exitDateLocal + ":" + initRankLocal + ":" + exitRankLocal;
    
  }
  
  var localStorageHistoryValue = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
  // console.log(LOCAL_STORAGE_HISTORY_KEY + " -> " + localStorageHistoryValue);
  
  // 履歴が存在する場合は整形
  if (localStorageHistoryValue != null) {
    localStorageHistoryValue = localStorageHistoryValue.replace(/\s+/g, "");
    arrayOfHistoryValue = localStorageHistoryValue.split(",");
  }
  
  localStorageHistoryValue = localStorageActiveKey;
  
  if (arrayOfHistoryValue != null) {
    for (var i = 0; i < arrayOfHistoryValue.length; i++) {
      if (arrayOfHistoryValue[i] === localStorageActiveKey) {
        continue;
      }
      localStorageHistoryValue += ", " + arrayOfHistoryValue[i];
      
    }
  }
  
  // console.log(LOCAL_STORAGE_HISTORY_KEY + " <- " + localStorageHistoryValue);
  localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, localStorageHistoryValue);
  
}

// ----------------------------------------------------------------
// ローカルストレージの履歴を取得
function getHistory(){
  // console.log("Get history");
  
  var arrayOfHistoryValue;
  var arrayOfHistory = [];

  // 履歴を取得
  var localStorageHistoryValue = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    // console.log(LOCAL_STORAGE_HISTORY_KEY + " -> " + localStorageHistoryValue);
  
  // 履歴が存在する場合は整形
  if (localStorageHistoryValue != null) {
    localStorageHistoryValue = localStorageHistoryValue.replace(/\s+/g, "");
    arrayOfHistoryValue = localStorageHistoryValue.split(",");
    
    for (var i = 0; i < arrayOfHistoryValue.length; i++) {
      var arrayOfHistoryItem = arrayOfHistoryValue[i].split(":");
      arrayOfHistory[i] = {
        "mode": arrayOfHistoryItem[0],
        "diff": arrayOfHistoryItem[1],
        "initDate": arrayOfHistoryItem[2],
        "exitDate": arrayOfHistoryItem[3],
        "initRank": arrayOfHistoryItem[4],
        "exitRank": arrayOfHistoryItem[5]
      };
    }
  }
  
  // console.log(arrayOfHistory);
  return arrayOfHistory;
}

// ----------------------------------------------------------------
// 通常モーダルウィンドウ
function showDialog(_dialogTitle, _dialogContent) {
  var dialogTitle = _dialogTitle || "タイトル";
  var dialogContent = _dialogContent || "内容";
  
  // モーダルウィンドウを表示
  $("#modalDialog").html(dialogContent);
  $("#modalDialog").dialog({
    modal: true,
    title: dialogTitle
  });
}

// ----------------------------------------------------------------
// 確認モーダルウィンドウ
function showConfirmDialog(_dialogTitle, _dialogContent, _callbackFunction) {
  var dialogTitle = _dialogTitle || "確認";
  var dialogContent = _dialogContent || "内容";
  var callbackFunction = _callbackFunction || function(){};
  
  // モーダルウィンドウを表示
  $("#modalConfirmDialog").html(dialogContent);
  $("#modalConfirmDialog").dialog({
    modal: true,
    title: dialogTitle,
    buttons: {
      "OK": function() {
        callbackFunction(true);
        $(this).dialog("close");
      },
      "キャンセル": function() {
        callbackFunction(false);
        $(this).dialog("close");
      }
    }
  });
}

// ----------------------------------------------------------------
// true false をスイッチ
function toggleBoolean(_bool) {
  return !_bool;
}
