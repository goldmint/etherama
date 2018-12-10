import { Injectable } from '@angular/core';
import {interval} from "rxjs/observable/interval";
import {environment} from "../../environments/environment";
import {CommonService} from "./common.service";
import {BigNumber} from "bignumber.js";
import * as Web3 from "web3";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";

@Injectable()
export class MainContractService {

  private contractAddress = environment.mainContractAddress;
  private contractABI = environment.mainContractABI;

  private _infuraUrl = environment.infuraUrl;
  private _contractInfura: any;
  public _contractMetamask: any;

  private _web3Infura: Web3 = null;
  private _web3Metamask: Web3 = null;
  private _lastAddress: string | null;

  private _obsEthAddressSubject = new BehaviorSubject(null);
  private _obsEthAddress = this._obsEthAddressSubject.asObservable();

  private _obsPromoBonusSubject = new BehaviorSubject(null);
  private _obsPromoBonus = this._obsPromoBonusSubject.asObservable();

  private _obsWinBIGPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinBIGPromoBonus = this._obsWinBIGPromoBonusSubject.asObservable();

  private _obsWinQUICKPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinQUICKPromoBonus = this._obsWinQUICKPromoBonusSubject.asObservable();

  private _obsUserTotalRewardSubject = new BehaviorSubject(null);
  private _obsUserTotalReward = this._obsUserTotalRewardSubject.asObservable();

  public isRefAvailable$ = new BehaviorSubject(null);

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private commonService: CommonService
  ) {
    this.commonService.initMainContract$.subscribe(init => {
      init && this.setInterval();
    });
  }

  private checkWeb3() {
    if (!this._web3Infura && this.contractAddress) {
      this._web3Infura = new Web3(new Web3.providers.HttpProvider(this._infuraUrl));

      if (this._web3Infura['eth']) {
        this._contractInfura = this._web3Infura['eth'].contract(JSON.parse(this.contractABI)).at(this.contractAddress);
        this.initBankInfoMethods();
      } else {
        this._web3Infura = null;
      }
    }

    if (!this._web3Metamask && (window.hasOwnProperty('web3') || window.hasOwnProperty('ethereum')) && this.contractAddress) {
      let ethereum = window['ethereum'];

      if (ethereum) {
        this._web3Metamask = new Web3(ethereum);
        ethereum.enable().then();
      } else {
        this._web3Metamask = new Web3(window['web3'].currentProvider);
      }

      if (this._web3Metamask['eth']) {
        this._contractMetamask = this._web3Metamask['eth'].contract(JSON.parse(this.contractABI)).at(this.contractAddress);
      } else {
        this._web3Metamask = null;
      }
    }

    var addr = this._web3Metamask && this._web3Metamask['eth'] && this._web3Metamask['eth'].accounts.length
      ? this._web3Metamask['eth'].accounts[0] : null;

    if (this._lastAddress !== addr) {
      this._lastAddress = addr;
      window['ethereum'] && window['ethereum'].enable().then();
      this.emitAddress(addr);
    }
  }

  private setInterval() {
    interval(500).takeUntil(this.destroy$).subscribe(this.checkWeb3.bind(this));
    interval(7500).takeUntil(this.destroy$).subscribe(this.checkBalance.bind(this));
    interval(60000).takeUntil(this.destroy$).subscribe(this.updatePromoBonus.bind(this));
    interval(10000).takeUntil(this.destroy$).subscribe(this.updateWinBIGPromoBonus.bind(this));
    interval(10000).takeUntil(this.destroy$).subscribe(this.updateWinQUICKPromoBonus.bind(this));
  }

  private initBankInfoMethods() {
    this.updatePromoBonus();
    this.updateWinBIGPromoBonus();
    this.updateWinQUICKPromoBonus();
  }

  private emitAddress(ethAddress: string) {
    this._web3Metamask && this._web3Metamask['eth'] && this._web3Metamask['eth'].coinbase
    && (this._web3Metamask['eth'].defaultAccount = this._web3Metamask['eth'].coinbase);

    this._obsEthAddressSubject.next(ethAddress);
    this.checkBalance();
  }

  private checkBalance() {
    this.updateUserTotalReward();
  }

  private updatePromoBonus() {
    if (!this._contractInfura) {
      this._obsPromoBonusSubject.next(null);
    } else {
      let promoBonus = {};
      this._contractInfura && this._contractInfura._currentQuickPromoBonus((err, res) => {
        promoBonus['quick'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        this._contractInfura && this._contractInfura._currentBigPromoBonus((err, res) => {
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

  private updateUserTotalReward() {
    if (!this._contractMetamask || this._lastAddress === null) {
      this._obsUserTotalRewardSubject.next(null);
    } else {
      this._contractMetamask.getCurrentUserTotalReward((err, res) => {
        this._obsUserTotalRewardSubject.next(new BigNumber(res.toString()).div(new BigNumber(10).pow(18)));
      });
    }
  }

  public getObservableEthAddress(): Observable<string> {
    return this._obsEthAddress;
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

  public getObservableUserTotalReward(): Observable<any> {
    return this._obsUserTotalReward;
  }

}
