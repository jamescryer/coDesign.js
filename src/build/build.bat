set js=%~dp0..\js
set css=%~dp0..\css
set mergedjs=%~dp0..\..\libs\coDesign\js\jquery.coDesign.min.js
set mergedcss=%~dp0..\..\libs\coDesign\css\coDesign.min.css

del %mergedjs%
del %mergedcss%

java -jar yuicompressor-2.4.6.jar %css%\coDesign.css -o %mergedcss%

optipng.exe ..\images\sprite.png -dir %output%\images\ -force

java -jar compiler.jar --js=%js%\brushes.js --js=%js%\colors.js --js=%js%\CanvasControl.js --js=%js%\CanvasDraw.js --js=%js%\canvasWrite.js --js=%js%\ColorArray.js --js=%js%\jquery.coDesign.js --js_output_file=%mergedjs%