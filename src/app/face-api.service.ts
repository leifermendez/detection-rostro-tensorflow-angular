import {EventEmitter, Injectable} from '@angular/core';
import * as faceapi from 'face-api.js';

@Injectable({
  providedIn: 'root'
})
export class FaceApiService {
  globalFace: any;
  loadedModels: EventEmitter<any> = new EventEmitter<any>();
  private modulesForLoad = [
    faceapi.nets.ssdMobilenetv1.loadFromUri('/assets/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/assets/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/assets/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/assets/models')
  ];

  constructor() {
    this.globalFace = faceapi;
    /**
     * Cargar modelos inmediatamente!
     */
    this.loadModels();
  }

  public loadModels = () => {
    Promise.all(this.modulesForLoad).then(loaded => {
      this.loadedModels.emit(true);
    });
  };
}
