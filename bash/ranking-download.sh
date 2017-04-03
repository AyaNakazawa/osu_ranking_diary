#!/bin/bash

# Setting env
echo Setting ORD_env
  export ORD_YEAR=`date +%Y`
  export ORD_MONTH=`date +%m`
  export ORD_DAY=`date +%d`
  export ORD_RANK_DATA_DIR=../rank_data/${ORD_YEAR}/${ORD_MONTH}/${ORD_DAY}
  export ORD_OSU_RANKING_URL=https://osu.ppy.sh/p/pp

  export ORD_MODE0_DIR=${ORD_RANK_DATA_DIR}/std
  export ORD_MODE1_DIR=${ORD_RANK_DATA_DIR}/taiko
  export ORD_MODE2_DIR=${ORD_RANK_DATA_DIR}/ctb
  export ORD_MODE3_DIR=${ORD_RANK_DATA_DIR}/mania

# Make directory
echo Make directory
  mkdir -p ${ORD_MODE0_DIR}
  mkdir -p ${ORD_MODE1_DIR}
  mkdir -p ${ORD_MODE2_DIR}
  mkdir -p ${ORD_MODE3_DIR}

# Download osu ranking

# osu! Standard
echo Downloading osu! Standard ranking...
curl -o "${ORD_MODE0_DIR}/ranking-#1.html" "${ORD_OSU_RANKING_URL}/?m=0&s=3&o=1&f=&page=[1-20]"
echo Waiting 20s...
sleep 20s

# osu!Taiko
echo Downloading osu!Taiko ranking...
curl -o "${ORD_MODE1_DIR}/ranking-#1.html" "${ORD_OSU_RANKING_URL}/?m=1&s=3&o=1&f=&page=[1-20]"
echo Waiting 20s...
sleep 20s

# Catch The Beat
echo Downloading Catch The Beat ranking...
curl -o "${ORD_MODE2_DIR}/ranking-#1.html" "${ORD_OSU_RANKING_URL}/?m=2&s=3&o=1&f=&page=[1-20]"
echo Waiting 20s...
sleep 20s

# osu!mania
echo Downloading osu!mania ranking...
curl -o "${ORD_MODE3_DIR}/ranking-#1.html" "${ORD_OSU_RANKING_URL}/?m=3&s=3&o=1&f=&page=[1-20]"

# Clear env

echo Clear ORD_env
export -n ORD_YEAR
export -n ORD_MONTH
export -n ORD_DAY
export -n ORD_RANK_DATA_DIR
export -n ORD_OSU_RANKING_URL
export -n ORD_MODE0_DIR
export -n ORD_MODE1_DIR
export -n ORD_MODE2_DIR
export -n ORD_MODE3_DIR

# Done
echo Done ORD_bash
