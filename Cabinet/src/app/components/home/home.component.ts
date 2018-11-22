import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {EthereumService} from "../../services/ethereum.service";
import {Subject} from "rxjs/Subject";
import {environment} from "../../../environments/environment";
import {BigNumber} from "bignumber.js";
import {MessageBoxService} from "../../services/message-box.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent implements OnInit, OnDestroy {

  @HostBinding('class') class = 'page';

  public ethAddress: string = null;
  public ethBalance: BigNumber = null;
  public tokenBalance: BigNumber | any = null;
  public isUserRefAvailable: boolean = false;
  public refBonusPercent: number = 0;
  public uniqueMasternodeLink: string;

  public userReward: BigNumber | any = 0;
  public totalData: any = {
    totalEth: 0,
    totalTokens: 0
  };
  public etherscanContractUrl = environment.etherscanContractUrl;
  public isDataLoaded: boolean = false;
  public date = new Date();

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private messageBox: MessageBoxService) { }

  ngOnInit() {
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
    });

    this.ethService.getObservableUserReward().takeUntil(this.destroy$).subscribe(reward => {
      reward && (this.userReward = reward);
    });

    this.ethService.getObservableTotalData().takeUntil(this.destroy$).subscribe(total => {
      if (total) {
        this.totalData.totalEth = total.eth;
        this.totalData.totalTokens = total.tokens;
        this.isDataLoaded = true;
      }
    });
  }

  checkCurrentUserRefAvailable() {
    if (this.ethAddress && this.ethService._contractInfura) {
      this.ethService._contractInfura.isCurrentUserRefAvailable((err, res) => {
        this.isUserRefAvailable = res;
        this.uniqueMasternodeLink = `${window.location.origin}/#/home?ref=${this.ethAddress}`
      });
      this.ethService._contractInfura.getRefBonusPercent((err, res) => {
        this.refBonusPercent = +res / Math.pow(10, 18);
      });
    }
  }

  openBuySellModal() {
    this.messageBox.buySell();
  }
  // reinvest() {
  //   this.ethService._contractMetamask.reinvest((err, res) => { });
  // }

  withdraw() {
    this.ethService._contractMetamask.withdraw((err, res) => { });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
