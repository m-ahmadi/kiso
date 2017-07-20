@echo off
path=%PATH%;./node_modules/.bin/
set INP=./src
set OUT=./release/static
set MKO=release\static
set HOUT=./release/
set ROOT=/static/
set FL=app.js

cmd /c rm -rf %OUT%
cmd /c mkdir %MKO%\css %MKO%\js
cmd /c cp %INP%/lib %INP%/images %INP%/fonts %OUT%/ -r

cmd /c printf %ROOT% > %INP%/html/links/root.htm
cmd /c printf %ROOT% > %INP%/html/scripts/root.htm
cmd /c printf %ROOT% > %INP%/html/scripts/app/root.htm
cmd /c printf %FL% > %INP%/html/scripts/app/filename.htm
cmd /c printf "define(() => '%ROOT%');" > %INP%/js/core/root.js

cmd /c htmlbilder %INP%/html/ -o %HOUT%/index.html
cmd /c handlebars %INP%/templates/template/ -f %OUT%/lib/templates.js -e hbs -m -o
cmd /c handlebars %INP%/templates/partial/ -f %OUT%/lib/partials.js -p -e hbs -m -o
REM cmd /c babel %INP%/js/ -d %OUT%/js/ -s

set TMP=%OUT%/js/app.babel.js
cmd /c r_js -o baseUrl=%INP%/js/ name=main out=%TMP% optimize=none
cmd /c babel %TMP% -o %OUT%/js/%FL% -s
cmd /c rm -f %TMP%
cmd /c cp %INP%/js/workers/ %OUT%/js/ -r

cmd /c where sass >nul 2>nul
if %ERRORLEVEL% EQU 0 (
	cmd /c sass %INP%/sass/style.scss:%OUT%/css/style.css --style expanded --sourcemap=auto
) else (
	cmd /c node-sass %INP%/sass/style.scss > %OUT%/css/style.css --output-style expanded --source-map true
)