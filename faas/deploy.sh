#!/bin/sh
for file in ./dist/*
do
  file_basename=`basename $file`
  file_name=${file_basename%.*}
  echo "deploying $file_basename ..."

  if [ -n "$1" ]; then
    npx mincloud deploy --env $1 $file_name ./dist
  else
    npx mincloud deploy $file_name ./dist
  fi
  echo "$file_basename deployed.\n"
  echo "==================================================\n"
done
