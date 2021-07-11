import { Finger, FingerCurl, FingerDirection, GestureDescription} from 'fingerpose';

export const handUpDescription = new GestureDescription('hand_up');

for(let finger of [Finger.Thumb, Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
    handUpDescription.addCurl(finger, FingerCurl.NoCurl, 1.0);
    handUpDescription.addDirection(finger, FingerDirection.VerticalUp, 1.0);
    handUpDescription.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.25);
    handUpDescription.addDirection(finger, FingerDirection.DiagonalUpRight, 0.25);
}
