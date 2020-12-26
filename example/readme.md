# Bluetooth LE Example

```bash
# install packages
npm i

# build and sync for Android
npm run build:android

# build and sync for iOS
npm run build:ios

# for development
npm run start

# run web version locally
npm run serve

# open Android Studio
npx cap open android

# open Xcode
npx cap open android
```

Add IP address to `capacitor.config.json`:

```JSON
{
  "server": {
    "url": "http://192.168.178.43:3333"
  }
}
```
