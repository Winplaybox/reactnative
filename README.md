# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

### NPM Commands ###
"android": "react-native run-android",
"envvar": "setx -m JAVA_HOME \"C:\\Program Files\\Java\\jdk1.8.0_191\"",
"openmenu": "adb shell input keyevent 82",
"emulator": "emulator.exe -avd OnePlus3Pie"
"keystore": "keytool -genkey -v -keystore G:\my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
"buildapk": "cd android && gradlew assembleRelease"
"clear-cache": "react-native start --reset-cache"

### ANDROID BUILD ###
"keystore": "keytool -genkey -v -keystore G:\my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000"
"buildapk": "cd android && gradlew assembleRelease"

### GIT Commands ###
local branch: git checkout -b <branch_name>
rename file: git mv name.js Name.js
undo commit: git reset HEAD~ 
undo commit & lose changes: git reset --hard HEAD~

### Docker Commands ###
docker ls
docker build -t zeal-server-app .
docker run -p 8083:8082 zeal-server-app

http://13.232.85.183:8082