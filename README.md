# BATHROOM FINDER

## Setting up the development environment

### [Getting Started](https://reactnative.dev/docs/environment-setup) with React Native setup

### BASICS for MacOS setup
``` sh
brew install node
brew install watchman
npm install react-native-cli @react-native-community/cli
```

### MACOS
#### iOS
- Install Xcode by going to the Mac app Store.
- Install Command Line Tools: Open Xcode, then choose "Preferences..." from the Xcode menu. Go to the Locations panel and install the tools by selecting the most recent version in the Command Line Tools dropdown.
- Install CocoaPods. it is a dependency management system available for iOS. On most platforms, the following works:
    ```sh
    $ sudo gem install cocoapods
    ```
    However for Apple Silicon, you need to run the following instead:
    ```sh
    $ brew install cocoapods
    ```
    Then run the following:
    ```sh
    $ cd ios && pod install && cd ..
    ```
    If you get the following error
    ```
    [!] Failed to load 'hermes-engine' podspec: 
    [!] Invalid `hermes-engine.podspec` file: undefined method `exists?' for File:Class.
    ```
    see [this](https://github.com/facebook/react-native/issues/35807) React-Native issue for a workaround.
- Also for M1 or other Apple silicon devices, see [this](https://stackoverflow.com/questions/71933392/react-native-ios-undefined-symbols-for-architecture-x86-64) for a workaround for `undefined symbol` errors when building for iOS. Specifically, the workaround is replacing the original `post_install do` directive with the following:
    ```ruby
    post_install do |installer|
        react_native_post_install(
        installer,
        # Set `mac_catalyst_enabled` to `true` in order to apply patches
        # necessary for Mac Catalyst builds
        :mac_catalyst_enabled => false
        )
        __apply_Xcode_12_5_M1_post_install_workaround(installer)

        installer.pods_project.targets.each do |target|
            target.build_configurations.each do |config|
                config.build_settings['EXCLUDED_ARCHS[sdk=iphonesimulator*]'] = "arm64"
            end
        end
    end
   
#### Android
- Install Java Development Kit
    ``` sh
    brew tap homebrew/cask-versions
    brew install --cask zulu11
    ```
- Download and install Android studio. Android Studio installation wizard, check the boxes next to all of the following items :
    - Android SDK
    - Android SDK Platform
    - Android Virtual Device
- Install the Android SDK. 0pen Android Studio, click on "More Actions" button and select "SDK Manager".Select the "SDK Platforms" tab from within the SDK Manager, then check the box next to "Show Package Details" in the bottom right corner. Look for and expand the Android 12 (S) entry, then make sure the following items are checked:
    - Android SDK Platform 31
    - Intel x86 Atom_64 System Image or Google APIs Intel x86 Atom System Image or (for Apple M1 Silicon) Google APIs ARM 64 v8a System Image
Next, select the "SDK Tools" tab and check the box next to "Show Package Details" here as well. Look for and expand the "Android SDK Build-Tools" entry, then make sure that 31.0.0 is selected. Finally, click "Apply" to download and install the Android SDK and related build tools.
- Configure the ANDROID_HOME environment variable
    - Add the following lines to your `~/.zprofile` or `~/.zshrc` (if you are using bash, then `~/.bash_profile` or `~/.bashrc`) config file:
    ``` shell
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/emulator
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    ```
    - Run ``` shell source ~/.zprofile ``` `(or source ~/.bash_profile ` for bash) to load the config into your current shell.

### WINDOWS AND LINUX
[Set up React Native](https://reactnative.dev/docs/environment-setup)


## How to run 
``` sh
npm install 
cd ios && pod install && cd ..
npm run ios
npm run android
```

## File structure
Our working directory is called `screens`. Files will be added as we move along.

## Documentation
Documentation is stored in our Google Drive folder.