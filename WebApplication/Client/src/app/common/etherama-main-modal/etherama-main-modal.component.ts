import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-etherama-main-modal',
  templateUrl: './etherama-main-modal.component.html',
  styleUrls: ['./etherama-main-modal.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default
})
export class EtheramaMainModalComponent implements OnInit {

  public slides = new Array(4);

  constructor(
    private bsModalRef: BsModalRef
  ) { }

  ngOnInit() {
  }

  public hide() {
    this.bsModalRef.hide();
  }

}
