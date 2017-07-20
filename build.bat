REM @echo off
path=%PATH%;./node_modules/.bin/
set INP=./src
set OUT=./dist
set MKO=dist
set ROOT=""

cmd /c rm -rf %OUT%
cmd /c mkdir %MKO%\css %MKO%\js
cmd /c cp %INP%/lib %INP%/images %INP%/fonts %OUT%/ -r

cmd /c printf %ROOT% > %INP%/html/links/root.htm
cmd /c printf %ROOT% > %INP%/html/scripts/root.htm
cmd /c printf %ROOT% > %INP%/html/scripts/app/root.htm
cmd /c printf "main.js" > %INP%/html/scripts/app/filename.htm
cmd /c printf "define(() => '');" > %INP%/js/core/root.js

cmd /c htmlbilder %INP%/html/ -o %OUT%/index.html
cmd /c handlebars %INP%/templates/template/ -f %OUT%/lib/templates.js -e hbs -m -o
cmd /c handlebars %INP%/templates/partial/ -f %OUT%/lib/partials.js -p -e hbs -m -o
cmd /c babel %INP%/js/ -d %OUT%/js/ -s

cmd /c where sass >nul 2>nul
if %ERRORLEVEL% EQU 0 (
	cmd /c sass %INP%/sass/style.scss:%OUT%/css/style.css --style expanded --sourcemap=auto
) else (
	cmd /c node-sass %INP%/sass/style.scss > %OUT%/css/style.css --output-style expanded --source-map true
)