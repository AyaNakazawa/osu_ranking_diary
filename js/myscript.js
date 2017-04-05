
// グローバル変数


// 定数


$(function() {
  
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
// 日付一覧を取得

// ----------------------------------------------------------------
// Dateオブジェクトからゼロ埋めした日付文字列を生成
// _date: new Date()
//  Dateオブジェクト
// _format: 0
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
