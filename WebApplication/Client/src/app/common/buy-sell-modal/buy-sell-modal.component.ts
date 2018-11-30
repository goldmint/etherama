import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-buy-sell-modal',
  templateUrl: './buy-sell-modal.component.html',
  styleUrls: ['./buy-sell-modal.component.sass'],
  encapsulation: ViewEncapsulation.None
})
export class BuySellModalComponent implements OnInit, OnDestroy {

  public isStop: boolean = true;
  public switchModel: {
    type: 'buy'|'sell'
  };

  constructor(
    private bsModalRef: BsModalRef,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.switchModel = {
      type: 'buy'
    };

    setTimeout(() => {
      this.isStop = this.bsModalRef.content.isStop;
    }, 0);
  }

  public hide() {
    this.bsModalRef.hide();
  }

  ngOnDestroy() {
    this.isStop && this.commonService.passMarketData$.next(null);
  }
}
