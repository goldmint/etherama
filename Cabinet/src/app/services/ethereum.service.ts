import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { interval } from "rxjs/observable/interval";
import * as Web3 from "web3";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { UserService } from "./user.service";
import { BigNumber } from 'bignumber.js'
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs/Subject";

@Injectable()
export class EthereumService {

  private _infuraUrl = environment.infuraUrl;
  private _gasPriceLink = environment.gasPriceLink;
  private _etherscanGetABIUrl = environment.etherscanGetABIUrl;

  private mintoramaContractAddress = environment.mintoramaContractAddress;
  private mintoramaContractABI = environment.mintoramaContractABI;

  private mntpContractAddress = environment.mntpContractAddress;
  private tokenABI = environment.tokenABI;

  private _web3Infura: Web3 = null;
  private _web3Metamask: Web3 = null;
  private _lastAddress: string | null;
  private _metamaskNetwork: number = null

  public _contractInfura: any;
  public _contractMetamask: any;
  public _contractMntp: any;

  private _obsEthAddressSubject = new BehaviorSubject(null);
  private _obsEthAddress = this._obsEthAddressSubject.asObservable();

  private _obsTokenBalanceSubject = new BehaviorSubject(null);
  private _obsTokenBalance = this._obsTokenBalanceSubject.asObservable();

  private _obsEthBalanceSubject = new BehaviorSubject(null);
  private _obsEthBalance = this._obsEthBalanceSubject.asObservable();

  private _obs1TokenPriceSubject = new BehaviorSubject(null);
  private _obs1TokenPrice = this._obs1TokenPriceSubject.asObservable();

  private _obsUserRewardSubject = new BehaviorSubject(null);
  private _obsUserReward = this._obsUserRewardSubject.asObservable();

  private _obsTotalDataSubject = new BehaviorSubject(null);
  private _obsTotalData = this._obsTotalDataSubject.asObservable();

  private _obsPromoBonusSubject = new BehaviorSubject(null);
  private _obsPromoBonus = this._obsPromoBonusSubject.asObservable();

  private _obsWinBIGPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinBIGPromoBonus = this._obsWinBIGPromoBonusSubject.asObservable();

  private _obsWinQUICKPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinQUICKPromoBonus = this._obsWinQUICKPromoBonusSubject.asObservable();

  private _obsPromoMinTokenPurchaseSubject = new BehaviorSubject(null);
  private _obsPromoMinTokenPurchase = this._obsPromoMinTokenPurchaseSubject.asObservable();

  private _obsGasPriceSubject = new Subject();
  private _obsGasPrice = this._obsGasPriceSubject.asObservable();

  private _obsNetworkSubject = new BehaviorSubject<Number>(null);
  private _obsNetwork: Observable<Number> = this._obsNetworkSubject.asObservable();

  private _obsTokenDealRangeSubject = new BehaviorSubject<any>(null);
  private _obsTokenDealRange: Observable<Number> = this._obsTokenDealRangeSubject.asObservable();

  private _obsEthDealRangeSubject = new BehaviorSubject<any>(null);
  private _obsEthDealRange: Observable<Number> = this._obsEthDealRangeSubject.asObservable();

  public passEthBalance = new BehaviorSubject(null);
  public passTokenBalance = new BehaviorSubject(null);
  public passEthAddress = new BehaviorSubject(null);

  public getSuccessBuyRequestLink$ = new Subject();
  public getSuccessSellRequestLink$ = new Subject();

  constructor(
    private _userService: UserService,
    private _http: HttpClient
  ) {
    interval(500).subscribe(this.checkWeb3.bind(this));
    interval(7500).subscribe(this.checkBalance.bind(this));
    interval(60000).subscribe(this.checkContractData.bind(this));
    interval(10000).subscribe(this.updateWinBIGPromoBonus.bind(this));
    interval(10000).subscribe(this.updateWinQUICKPromoBonus.bind(this));
  }

  private getContractABI(address) {
    return this._http.get(`${this._etherscanGetABIUrl}/api?module=contract&action=getabi&address=${address}&forma=raw`);
  }

  private checkWeb3() {
    if (!this._web3Infura) {
      this._web3Infura = new Web3(new Web3.providers.HttpProvider(this._infuraUrl));

      if (this._web3Infura['eth']) {
        this._contractInfura = this._web3Infura['eth'].contract(JSON.parse(this.mintoramaContractABI)).at(this.mintoramaContractAddress);
      } else {
        this._web3Infura = null;
      }
    }

    if (!this._web3Metamask && (window.hasOwnProperty('web3') || window.hasOwnProperty('ethereum')) && this.mintoramaContractABI) {
      let ethereum = window['ethereum'];

      if (ethereum) {
        this._web3Metamask = new Web3(ethereum);
        ethereum.enable().then();
      } else {
        this._web3Metamask = new Web3(window['web3'].currentProvider);
      }

      if (this._web3Metamask['eth']) {
        this._contractMetamask = this._web3Metamask['eth'].contract(JSON.parse(this.mintoramaContractABI)).at(this.mintoramaContractAddress);
        this._contractMntp = this._web3Metamask.eth.contract(JSON.parse(this.tokenABI)).at(this.mntpContractAddress);
      } else {
        this._web3Metamask = null;
      }
    }

    if (this._web3Metamask && this._web3Metamask.version.network !== this._metamaskNetwork) {
      this._metamaskNetwork && this.checkBalance();

      this._metamaskNetwork = this._web3Metamask.version.network;
      this._obsNetworkSubject.next(this._metamaskNetwork);
    }

    var addr = this._web3Metamask && this._web3Metamask['eth'] && this._web3Metamask['eth'].accounts.length
      ? this._web3Metamask['eth'].accounts[0] : null;

    if (this._lastAddress !== addr) {
      this._lastAddress = addr;
      window['ethereum'] && window['ethereum'].enable().then();
      this.emitAddress(addr);
    }
  }

  private checkBalance() {
    if (this._lastAddress != null) {
      this.updateTokenBalance(this._lastAddress);
      this.updateUserReward();
    }
    this.updateEthBalance(this._lastAddress);
  }

  private checkContractData() {
    this.update1TokenPrice();
    this.updateTotalData();
    this.updatePromoBonus();
  }

  private emitAddress(ethAddress: string) {
    this._web3Metamask && this._web3Metamask['eth'] && this._web3Metamask['eth'].coinbase
          && (this._web3Metamask['eth'].defaultAccount = this._web3Metamask['eth'].coinbase);

    this._obsEthAddressSubject.next(ethAddress);

    this.checkBalance();
    this.update1TokenPrice();
    this.updateTotalData();
    this.updatePromoBonus();
    this.updateWinBIGPromoBonus();
    this.updateWinQUICKPromoBonus();
    this.getPromoMinTokenPurchase();
    this.getTokenDealRange();
    this.getEthDealRange();
  }

  private getGasPrice() {
    this._http.get(this._gasPriceLink).subscribe(data => {
      this._obsGasPriceSubject.next(data['fast']);
    });
  }

  private updateTokenBalance(addr: string) {
    if (addr == null || this._contractMetamask == null) {
      this._obsTokenBalanceSubject.next(null);
    } else {
      this._contractMetamask.getCurrentUserLocalTokenBalance((err, res) => {
        this._obsTokenBalanceSubject.next(new BigNumber(res.toString()).div(new BigNumber(10).pow(18)));
      });
    }
  }

  private updateEthBalance(addr: string) {
    if (addr == null || this._contractMetamask == null) {
      this._obsEthBalanceSubject.next(null);
    } else {
      this._contractMetamask._eth.getBalance(addr, (err, res) => {
        this._obsEthBalanceSubject.next(new BigNumber(res.toString()).div(new BigNumber(10).pow(18)));
      });
    }
  }

  private update1TokenPrice() {
    if (!this._contractInfura) {
      this._obs1TokenPriceSubject.next(null);
    } else {
      let price = {};
      this._contractInfura.get1TokenBuyPrice((err, res) => {
        price['buy'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));

        this._contractInfura.get1TokenSellPrice((err, res) => {
          price['sell'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          this._obs1TokenPriceSubject.next(price);
        });
      });
    }
  }

  private updateUserReward() {
    if (!this._contractMetamask || this._lastAddress === null) {
      this._obsUserRewardSubject.next(null);
    } else {
      this._contractMetamask.getCurrentUserReward(true, true, (err, res) => {
        this._obsUserRewardSubject.next(new BigNumber(res.toString()).div(new BigNumber(10).pow(18)));
      });
    }
  }

  private updateTotalData() {
    if (!this._contractInfura) {
      this._obsTotalDataSubject.next(null);
    } else {
      let total = {};
      this._contractInfura.getTotalTokenSold((err, res) => {
        total['tokens'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        this._contractInfura.getTotalEthBalance((err, res) => {
          total['eth'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          this._obsTotalDataSubject.next(total);
        });
      });
    }
  }

  private updatePromoBonus() {
    if (!this._contractInfura) {
      this._obsPromoBonusSubject.next(null);
    } else {
      let promoBonus = {};
      this._contractInfura.getCurrentQuickPromoBonus((err, res) => {
        promoBonus['quick'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        this._contractInfura.getCurrentBigPromoBonus((err, res) => {
          promoBonus['big'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
          this._obsPromoBonusSubject.next(promoBonus);
        });
      });
    }
  }

  private updateWinBIGPromoBonus() {
    if (!this._contractInfura) {
      this._obsWinBIGPromoBonusSubject.next(null);
    } else {
      this._contractInfura.getBigPromoRemainingBlocks((err, res) => {
        this._obsWinBIGPromoBonusSubject.next(res);
      });
    }
  }

  private updateWinQUICKPromoBonus() {
    if (!this._contractInfura) {
      this._obsWinQUICKPromoBonusSubject.next(null);
    } else {
      this._contractInfura.getQuickPromoRemainingBlocks((err, res) => {
        this._obsWinQUICKPromoBonusSubject.next(res);
      });
    }
  }

  private getPromoMinTokenPurchase() {
    if (!this._contractInfura) {
      this._obsPromoMinTokenPurchaseSubject.next(null);
    } else {
      this._contractInfura.getPromoMinTokenPurchase((err, res) => {
        this._obsPromoMinTokenPurchaseSubject.next(new BigNumber(res.toString()).div(new BigNumber(10).pow(18)));
      });
    }
  }

  private getTokenDealRange() {
    this._contractInfura.getTokenDealRange((err, res) => {
      let limit = {
        min: +new BigNumber(res[0].toString()).div(new BigNumber(10).pow(18)),
        max: +new BigNumber(res[1].toString()).div(new BigNumber(10).pow(18))
      }
      this._obsTokenDealRangeSubject.next(limit);
    });
  }

  private getEthDealRange() {
    this._contractInfura.getEthDealRange((err, res) => {
      let limit = {
        min: +new BigNumber(res[0].toString()).div(new BigNumber(10).pow(18)),
        max: +new BigNumber(res[1].toString()).div(new BigNumber(10).pow(18))
      }
      this._obsEthDealRangeSubject.next(limit);
    });
  }

  public getObservableEthAddress(): Observable<string> {
    return this._obsEthAddress;
  }

  public getObservableTokenBalance(): Observable<BigNumber> {
    return this._obsTokenBalance;
  }

  public getObservableEthBalance(): Observable<BigNumber> {
    return this._obsEthBalance;
  }

  public getObservable1TokenPrice(): Observable<any> {
    return this._obs1TokenPrice;
  }

  public getObservableUserReward(): Observable<any> {
    return this._obsUserReward;
  }

  public getObservableTotalData(): Observable<any> {
    return this._obsTotalData;
  }

  public getObservablePromoBonus(): Observable<any> {
    return this._obsPromoBonus;
  }

  public getObservableWinBIGPromoBonus(): Observable<any> {
    return this._obsWinBIGPromoBonus;
  }

  public getObservableWinQUICKPromoBonus(): Observable<any> {
    return this._obsWinQUICKPromoBonus;
  }

  public getObservablePromoMinTokenPurchase(): Observable<any> {
    return this._obsPromoMinTokenPurchase;
  }

  public getObservableEthDealRange(): Observable<any> {
    return this._obsEthDealRange;
  }

  public getObservableTokenDealRange(): Observable<any> {
    return this._obsTokenDealRange;
  }

  public getObservableNetwork(): Observable<Number> {
    return this._obsNetwork;
  }

  public getObservableGasPrice(): Observable<any> {
    this.getGasPrice();
    return this._obsGasPrice;
  }

  public buy(refAddress: string, fromAddr: string, amount: string, gasPrice: number) {
    this._contractMetamask.buy(refAddress, { from: fromAddr, value: amount, gas: 400000, gasPrice: gasPrice }, (err, res) => {
      this.getSuccessBuyRequestLink$.next(res);
    });
  }

  public sell(fromAddr: string, amount: string, gasPrice: number) {
    this._contractMntp.approve(this.mintoramaContractAddress, amount, { from: fromAddr, value: 0, gas: 400000, gasPrice: gasPrice }, (err, res) => {
      res && setTimeout(() => {
        this._contractMetamask.sell(amount, { from: fromAddr, value: 0, gas: 400000, gasPrice: gasPrice }, (err, res) => {
          this.getSuccessSellRequestLink$.next(res);
        });
      }, 1000);
    });
  }
}