#!/bin/sh
for file in ./dist/*
do
  file_basename=`basename $file`
  file_name=${file_basename%.*}
  echo "deploying $file_basename ..."
  ./node_modules/.bin/mincloud deploy $file_name ./dist
  echo "$file_basename deployed.\n"
  echo "=======================================================\n"
done
