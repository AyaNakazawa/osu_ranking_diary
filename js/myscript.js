
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
// true false をスイッチ
function toggleBoolean(_bool) {
  return !_bool;
}
