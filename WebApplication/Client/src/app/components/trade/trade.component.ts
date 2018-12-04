import {ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {BigNumber} from "bignumber.js";
import {EthereumService} from "../../services/ethereum.service";
import {Subject} from "rxjs/Subject";
import {MessageBoxService} from "../../services/message-box.service";
import {environment} from "../../../environments/environment";
import {UserService} from "../../services/user.service";
import {CommonService} from "../../services/common.service";
import {APIService} from "../../services/api.service";
import {TokenInfo} from "../../interfaces/token-info";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.sass']
})
export class TradeComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'page';

  public etherscanContractUrl = environment.etherscanContractUrl;
  public ethAddress: string = null;
  public tokenBalance: BigNumber | any = null;
  public isUserRefAvailable: boolean = false;
  public refBonusPercent: number = 0;
  public minRefTokenAmount: number = null;
  public uniqueMasternodeLink: string;

  public userReward: BigNumber | any = 0;
  public tokenSupply: BigNumber | any = 0;
  public totalData: any = {
    totalEth: 0,
    totalTokens: 0
  };
  public isDataLoaded: boolean = false;
  public expirationTime = {
    expiration: '-',
    tillExpiration: '-'
  };
  public tillExpiration: number = null;
  public tokenInfo: TokenInfo;
  public invalidContractAddress: boolean = false;
  public myBonusInfo: any = {
    shareReward: null,
    refBonus: null,
    promoBonus: null
  };
  public locale: string;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private userService: UserService,
    private apiService: APIService,
    private commonService: CommonService,
    private messageBox: MessageBoxService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.takeUntil(this.destroy$).subscribe(params => {
      let address = params.id,
          tokenId,
          addressExist = false;

      if (!this.ethService.isValidAddress(address)) {
        this.invalidContractAddress = true;
        this.isDataLoaded = true;
        this.cdRef.markForCheck();
        return;
      }

      this.apiService.getTokenList().subscribe((list: any) => {
        list.data.forEach(token => {
          if (token.etheramaContractAddress === address) {
            addressExist = true;
            tokenId = token.id;
          }
        });

        if (addressExist) {
          let data: any = {};
          data.etheramaContractAddress = address;
          data.tokenId = tokenId;
          this.commonService.passMarketData$.next(data);

          this.apiService.getTokenInfo(tokenId).subscribe((data: any) => {
            this.tokenInfo = data.data;
            this.initTradePage();
            this.isDataLoaded = true;
            this.cdRef.markForCheck();
          });
        } else {
          this.invalidContractAddress = true;
          this.isDataLoaded = true;
          this.cdRef.markForCheck();
        }
      });
    });
  }

  initTradePage() {
    this.ethService.passTokenBalance.takeUntil(this.destroy$).subscribe(balance => {
      if (balance) {
        this.tokenBalance = balance;
        this.checkCurrentUserRefAvailable();
        this.cdRef.markForCheck();
      }
    });

    this.ethService.passEthAddress.takeUntil(this.destroy$).subscribe(address => {
      address && (this.ethAddress = address);
      if (this.ethAddress && !address) {
        this.ethAddress = address;
        this.isUserRefAvailable = false;
      }
      this.cdRef.markForCheck();
    });

    this.ethService.getObservableUserReward().takeUntil(this.destroy$).subscribe(reward => {
      if (reward) {
        this.userReward = reward;

        this.ethService._contractMetamask.getCurrentUserShareReward((err, res) => {
          this.myBonusInfo.shareReward = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        });
        this.ethService._contractMetamask.getCurrentUserRefBonus((err, res) => {
          this.myBonusInfo.refBonus = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        });
        this.ethService._contractMetamask.getCurrentUserPromoBonus((err, res) => {
          this.myBonusInfo.promoBonus = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        });
      }
      this.cdRef.markForCheck();
    });

    this.ethService.getObservableTotalTokenSupply().takeUntil(this.destroy$).subscribe(supply => {
      supply && (this.tokenSupply = +supply);
      this.cdRef.markForCheck();
    });

    this.ethService.getObservableExpirationTime().takeUntil(this.destroy$).subscribe(time => {
      if (time) {
        this.expirationTime.expiration = time.expiration;
        this.expirationTime.tillExpiration = time.tillExpiration;
        this.tillExpiration = new Date().getTime() + time.tillExpiration * 1000;
        this.cdRef.markForCheck();
      }
    });

    this.ethService.getObservableTotalData().takeUntil(this.destroy$).subscribe(total => {
      if (total) {
        this.totalData.totalEth = total.eth;
        this.totalData.totalTokens = total.tokens;
        this.cdRef.markForCheck();
      }
    });

    this.userService.currentLocale.takeUntil(this.destroy$).subscribe(locale => {
      this.locale = locale;
      this.cdRef.markForCheck();
    });
  }

  checkCurrentUserRefAvailable() {
    if (this.ethService._contractInfura) {
      this.ethService._contractInfura.isCurrentUserRefAvailable((err, res) => {
        this.isUserRefAvailable = res;
        this.uniqueMasternodeLink = `${window.location.href}?ref=${this.ethAddress}`;
        this.cdRef.markForCheck();
      });

      this.ethService._contractInfura.getMinRefTokenAmount((err, res) => {
        this.minRefTokenAmount = +res / Math.pow(10, 18);
        this.cdRef.markForCheck();
      });

      // this.ethService._contractInfura.getRefBonusPercent((err, res) => {
      //   this.refBonusPercent = +res / Math.pow(10, 18);
      //   this.cdRef.markForCheck();
      // });
    }
  }

  openBuySellModal() {
    this.messageBox.buySell(false);
  }

  withdraw() {
    this.ethService._contractMetamask.withdraw((err, res) => { });
  }

  onCopyData(input) {
    input.focus();
    input.setSelectionRange(0, input.value.length);
    document.execCommand("copy");
    input.setSelectionRange(0, 0);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.commonService.passMarketData$.next(null);
  }

}
