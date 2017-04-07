#!ruby
print "Content-type: text/plain\n\n";

# 年のリスト取得
yearDirectoryList = Dir.glob('../rank_data/*/')
yearDirectoryList.each do |yearDirectory|
  yearDirectory = File.basename(yearDirectory)
  
  # 月のリスト取得
  monthDirectoryList = Dir.glob('../rank_data/' + yearDirectory + '/*/')
  monthDirectoryList.each do |monthDirectory|
    monthDirectory = File.basename(monthDirectory)
    
    # 日のリスト取得
    dayDirectoryList = Dir.glob('../rank_data/' + yearDirectory + '/' + monthDirectory + '/*/')
    dayDirectoryList.each do |dayDirectory|
      # yyyy-mm-dd で出力
      puts yearDirectory + '-' + monthDirectory  + '-' + File.basename(dayDirectory)
      
    end
    
  end
  
end
