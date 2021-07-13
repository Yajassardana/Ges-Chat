# Ges'Chat
**Ges'Chat** is the **next generation** of video calling applications with **gesture control** to bridge the cap between school, office and home environments. It allows you to send messages, host video conferences and control your call experience with fluid hand gestures.

# Live Demo
https://ges-chat.live (Allow notifications for the best experience)<br>
Search for "Yajas Sardana" in the app's search bar to talk with me :')
# Preview
![Chat](https://github.com/Yajassardana/Ges-Chat/blob/master/Chat_Preview.png)
![Meet](https://github.com/Yajassardana/Ges-Chat/blob/master/In_Meet_Preview.png)

## Table of content
  - [Features](#features)
  - [TechStack](#techstack)
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
## TechStack
1. Front End / Client Side
   - ReactJS
   - TensorFlowJS - Gesture Detection
   - React Context API - App state management
2. BackEnd Server:
    - For search
      - Algolia search - data indexing
      - Heroku NodeJs environment - deployment.
    - For video calling
      - Jitsi SDK - Layer over webRTC
      - AWS EC2 instance for Jitsi SDK server deployment

3. Data Management (Databases): 
    - Firebase Firestore - Data management and messaging
    - Firebase Realtime-db - Online status and typing state management
## Development
### Configuration
 1. Setup a firebase project and then navigate to `src/firebase` and put your `firebase config` object there.
 2. Then go to your project settings in firebase then get a service account file from there and go put it on `backend` folder. 
 3. Intiliaze and configure your firestore and realtimedb databases and set `databaseUrl` in `backend/index.js` as your realtimedb link.
 4. Then setup an algolia search project then put your keys in `backend/index.js` and `src/Sidebar.js`.
### Setup
1. Run `npm install` in the root directory to install all necassary dependencies.
2. Navigate to the `backend folder` and again, run `npm install`.
### Running on localhost
1. In the root directory, run `npm run start` to start the react app server.
2. Navigate to the `backend folder` and `node index.js` to start the backend server.
