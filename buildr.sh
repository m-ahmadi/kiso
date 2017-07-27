#!/bin/bash
PATH=$PATH:./node_modules/.bin
INP=./src
OUT=./release/static
HOUT=./release
ROOT=static/
FL=app.js

rm -rf $OUT
mkdir $OUT/css $OUT/js -p
cp $INP/lib $INP/images $INP/fonts $OUT/ -r

printf $ROOT > $INP/html/links/root.htm
printf $ROOT > $INP/html/scripts/root.htm
printf $ROOT > $INP/html/scripts/app/root.htm
printf $FL > $INP/html/scripts/app/filename.htm
printf "define(() => '$ROOT');" > $INP/js/core/root.js

htmlbilder $INP/html/ -o $HOUT/index.html
handlebars $INP/templates/template/ -f $OUT/lib/templates.js -e hbs -m -o
handlebars $INP/templates/partial/ -f $OUT/lib/partials.js -p -e hbs -m -o
# babel $INP/js/ -d $OUT/js/ -s

TMP=$OUT/js/app.babel.js
r_js -o baseUrl=$INP/js/ name=main out=$TMP optimize=none
babel $TMP -o $OUT/js/$FL -s
rm -f $TMP
cp $INP/js/workers/ $OUT/js/ -r

if [ -x "$(command -v sass)" ]; then
	sass $INP/sass/style.scss:$OUT/css/style.css --style expanded --sourcemap=auto
else
	node-sass $INP/sass/style.scss > $OUT/css/style.css --output-style expanded --source-map true --indent-type tab --indent-width 1
fi