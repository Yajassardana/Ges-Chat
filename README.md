# Ges'Chat
**Ges'Chat** is the **next generation** of video calling applications with **gesture control** to bridge the cap between school, office and home environments. It allows you to send messages, host video conferences and control your call experience with fluid hand gestures.

# Live Demo
https://ges-chat.live (Allow notifications for the best experience)<br>
Search for "Yajas Sardana" in the app's search bar to talk with me :')
# Preview
![Chat]
![Meet]

## Table of content
  - [Features](#features)
  - [Development](#development)
## Features
- **One to One and Room Group Messaging**
  - Instant text messaging
  - **Voice note** sharing
  - **Images** preview and sharing
  - **Read receipts**
  - User **typing** and **online** status
  - Instant user and room search by name
- **Video conferencing**
  - One to One and group calls
  - In Meet messaging
  - Screen Sharing
- **Gesture Control (X-factor / Flagship)**
  - **Physically raise hand** (palm) in front of camera to raise **in-meet hand.**
  - Victory/Peace sign to lower hand
  - **Thumbs up** to switch the camera on.
  - Thumbs down to switch the camera off.
- **Offensive Text Detection**
  - **Flags and prompts** in case of offensive text messages to help create a safer in-app environment.
  - Prompts both in both in-meet and outside-meet chats.
- **PWA**
  - **Download** and add to homescreen/desktop for ease of access.
  - Smooth installation, native-like behaviour and access to device hardware.
  - **Push notifications** with sound.
- **Authentication**
  - Login using gmail account.
  - Auth check in meet to **prevent unauthorized** users from entering.

## Development
In order to run the app setup a firebase project then navigate to "src/firebase" and put your config object there and then go to your project settings in firebase then get a service account file from there and go put it on "backend" folder.
Then setup an algolia search project then put your keys in "backend/index.js" and "src/Sidebar.js".
