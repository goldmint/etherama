import {Component, OnDestroy, OnInit} from '@angular/core';
import {EthereumService} from "../../../services/ethereum.service";
import {Subject} from "rxjs/Subject";

@Component({
  selector: 'app-promo-bonus',
  templateUrl: './promo-bonus.component.html',
  styleUrls: ['./promo-bonus.component.sass']
})
export class PromoBonusComponent implements OnInit, OnDestroy {

  public promoBonus = {
    big: 0,
    quick: 0
  }
  public bigWinPromoBonus: number = 0;
  public quickWinPromoBonus: number = 0;
  public promoMinTokenPurchase: number = 0;

  public timeEnd = new Date().getTime() + 3600000;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private ethService: EthereumService) { }

  ngOnInit() {
    this.ethService.getObservablePromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
      if (bonus) {
        this.promoBonus.big = bonus.big;
        this.promoBonus.quick = bonus.quick;

        this.promoBonus.big = this.promoBonus.big < Math.pow(10, -9) ? Math.pow(10, -9) : +this.promoBonus.big.toFixed(9);
        this.promoBonus.quick = this.promoBonus.quick < Math.pow(10, -9) ? Math.pow(10, -9) : +this.promoBonus.quick.toFixed(9);
      }
    });

    this.ethService.getObservableWinBIGPromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
      bonus && (this.bigWinPromoBonus = bonus);
    });

    this.ethService.getObservableWinQUICKPromoBonus().takeUntil(this.destroy$).subscribe(bonus => {
      bonus && (this.quickWinPromoBonus = bonus);
    });

    this.ethService.getObservablePromoMinTokenPurchase().takeUntil(this.destroy$).subscribe(value => {
      value && (this.promoMinTokenPurchase = value);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
