import {Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, Renderer2, ViewChild} from '@angular/core';
import {FaceApiService} from '../face-api.service';
import * as _ from 'lodash';
import {VideoPlayerService} from '../video-player.service';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit {

  /**
   * APP de entretenimiento filtros o juegos
   * Ecommerce con AI ropa accesorios
   * Seguridad 2fa
   */
  @ViewChild('videoElement') videoElement: ElementRef;
  @Output() dataAI: EventEmitter<any> = new EventEmitter<any>();
  loadedModels: boolean;
  overlay: boolean;
  filterSelect: any;
  public listSubscribers: any = [];
  previewCanvas: any;
  currentExp: string;
  drawing = true;
  filters = [
    {
      type: 'question',
      question: '¿Estas subscrito a mi canal? <b>YOUTUBE</b>'
    },
    {
      type: 'filter',
      image: 'sunglass.png'
    }
  ];
  @Input() width: number;
  @Input() height: number;
  @Input() source: any;
  currentColor = 'white';
  expressions = [
    {
      label: 'angry',
      value: '😡',
      color: 'tomato'
    },
    {
      label: 'happy',
      value: '😄',
      color: 'green'
    },
    {
      label: 'surprised',
      value: '😲',
      color: 'blue'
    }
  ];

  @HostListener('document:click', ['$event'])
  cbOver(res): any {
    console.log(res.clientX);
  };

  constructor(private faceApiService: FaceApiService, private videoPlayerService: VideoPlayerService, private renderer2: Renderer2,
              private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.faceApiService.loadedModels.subscribe((res) => {
      if (res) {
        this.loadedModels = true;
        this.checkFace();
      }
    });

    this.listObserver();
  }

  listObserver = () => {
    const observer1$ = this.videoPlayerService.cbAi.subscribe(
      ({resizedDetections, displaySize, eyes}) => {
      resizedDetections = resizedDetections[0];
      if (resizedDetections) {
        this.drawAi(resizedDetections, displaySize, eyes);
      }
    });

    this.listSubscribers.push(observer1$);
  };

  checkFace = () => {
    setInterval(async () => {
      await this.videoPlayerService.getLandMark(this.videoElement);
    }, 100);
  };

  drawAi = (resizedDetections, displaySize, eyes) => {
    this.previewCanvas.getContext('2d').clearRect(0, 0, displaySize.width, displaySize.height);
    if (this.filterSelect) {
      const scale = this.width / displaySize.width;
      const filterEye = document.querySelector('.filter-eye');
      this.renderer2.setStyle(filterEye, 'left', `${eyes.left[0].x * scale}px`);
      this.renderer2.setStyle(filterEye, 'top', `${eyes.left[0].y * scale}px`);
      // globalFace.draw.drawDetections(this.previewCanvas, resizedDetections);
      // globalFace.draw.drawFaceLandmarks(this.previewCanvas, resizedDetections);
      // globalFace.draw.drawFaceExpressions(this.imgElement, resizedDetections);
    }
  };

  private b64toBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return URL.createObjectURL(new Blob([ab], {type: 'image/png'}));
  };

  selectFilter = (inData) => {
    this.filterSelect = inData
  }

  saveToImage = () => {
    const {videoWidth, videoHeight} = this.videoElement.nativeElement;
    const displaySize = {width: videoWidth, height: videoHeight};
    const canvas: HTMLElement | any = document.getElementById('canvas');
    const video = this.videoElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

    console.log(canvas);
    const dataURL = canvas.toDataURL();
    const response = this.b64toBlob(dataURL);
    window.open(response, '_blank');
  };


  listenerPlay = () => {
    const {globalFace} = this.faceApiService;
    this.previewCanvas = globalFace.createCanvasFromMedia(this.videoElement.nativeElement);
    this.renderer2.setProperty(this.previewCanvas, 'id', 'new-canvas-preview-big');
    this.renderer2.setStyle(this.previewCanvas, 'width', `${this.width}px`);
    this.renderer2.setStyle(this.previewCanvas, 'height', `${this.height}px`);
    this.renderer2.appendChild(this.elementRef.nativeElement, this.previewCanvas);

    this.dataAI.emit({interface: this.videoElement.nativeElement});
  };

  loadedMetaData = () => {
    this.videoElement.nativeElement.play();
  };


}
