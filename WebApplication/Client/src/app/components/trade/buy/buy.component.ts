import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EthereumService} from "../../../services/ethereum.service";
import {Subject} from "rxjs/Subject";
import * as Web3 from "web3";
import {BigNumber} from "bignumber.js";
import {Subscription} from "rxjs/Subscription";
import {MessageBoxService} from "../../../services/message-box.service";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../../environments/environment";
import {UserService} from "../../../services/user.service";
import {APIService} from "../../../services/api.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-buy',
  templateUrl: './buy.component.html',
  styleUrls: ['./buy.component.sass']
})
export class BuyComponent implements OnInit, OnDestroy {

  @ViewChild('ethInput') ethInput;
  @ViewChild('mntpInput') mntpInput;

  public loading: boolean = false;
  public isTyping: boolean = false;
  public eth: number = 0;
  public mntp: number = 0;
  public estimateFee: number = 0;
  public averageTokenPrice: number = 0;
  public ethBalance: BigNumber | any = 0;
  public buyPrice: BigNumber | any = 0;
  public maxPurchase: number = 0;
  public ethAddress: string = null;
  public errors = {
    invalidBalance: false,
    maxPurchase: false,
    ethLimit: false,
    tokenLimit: false
  };
  public etherscanUrl = environment.etherscanUrl;
  public fromEth: boolean = true;
  public isInvalidNetwork: boolean = false;
  public MMNetwork = environment.MMNetwork;
  public isBalanceBetter: boolean = false;
  public ethLimits = {
    min: 0,
    max: 0
  };
  public tokenLimits = {
    min: 0,
    max: 0
  };

  private web3: Web3 = new Web3();
  private destroy$: Subject<boolean> = new Subject<boolean>();
  private subGetGas: Subscription;
  private gasLimit: number = 400000;

  constructor(
    private ethService: EthereumService,
    private cdRef: ChangeDetectorRef,
    private messageBox: MessageBoxService,
    private translate: TranslateService,
    private userService: UserService,
    private apiService: APIService
  ) { }

  ngOnInit() {
    this.ethInput.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .takeUntil(this.destroy$)
      .subscribe(value => {
        if (this.fromEth && +value && !this.errors.invalidBalance && !this.errors.ethLimit) {
          this.estimateBuyOrder(this.eth, true, false);
        }
      });

    this.mntpInput.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .takeUntil(this.destroy$)
      .subscribe(value => {
        if (!this.fromEth && +value && !this.errors.invalidBalance && !this.errors.tokenLimit) {
          this.estimateBuyOrder(this.mntp, false, false);
        }
      });

    this.initTransactionHashModal();

    this.ethService.passEthBalance.takeUntil(this.destroy$).subscribe(eth => {
      if (eth) {
        this.apiService.getGasPrice().subscribe(data => {
          let gas = (data['fast'] * Math.pow(10, 9) * this.gasLimit) / Math.pow(10, 18);
          this.ethBalance = +this.substrValue(+eth - gas);
          this.eth = +this.substrValue(+eth - gas);

          Observable.combineLatest(
            this.ethService.getObservableTokenDealRange(),
            this.ethService.getObservableEthDealRange()
          ).subscribe(limits => {
            if (limits[0] && limits[1]) {
              this.tokenLimits.min = limits[0].min;
              this.tokenLimits.max = limits[0].max;

              this.ethLimits.min = limits[1].min;
              this.ethLimits.max = limits[1].max;
              this.estimateBuyOrder(this.eth, true, true);
            }
          });
        });
      }
    });
    this.ethService.passEthAddress.takeUntil(this.destroy$).subscribe(address => {
      address && (this.ethAddress = address);

      if (this.ethAddress && !address) {
        this.ethAddress = address;
        this.ethBalance = this.eth = this.mntp = 0;
      }
    });

    this.ethService.getObservable1TokenPrice().takeUntil(this.destroy$).subscribe(price => {
      price && (this.buyPrice = price.buy);
    });

    this.ethService.getObservableNetwork().takeUntil(this.destroy$).subscribe(network => {
      if (network !== null) {
        if (network != this.MMNetwork.index) {
          let networkName = this.MMNetwork.name;
          this.translate.get('MESSAGE.InvalidNetwork', {networkName}).subscribe(phrase => {
            setTimeout(() => {
              this.messageBox.alert(phrase);
            }, 0);
          });
          this.isInvalidNetwork = true;
        } else {
          this.isInvalidNetwork = false;
        }

      }
    });
  }

  changeValue(event, fromEth: boolean) {
    this.isTyping = true;
    this.fromEth = fromEth;

    event.target.value = this.substrValue(event.target.value);
    fromEth ? this.eth = +event.target.value : this.mntp = +event.target.value;

    this.checkErrors(fromEth, +event.target.value);
  }

  setCoinBalance(percent) {
    let max = +this.maxPurchase < this.ethLimits.max ? +this.maxPurchase : this.ethLimits.max;
    let value = this.isBalanceBetter ? this.substrValue(max * percent) : this.substrValue(+this.ethBalance * percent);
    this.checkErrors(true, value);

    if (this.ethAddress && +value != this.eth) {
      if (this.isBalanceBetter) {
        this.mntp = +value;
        !this.errors.ethLimit && this.estimateBuyOrder(this.mntp, false, false);
      } else {
        this.eth = +value;
        !this.errors.ethLimit && this.estimateBuyOrder(this.eth, true, false);
      }
    }
  }

  substrValue(value) {
    return value.toString()
      .replace(',', '.')
      .replace(/([^\d.])|(^\.)/g, '')
      .replace(/^(\d{1,6})\d*(?:(\.\d{0,6})[\d.]*)?/, '$1$2')
      .replace(/^0+(\d)/, '$1');
  }

  estimateBuyOrder(amount: number, fromEth: boolean, isFirstLoad: boolean) {
    this.loading = true;
    this.isTyping = false;
    this.fromEth = fromEth;
    const wei = this.web3['toWei'](amount);

    this.ethService._contractInfura && this.ethService._contractInfura.getCurrentUserMaxPurchase((err, res) => {
      if (res) {
        this.maxPurchase = +new BigNumber(res.toString()).div(new BigNumber(10).pow(18));

        this.ethService._contractInfura.estimateBuyOrder(wei, fromEth, (err, res) => {
          let estimate = +new BigNumber(res[0].toString()).div(new BigNumber(10).pow(18));
          this.estimateFee = +new BigNumber(res[1].toString()).div(new BigNumber(10).pow(18));
          this.averageTokenPrice = +new BigNumber(res[2].toString()).div(new BigNumber(10).pow(18));

          isFirstLoad && (this.isBalanceBetter = estimate > this.maxPurchase || amount > this.ethLimits.max);

          if (fromEth) {
            this.mntp = +this.substrValue(estimate);
            this.errors.invalidBalance = false;
          } else {
            this.eth = +this.substrValue(estimate);
            if (this.ethAddress && this.eth > this.ethBalance) {
              this.errors.invalidBalance = true;
            }
          }
          this.ethAddress && (this.errors.maxPurchase = this.mntp > this.maxPurchase);
          this.loading = false;
        });
      }
    });
  }

  checkErrors(fromEth: boolean, value: number) {
    this.errors.invalidBalance = fromEth && this.ethAddress && this.eth > this.ethBalance;

    this.errors.ethLimit = fromEth && this.ethAddress && value > 0 &&
      (value < this.ethLimits.min || value > this.ethLimits.max);

    this.errors.tokenLimit = !fromEth && this.ethAddress && value > 0 &&
      (value < this.tokenLimits.min || value > this.tokenLimits.max);
  }

  initTransactionHashModal() {
    this.ethService.getSuccessBuyRequestLink$.takeUntil(this.destroy$).subscribe(hash => {
      if (hash) {
        this.translate.get('MESSAGE.SentTransaction').subscribe(phrases => {
          this.messageBox.alert(`
            <div class="text-center">
              <div class="font-weight-500 mb-2">${phrases.Heading}</div>
              <div>${phrases.Hash}</div>
              <div class="mb-2 modal-tx-hash">${hash}</div>
              <a href="${this.etherscanUrl}${hash}" target="_blank">${phrases.Link}</a>
            </div>
          `);
        });
      }
    });
  }

  detectMetaMask(heading) {
    if (window.hasOwnProperty('web3')) {
      !this.ethAddress && this.userService.loginToMM(heading);
    } else {
      this.translate.get('MESSAGE.MetaMask').subscribe(phrase => {
        this.messageBox.alert(phrase.Text, phrase.Heading);
      });
    }
  }

  onSubmit() {
    if (!this.ethAddress) {
      this.detectMetaMask('HeadingBuy');
      return;
    }

    let queryParams = {};
    window.location.hash.replace(/^[^?]*\?/, '').split('&').forEach(item => {
      let param = item.split('=');
      queryParams[decodeURIComponent(param[0])] = param.length > 1 ? decodeURIComponent(param[1]) : '';
    });
    let refAddress = queryParams['ref'] ? queryParams['ref'] : '0x0';

    this.subGetGas && this.subGetGas.unsubscribe();
    this.subGetGas = this.ethService.getObservableGasPrice().subscribe((price) => {
      if (price !== null) {
        const amount = this.web3['toWei'](this.eth);
        this.ethService.buy(refAddress ,this.ethAddress, amount, +price * Math.pow(10, 9));
        this.subGetGas && this.subGetGas.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.subGetGas && this.subGetGas.unsubscribe();
  }

}
