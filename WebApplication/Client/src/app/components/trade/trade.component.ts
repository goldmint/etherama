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

@Component({
  selector: 'app-trade',
  templateUrl: './trade.component.html',
  styleUrls: ['./trade.component.sass']
})
export class TradeComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'page';

  public etherscanContractUrl = environment.etherscanContractUrl;
  public ethAddress: string = null;
  public ethBalance: BigNumber = null;
  public tokenBalance: BigNumber | any = null;
  public isUserRefAvailable: boolean = false;
  public refBonusPercent: number = 0;
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

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private userService: UserService,
    private apiService: APIService,
    private commonService: CommonService,
    private messageBox: MessageBoxService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.commonService.passMarketData$.takeUntil(this.destroy$).subscribe(data => {
      if (data) {
        this.apiService.getTokenInfo(data.tokenId).subscribe((data: any) => {
          this.tokenInfo = data.data;
          this.isDataLoaded = true;
          this.cdRef.markForCheck();
        });
      }
    });

    this.ethService.getObservableEthBalance().takeUntil(this.destroy$).subscribe(balance => {
      if (balance !== null && (this.ethBalance === null || !this.ethBalance.eq(balance))) {
        this.ethBalance = balance;
        this.ethService.passEthBalance.next(balance);
      }
    });

    this.ethService.getObservableTokenBalance().takeUntil(this.destroy$).subscribe((balance) => {
      if (balance !== null && (this.tokenBalance === null || !this.tokenBalance.eq(balance))) {
        this.tokenBalance = balance;
        this.ethService.passTokenBalance.next(balance);
        this.checkCurrentUserRefAvailable();
        this.cdRef.markForCheck();
      }
    });

    this.ethService.getObservableEthAddress().takeUntil(this.destroy$).subscribe(ethAddr => {
      if (this.ethAddress && !ethAddr) {
        this.isUserRefAvailable = false;
      }

      if (ethAddr && this.ethService._contractInfura) {
        this.tokenBalance && this.ethService.passTokenBalance.next(this.tokenBalance);
        this.ethBalance && this.ethService.passEthBalance.next(this.ethBalance);
      }

      this.ethAddress = ethAddr;
      this.ethService.passEthAddress.next(ethAddr);
      this.cdRef.markForCheck();
    });

    this.ethService.getObservableUserReward().takeUntil(this.destroy$).subscribe(reward => {
      reward && (this.userReward = reward);
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
  }

  checkCurrentUserRefAvailable() {
    if (this.ethService._contractInfura) {
      this.ethService._contractInfura.isCurrentUserRefAvailable((err, res) => {
        this.isUserRefAvailable = res;
        this.uniqueMasternodeLink = `${window.location.href}?ref=${this.ethAddress}`;
        this.cdRef.markForCheck();
      });

      this.ethService._contractInfura.getRefBonusPercent((err, res) => {
        this.refBonusPercent = +res / Math.pow(10, 18);
        this.cdRef.markForCheck();
      });
    }
  }

  openBuySellModal() {
    this.messageBox.buySell();
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
  }

}
