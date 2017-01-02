#! /bin/bash

cat src/LocalStorage.js > /tmp/pre-bundle.js
cat src/constants.js >> /tmp/pre-bundle.js
cat src/Activities.js >> /tmp/pre-bundle.js
cat src/Activity.js >> /tmp/pre-bundle.js
cat src/App.js >> /tmp/pre-bundle.js
cat src/BackButton.js >> /tmp/pre-bundle.js
cat src/CantButton.js >> /tmp/pre-bundle.js
cat src/EditActivity.js >> /tmp/pre-bundle.js
cat src/idealTimesToTimes.js >> /tmp/pre-bundle.js
cat src/What.js >> /tmp/pre-bundle.js
cat src/TimeLeft.js >> /tmp/pre-bundle.js
cat src/minutesLeftInActivity.js >> /tmp/pre-bundle.js
cat src/minutesToHumanString.js >> /tmp/pre-bundle.js
cat src/index.js >> /tmp/pre-bundle.js

grep -Ev "^(im|ex)port " /tmp/pre-bundle.js > build/static/js/simpleBuildBundle.js
cp -f src/App.css build/static/css/simpleBuildBundle.css

echo "
<html>
    <head>
        <meta charset='utf-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1'>
        <title>KyaKarun</title>

        <!-- CSS -->
        <link rel='stylesheet' href='./static/css/simpleBuildBundle.css'/>
    </head>
    <body>
        <div id='root'></div>

        <script src='https://cdnjs.cloudflare.com/ajax/libs/react/15.4.1/react.min.js'></script>
        <script src='https://cdnjs.cloudflare.com/ajax/libs/react/15.4.1/react-dom.min.js'></script>
        <script src='https://cdnjs.cloudflare.com/ajax/libs/babel-core/5.8.34/browser.min.js'></script>

        <!-- JS -->
        <script src='./static/js/simpleBuildBundle.js' type='text/babel'></script>
    </body>
</html>
" > build/index.html

echo "Okay try starting a local server in the top-level folder and opening in browser."
