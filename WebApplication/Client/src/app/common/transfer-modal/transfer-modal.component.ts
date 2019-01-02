import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {BsModalRef} from "ngx-bootstrap/modal";
import {CommonService} from "../../services/common.service";
import {MarketData} from "../../interfaces/market-data";
import {Subject} from "rxjs/Subject";
import {APIService} from "../../services/api.service";
import {TokenInfoDetails} from "../../interfaces/token-info-details";

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.sass'],
  encapsulation: ViewEncapsulation.None
})

export class TransferModalComponent implements OnInit, OnDestroy {

  public isDataLoaded: boolean = false;
  public tokenInfo: TokenInfoDetails;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private bsModalRef: BsModalRef,
    private commonService: CommonService,
    private apiService: APIService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.commonService.passMarketData$.takeUntil(this.destroy$).subscribe((data: MarketData) => {
      if (data) {
        this.apiService.getTokenInfo(data.tokenId).subscribe((data: any) => {
          this.tokenInfo = data.data;
          this.isDataLoaded = true;
          this.cdRef.markForCheck();
        });
      }
    });
  }

  public hide() {
    this.bsModalRef.hide();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
