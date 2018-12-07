import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-etherama-main-modal',
  templateUrl: './etherama-main-modal.component.html',
  styleUrls: ['./etherama-main-modal.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class EtheramaMainModalComponent implements OnInit, AfterViewInit {

  public slides = new Array(4);
  public currentSlide: number = 0;

  constructor(
    private bsModalRef: BsModalRef
  ) { }

  ngOnInit() { }

  randomInteger(min, max) {
    let rand = min + Math.random() * (max + 1 - min);
    rand = Math.floor(rand);
    return rand;
  }

  public hide() {
    this.bsModalRef.hide();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.currentSlide = this.randomInteger(0, this.slides.length - 1);
    }, 0)
  }

}
