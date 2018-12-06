import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {EthereumService} from "../../../services/ethereum.service";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'app-main-promo-bonus',
  templateUrl: './main-promo-bonus.component.html',
  styleUrls: ['./main-promo-bonus.component.sass']
})
export class MainPromoBonusComponent implements OnInit {

  public promoBonus = {
    big: 0,
    quick: 0
  }
  public bigWinPromoBonus: number = 0;
  public quickWinPromoBonus: number = 0;
  public bigBankTimer;
  public quickBankTimer;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // this.ethService.getObservablePromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
    //   if (bonus) {
    //     this.promoBonus.big = bonus.big;
    //     this.promoBonus.quick = bonus.quick;
    //
    //     this.promoBonus.big = this.promoBonus.big < Math.pow(10, -9) ? Math.pow(10, -9) : +this.promoBonus.big.toFixed(9);
    //     this.promoBonus.quick = this.promoBonus.quick < Math.pow(10, -9) ? Math.pow(10, -9) : +this.promoBonus.quick.toFixed(9);
    //     this.cdRef.markForCheck();
    //   }
    // });
    //
    // this.ethService.getObservableWinBIGPromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
    //   if (bonus) {
    //     this.bigWinPromoBonus = bonus;
    //     this.bigBankTimer = new Date().getTime() + (this.bigWinPromoBonus * 15000);
    //     this.cdRef.markForCheck();
    //   }
    // });
    //
    // this.ethService.getObservableWinQUICKPromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
    //   if (bonus) {
    //     this.quickWinPromoBonus = bonus;
    //     this.quickBankTimer = new Date().getTime() + (this.quickWinPromoBonus * 15000);
    //     this.cdRef.markForCheck();
    //   }
    // });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
