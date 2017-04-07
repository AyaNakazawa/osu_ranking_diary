
// グローバル変数
var dateList = new Array();
var loadingStatus = true;


// 定数


$(function() {
  
  // ----------------------------------------------------------------
  // 初期化
  initializeORD();
  
  // ----------------------------------------------------------------
  // View difference columnを変更
  $(document).on("change", "#setting-view-column-area input", function() {
    console.log("Change Vire difference column: " + $(this).prop("checked"));
    
    var checkViewColumn = $(this).prop("checked");
    
    if (checkViewColumn) {
      $("#setting-date-area > #difference-date").removeClass("display-none");
      
    } else {
      $("#setting-date-area > #difference-date").addClass("display-none");
      
    }
    
    $(".change-value, .difference-of-above").each(function(i, element) {
      if (checkViewColumn) {
        $(element).removeClass("display-none");
        
      } else {
        $(element).addClass("display-none");
        
      }
    });
  });
  
});

// ----------------------------------------------------------------
// Functions

// ----------------------------------------------------------------
// osu! Ranking Diary 初期化
function initializeORD(){
  
  searchDateList();
  
  $(".init-date").val(getDateString(new Date(), "%Y-%m-%d"));
  $(".exit-date").val(getDateString(new Date(), "%Y-%m-%d"));
  $(".init-rank").val(1);
  $(".exit-rank").val(100);
  
  toggleLoading();
  
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
        console.log("dateList: " + i + "/" + dateList.length + ": " + date);
        
      });
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error: ajax: " + textStatus);
    }
  });

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
