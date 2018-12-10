import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {UserService} from "../../services/user.service";
import {NavigationEnd, Router} from "@angular/router";
import {MainContractService} from "../../services/main-contract.service";
import {BigNumber} from "bignumber.js";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-header',
  templateUrl: './header-block.component.html',
  styleUrls: ['./header-block.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderBlockComponent implements OnInit {

  public locale: string;
  public isShowMobileMenu: boolean = false;
  public isMobile: boolean = false;
  public userTotalReward: BigNumber | any = 0;
  public myBonusInfo: any = {
    shareReward: null,
    refBonus: null,
    promoBonus: null
  };
  public ethAddress: string = null;
  public isRefAvailable: boolean = null;
  public refLink: string;
  public isTradePage: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private userService: UserService,
    private mainContractService: MainContractService,
    private router: Router,
    private commonService: CommonService
  ) {
    router.events.subscribe(route => {
      if (route instanceof NavigationEnd) {
        this.isTradePage = route.url.indexOf('/trade') >= 0;
        this.isShowMobileMenu = false;
        document.body.style.overflow = 'visible';
        this.cdRef.markForCheck();
      }
    })
  }

  ngOnInit() {
    this.commonService.initMainContract$.next(true);
    this.userService.currentLocale.subscribe(currentLocale => {
      this.locale = currentLocale;
      this.cdRef.markForCheck();
    });

    window.innerWidth > 992 ? this.isMobile = this.isShowMobileMenu = false : this.isMobile = true;

    window.onresize = () => {
      if (window.innerWidth > 992) {
        this.isMobile = this.isShowMobileMenu = false;
        document.body.style.overflow = 'visible';
      } else {
        this.isMobile = true;
      }
      this.cdRef.markForCheck();
    };

    this.mainContractService.getObservableEthAddress().subscribe(address => {
      if (this.ethAddress && !address) {
        this.isRefAvailable = false;
        this.userTotalReward = 0;
      }
      this.ethAddress = address;
      this.cdRef.markForCheck();
    });

    this.mainContractService.getObservableUserTotalReward().subscribe(reward => {
      if (reward) {
        if (this.isRefAvailable === null || +this.userTotalReward !== +reward) {
          this.checkRefAvailable();

          this.mainContractService._contractMetamask.getCurrentUserShareBonus((err, res) => {
            this.myBonusInfo.shareReward = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          });
          this.mainContractService._contractMetamask.getCurrentUserRefBonus((err, res) => {
            this.myBonusInfo.refBonus = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          });
          this.mainContractService._contractMetamask.getCurrentUserPromoBonus((err, res) => {
            this.myBonusInfo.promoBonus = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          });
        }
        this.userTotalReward = reward;
      }
      this.cdRef.markForCheck();
    });

    this.mainContractService.passRefLink$.subscribe(refLink => {
      this.refLink = refLink;
      this.cdRef.markForCheck();
    });

    this.cdRef.markForCheck();
  }

  checkRefAvailable() {
    this.mainContractService._contractMetamask.isRefAvailable((err, res) => {
      this.isRefAvailable = res;
      this.mainContractService.isRefAvailable$.next({isAvailable: res});
      this.cdRef.markForCheck();
    });
  }

  toggleMobileMenu(e) {
    this.isShowMobileMenu = !this.isShowMobileMenu;
    document.body.style.overflow = this.isShowMobileMenu ? 'hidden' : 'visible';
    e.stopPropagation();
    this.cdRef.markForCheck();
  }

  withdraw() {
    this.mainContractService._contractMetamask.withdrawUserReward((err, res) => { });
  }

}
