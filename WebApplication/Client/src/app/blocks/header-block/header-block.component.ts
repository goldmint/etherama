import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {UserService} from "../../services/user.service";
import {NavigationEnd, Router} from "@angular/router";
import {MainContractService} from "../../services/main-contract.service";
import {BigNumber} from "bignumber.js";
import {CommonService} from "../../services/common.service";
import {AllTokensBalance} from "../../interfaces/all-tokens-balance";

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
  public userRefLink: string;
  public myGenerateRefLink: string;
  public minRefTokenAmount: number = null;
  public allTokensBalance: AllTokensBalance[] = null;
  public allTokensBalanceSum: number = 0;
  public totalSpent: number = 0;

  private bonusPopTimer: any;

  constructor(
    private cdRef: ChangeDetectorRef,
    private userService: UserService,
    private mainContractService: MainContractService,
    private router: Router,
    private commonService: CommonService
  ) {
    router.events.subscribe(route => {
      if (route instanceof NavigationEnd) {
        let queryParams = {};
        window.location.hash.replace(/^[^?]*\?/, '').split('&').forEach(item => {
          let param = item.split('=');
          queryParams[decodeURIComponent(param[0])] = param.length > 1 ? decodeURIComponent(param[1]) : '';
        });

        !this.userRefLink && queryParams['ref'] && (this.userRefLink = queryParams['ref']);
        this.userRefLink && !queryParams['ref'] && (window.location.href = window.location.href + '?ref=' + this.userRefLink);

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

    window.innerWidth > 1200 ? this.isMobile = this.isShowMobileMenu = false : this.isMobile = true;

    window.onresize = () => {
      if (window.innerWidth > 1200) {
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
      this.myGenerateRefLink = `${window.location.origin}/#/market?ref=${this.ethAddress}`;
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

    this.mainContractService.passTokensBalance$.subscribe((balance: AllTokensBalance[]) => {
      if (balance) {
        this.allTokensBalanceSum = 0;
        this.allTokensBalance = balance;
        balance.forEach(item => {
          this.allTokensBalanceSum += item.balance;
        });
        this.cdRef.markForCheck();
      }
    });
    this.cdRef.markForCheck();
  }

  checkRefAvailable() {
    this.mainContractService._contractMetamask._minRefEthPurchase((err, res) => {
      this.minRefTokenAmount = +res / Math.pow(10, 18);

      this.mainContractService._contractMetamask.getUserTotalEthVolumeSaldo(this.ethAddress, (err, res) => {
        this.totalSpent = +res / Math.pow(10, 18);
        this.cdRef.markForCheck();
      });
      this.cdRef.markForCheck();
    });

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

  onCopyData(input) {
    input.focus();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("copy");
    input.setSelectionRange(0, 0);
  }

  popEnter(pop) {
    setTimeout(() => {
      let popoverContainer = document.querySelector('.popover-content');
      popoverContainer && popoverContainer.addEventListener('mouseenter', () => clearTimeout(this.bonusPopTimer));
      popoverContainer && popoverContainer.addEventListener('mouseleave', () => pop.hide());
    }, 0);
  }

  popLeave(pop) {
    this.bonusPopTimer = setTimeout(() => pop.hide(), 300);
  }

}
