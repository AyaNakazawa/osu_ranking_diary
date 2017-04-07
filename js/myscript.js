
// グローバル変数
var initializeStatus = 0;
var loadingStatus = true;
var diffStatus = true;

var dateList = new Array();

var initDate;
var initDate2;
var exitDate2;
var exitDate;


// 定数


$(function() {
  
  // ----------------------------------------------------------------
  // 初期化
  initializeORD();
  
  $(document).ajaxSuccess(function() {
    initializeORD();
  });
  
  // ----------------------------------------------------------------
  // View difference columnを変更
  $(document).on("change", "#view-column", function() {
    console.log("Change Vire difference column: " + $(this).prop("checked"));
    
    diffStatus = toggleBoolean(diffStatus);
    
    var checkViewColumn = $(this).prop("checked");
    
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
    
  });
  
  // ----------------------------------------------------------------
  // init-date を変更
  $(document).on("change", "#init-date", function() {
    fixRankDate(0);
    
  });
  
  // ----------------------------------------------------------------
  // init-date を変更
  $(document).on("change", "#exit-date", function() {
    fixRankDate(1);
    
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
      
      toggleLoading();
      
      break;
  }
  
  initializeStatus++;
  
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
        console.log("dateList: " + i + "/" + dateList.length + ": " + date);
        
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
  // 日時が許容値を超えていたら修正
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
// true false をスイッチ
function toggleBoolean(_bool) {
  return !_bool;
}
