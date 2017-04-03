
// グローバル変数


// 定数


$(function() {
  
  // ----------------------------------------------------------------
  // View difference columnを変更
  $(document).on("change", "#setting-view-column-area input", function() {
    console.log("Change Vire difference column: " + $(this).prop("checked"));
    
    var checkbox = this;
    
    $(".change-value, .difference-of-above").each(function(i, element) {
      if ($(checkbox).prop("checked")) {
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
