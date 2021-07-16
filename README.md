# Ges'Chat
**Ges'Chat** is the **next generation** of video calling applications with **gesture control** to bridge the cap between school, office and home environments. It allows you to send messages, host video conferences and control your call experience with fluid hand gestures.

# Live Demo
https://ges-chat.live (Allow notifications for the best experience)<br>
Search for "Yajas Sardana" in the app's search bar to talk with me :')
# Preview
![Chat](https://github.com/Yajassardana/Ges-Chat/blob/master/Chat_Preview.png)
![Meet](https://github.com/Yajassardana/Ges-Chat/blob/master/In_Meet_Preview.png)
![technology ppt template - 10 slides - creative (1) pptx](https://user-images.githubusercontent.com/62782513/125960894-bb70c487-4eb0-4c2d-96ba-78bf7936abc9.jpg)

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
<br></br>
![technology ppt template - 10 slides - creative (1) pptx (1)](https://user-images.githubusercontent.com/62782513/125961096-8c9e2d41-01c6-4b4d-ad7f-09efb9366fdc.png)
![technology ppt template - 10 slides - creative (1) pptx (2)](https://user-images.githubusercontent.com/62782513/125961164-9f08b341-db99-447a-a352-80e1dc485edd.png)

## TechStack
![technology ppt template - 10 slides - creative (1) pptx](https://user-images.githubusercontent.com/62782513/125960317-e4826db7-6905-4180-a172-38bc1a22312b.png)

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
