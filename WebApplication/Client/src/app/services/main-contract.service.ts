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
  private _web3Infura: Web3 = null;
  private _contractInfura: any;

  private _obsPromoBonusSubject = new BehaviorSubject(null);
  private _obsPromoBonus = this._obsPromoBonusSubject.asObservable();

  private _obsWinBIGPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinBIGPromoBonus = this._obsWinBIGPromoBonusSubject.asObservable();

  private _obsWinQUICKPromoBonusSubject = new BehaviorSubject(null);
  private _obsWinQUICKPromoBonus = this._obsWinQUICKPromoBonusSubject.asObservable();

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private commonService: CommonService
  ) {
    this.commonService.initMainContract$.subscribe(init => {
      if (init) {
        this.stopService();
        this.setInterval();
      } else {
        this.stopService();
      }
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
  }

  private setInterval() {
    interval(500).takeUntil(this.destroy$).subscribe(this.checkWeb3.bind(this));
    interval(60000).takeUntil(this.destroy$).subscribe(this.updatePromoBonus.bind(this));
    interval(10000).takeUntil(this.destroy$).subscribe(this.updateWinBIGPromoBonus.bind(this));
    interval(10000).takeUntil(this.destroy$).subscribe(this.updateWinQUICKPromoBonus.bind(this));
  }

  private stopService() {
    this._web3Infura = this._contractInfura = null;
    this.destroy$.next(true);
  }

  private initBankInfoMethods() {
    this.updatePromoBonus();
    this.updateWinBIGPromoBonus();
    this.updateWinQUICKPromoBonus();
  }

  private updatePromoBonus() {
    if (!this._contractInfura) {
      this._obsPromoBonusSubject.next(null);
    } else {
      let promoBonus = {};
      this._contractInfura._currentQuickPromoBonus((err, res) => {
        promoBonus['quick'] = new BigNumber(res.toString()).div(new BigNumber(10).pow(18));
        this._contractInfura._currentBigPromoBonus((err, res) => {
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


  public getObservablePromoBonus(): Observable<any> {
    return this._obsPromoBonus;
  }

  public getObservableWinBIGPromoBonus(): Observable<any> {
    return this._obsWinBIGPromoBonus;
  }

  public getObservableWinQUICKPromoBonus(): Observable<any> {
    return this._obsWinQUICKPromoBonus;
  }

}
