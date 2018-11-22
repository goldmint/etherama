import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";

@Component({
  selector: 'app-buy-sell-modal',
  templateUrl: './buy-sell-modal.component.html',
  styleUrls: ['./buy-sell-modal.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class BuySellModalComponent implements OnInit {

  public switchModel: {
    type: 'buy'|'sell'
  };

  constructor(private bsModalRef: BsModalRef) { }

  ngOnInit() {
    this.switchModel = {
      type: 'buy'
    };
  }

  public hide() {
    this.bsModalRef.hide();
  }

}
