import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {FaceApiService} from './face-api.service';
import {VideoPlayerService} from './video-player.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  buttons = [
    {
      name: 'Compartir',
      icon: 'uil uil-share'
    },
    {
      name: 'Rastreo',
      icon: 'uil uil-focus-target'
    },
    {
      name: 'Compartir',
      icon: 'uil uil-confused'
    },
    {
      name: 'Compartir',
      icon: 'uil uil-save'
    }
  ];

  constructor(private renderer2: Renderer2, private elementRef: ElementRef, private faceApiService: FaceApiService,
              private videoPlayerService: VideoPlayerService) {
  }

  public listSubscribers: any = [];
  public currentStream: any;
  public dimensionVideo: any;
  public previewCanvas: any;
  public listExpressions: any;

  ngOnInit(): void {
    this.checkMediaSource();
    this.getSizeCam();
    this.listObserver();
  }

  ngOnDestroy(): any {
    this.listSubscribers.forEach(a => a.unsubscribe());
  }

  getSizeCam = () => {
    const element: HTMLElement = document.querySelector('.cam');
    const {width, height} = element.getBoundingClientRect();
    this.dimensionVideo = {width, height};

  };

  checkMediaSource = () => {
    if (navigator && navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({
        video: true
      }).then(stream => {
        this.currentStream = stream;
      }).catch(() => {
        console.log('************* ERROR ************ Algo ocurrio obteniendo el video');
      });
    } else {
      console.log('******* ERROR **** No existe camara');
    }
  };


  getAI($event: any): any {
    const {globalFace} = this.faceApiService;
    this.previewCanvas = globalFace.createCanvasFromMedia($event.interface);
    this.renderer2.setProperty(this.previewCanvas, 'id', 'new-canvas-preview');
    const blockPreview = document.querySelector('.space-preview');
    this.renderer2.appendChild(blockPreview, this.previewCanvas);

    //
    // this.imgElement = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    // // this.imgElementSmall = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    // this.renderer2.setProperty(this.imgElement, 'id', 'new-canvas');
    // this.renderer2.appendChild(this.elementRef.nativeElement, this.imgElement);
  }

  listObserver = () => {
    const {globalFace} = this.faceApiService;
    const element: HTMLElement = document.querySelector('.space-preview');
    const {width} = element.getBoundingClientRect();
    const observer1$ = this.videoPlayerService.cbAi.subscribe(({resizedDetections, displaySize, expressions}) => {
      resizedDetections = resizedDetections[0];
      this.listExpressions = _.map(expressions, (value, key) => {
        return {
          name: key,
          value
        };
      });
      this.previewCanvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
      if (true) {
        const scale = width / displaySize.width;
        // console.log(scale);
        // globalFace.draw.drawDetections(this.previewCanvas, resizedDetections);
        globalFace.draw.drawFaceLandmarks(this.previewCanvas, resizedDetections);
        // globalFace.draw.drawFaceExpressions(this.imgElement, resizedDetections);
      }
    });

    this.listSubscribers.push(observer1$);
  };
}
