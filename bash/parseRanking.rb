#!ruby

require 'nokogiri'
require 'open-uri'
require 'json'

# ファイル名
inFileName = ARGV[0]
outFileName = inFileName[0, inFileName.length - 4] + "json"

File.open(outFileName, 'w') do |outFile|
  # HTMLを読み込み
  doc = Nokogiri::HTML(open(inFileName))
  table = doc.xpath('//tr')

  tri = 1
  players = {}
  
  # trを見る
  table.each do |tr|
    
    # onclickがあれば内容もある
    playerId = tr.attribute('onclick');
    if playerId != nil
      playerId = playerId.text
      
    else
      next
    end
    
    # trの中のtd取得
    td = tr.xpath('td')
    
    player = {}
    
    # rank
    player[:rank] = td[0].text.strip
    player[:rank] = player[:rank][1, player[:rank].length - 1]
    
    # name
    player[:name] = td[1].text.strip
    
    # acc
    player[:acc] = td[2].text.strip
    player[:acc] = player[:acc][0, player[:acc].length - 1]
    
    # play count
    player[:play] = td[3].text.strip
    player[:play] = player[:play].tr(",", "")
    player[:play] = player[:play][0, player[:play].index(" (lv.")]
    
    # pp
    player[:pp] = td[4].text.strip
    player[:pp] = player[:pp].tr(",", "")
    player[:pp] = player[:pp][0, player[:pp].length - 2]
    
    # ss
    player[:ss] = td[5].text.strip
    player[:ss] = player[:ss].tr(",", "")
    
    # s
    player[:s] = td[6].text.strip
    player[:s] = player[:s].tr(",", "")
    
    # a
    player[:a] = td[7].text.strip
    player[:a] = player[:a].tr(",", "")
    
    # id
    player[:id] = playerId[22, playerId.length - 23]
    
    # playerを追加（json用だけど同じキーを複数作れないからキーをrankで分ける）
    players["rank" + player[:rank]] = player
    
    tri += 1
    
  end
  
  # jsonに出力
  temp = JSON.dump(players, outFile)
  
end
