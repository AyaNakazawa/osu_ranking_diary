
// グローバル変数
var localStorageFlg = true;

var initializeStatus = 0;
var loadingStatus = true;
var diffStatus = true;

var dateList = new Array();

var rankingMode = "std";

var initDate;
var initDate2;
var exitDate2;
var exitDate;

var initRanking = new Array();
var exitRanking = new Array();


// 定数
LOCAL_STORAGE_HISTORY_KEY = "osuRankingDiaryHistoryV1";
LOCAL_STORAGE_MODE_KEY = "osuRankingDiaryMode";

$(function() {
  
  // ----------------------------------------------------------------
  // 初期化
  initializeORD();
  
  $(document).ajaxSuccess(function() {
    initializeORD();
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
    // console.log("Scroll to Top");
    $('body,html').animate({scrollTop:0}, 500);
  });
  
  // ----------------------------------------------------------------
  // タイトル
  $(document).on('click', '#title', function() {
    // console.log("Click Title");
    
    location.reload();
    
  });
  
  // ----------------------------------------------------------------
  // モード切替
  $(document).on('click', '.action-mode', function() {
    // console.log("Click Mode action: " + $(this).attr("data-mode"));
    
    changeMode(this);
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージに保存
  $(document).on('click', '#action-save', function() {
    // console.log("Click Save action");
    updateHistory();
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージの履歴リスト
  $(document).on('click', '#action-load-header', function() {
    // console.log("Click Load header action");
    
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
    // console.log("Click History item action");
    
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
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // ローカルストレージを初期化
  $(document).on('click', '#action-reset', function() {
    // console.log("Click Reset action");
    
    showConfirmDialog("ローカルストレージの初期化", "<p>ローカルストレージに保存されている内容を全て初期化します。<br>よろしいですか？</p>", initializeLocalStorage)
  });
  
  // ----------------------------------------------------------------
  // View difference columnを変更
  $(document).on("change", "#view-column", function() {
    console.log("Change Vire difference column: " + $(this).prop("checked"));
    
    changeViewDiff(this, null);
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // init-date を変更
  $(document).on("change", "#init-date", function() {
    fixRankDate(0);
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // exit-date を変更
  $(document).on("change", "#exit-date", function() {
    fixRankDate(1);
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // init-rank を変更
  $(document).on("change", "#init-rank", function() {
    fixRank(0);
    
    buildRanking();
    
  });
  
  // ----------------------------------------------------------------
  // exit-rank を変更
  $(document).on("change", "#exit-rank", function() {
    fixRank(1);
    
    buildRanking();
    
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
      
      // tooltip をつける
      
      $("#view-column-label").tooltip({placement: "left"});
      
      $("#init-date").attr("title", "" + initDate + " ～ " + exitDate2);
      $("#exit-date").attr("title", "" + initDate + " ～ " + exitDate);
      
      $("#init-date").tooltip();
      $("#exit-date").tooltip();
      
      $("#init-rank").tooltip();
      $("#exit-rank").tooltip();
      
      initRanking = getRanking(
        $("#init-date").val(),
        1 * $("#init-rank").val(),
        1 * $("#exit-rank").val()
      );
      exitRanking = getRanking(
        $("#exit-date").val(),
        1 * $("#init-rank").val(),
        1 * $("#exit-rank").val()
      );
      
      buildRanking(initRanking, exitRanking);
      
      break;
  }
  
  initializeStatus++;
  
}

// ----------------------------------------------------------------
// ランキングを生成
function buildRanking() {
  console.log("Build ranking");
  
  // Loading にする
  if (!loadingStatus) {
    toggleLoading();
    
  }
  
  console.log("Building...");
  
  // Loading を解除する
  toggleLoading();
  
} 

// ----------------------------------------------------------------
// ランキングをファイルから取得
function getRanking(_date, _initRank, _exitRank) {
  dateLocal = _date || getDateString(new Date(), "%Y-%m-%d");
  initRankLocal = _initRank || initRank;
  exitRankLocal = _exitRank || exitRank;
  
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
  
  $(".change-value, .difference-of-above").each(function(i, element) {
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
