import {EventEmitter, Injectable} from '@angular/core';
import {FaceApiService} from './face-api.service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class VideoPlayerService {
  constructor(private faceApiService: FaceApiService) {
  }

  cbAi: EventEmitter<any> = new EventEmitter<any>();

  getLandMark = async (videoElement: any) => {
    const {globalFace} = this.faceApiService;
    const {videoWidth, videoHeight} = videoElement.nativeElement;
    const displaySize = {width: videoWidth, height: videoHeight};
    const detectionsFaces = await globalFace.detectAllFaces(videoElement.nativeElement)
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = globalFace.resizeResults(detectionsFaces, displaySize);
    const landmark = detectionsFaces[0].landmarks || null;
    const expressions = detectionsFaces[0].expressions || null;
    const eyeLeft = landmark.getLeftEye();
    const eyeRight = landmark.getRightEye();

    const eyes = {
      left: [_.head(eyeLeft), _.last(eyeLeft)],
      right: [_.head(eyeRight), _.last(eyeRight)]
    };

    this.cbAi.emit({resizedDetections, displaySize, eyes, expressions});
  };

}
