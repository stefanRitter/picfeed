#!/bin/sh

# 1. get top sites from alexa
#    https://support.alexa.com/hc/en-us/articles/200461990-Can-I-get-a-list-of-top-sites-from-an-API-
curl "http://s3.amazonaws.com/alexa-static/top-1m.csv.zip" -o "temp.zip"; 
unzip temp.zip;

# 2. get headers
#    -D some servers block getting only headers
#    -L follow all redirects
#    s/^.*,//p substitute everything in front of and including a comma with nothing, print result
for URL in `head -100 top-1m.csv | sed -n 's/^.*,//p'`;
do
  echo $URL;
  HEADER=$(curl -# -L -D - "$URL" -o null | grep -i Cache-Control | tail -1);
  if [ -z "$HEADER" ]
  then
    echo "$URL,'Cache-Control: private'" >> top100cache.csv;
  else
    HEADER=$(echo $HEADER | tr -d ' \t\n\r')
    echo "$URL,'$HEADER'" >> top100cache.csv;
  fi
done

# cleanup
rm null;
rm top-1m.csv;
rm temp.zip;
