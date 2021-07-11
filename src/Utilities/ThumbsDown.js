import { Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose';


// describe thumbs up gesture 👍
export const thumbsDownDescription = new GestureDescription('thumbs_down');

// thumb:
// - not curled
// - vertical up (best) or diagonal up left / right
thumbsDownDescription.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1.0);
thumbsDownDescription.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 1.0);
thumbsDownDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.25);
thumbsDownDescription.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.25);

// all other fingers:
// - curled
// - horizontal left or right
for(let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  thumbsDownDescription.addCurl(finger, FingerCurl.FullCurl, 1.0);
  thumbsDownDescription.addDirection(finger, FingerDirection.HorizontalLeft, 1.0);
  thumbsDownDescription.addDirection(finger, FingerDirection.HorizontalRight, 1.0);
}
