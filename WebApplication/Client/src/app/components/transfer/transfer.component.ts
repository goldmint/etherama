import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {EthereumService} from "../../services/ethereum.service";
import {Subject} from "rxjs/Subject";
import * as Web3 from "web3";
import {BigNumber} from "bignumber.js";
import {environment} from "../../../environments/environment";
import {TranslateService} from "@ngx-translate/core";
import {MessageBoxService} from "../../services/message-box.service";
import {UserService} from "../../services/user.service";
import {Observable} from "rxjs/Observable";
import {CommonService} from "../../services/common.service";
import {Subscription} from "rxjs/Subscription";
import {TokenInfoDetails} from "../../interfaces/token-info-details";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.sass']
})
export class TransferComponent implements OnInit, OnDestroy {

    @Input('tokenInfo') tokenInfo: TokenInfoDetails;
    @ViewChild('mntpInput') mntpInput;
    @ViewChild('ethInput') ethInput;
  
    public loading: boolean = false;
    public isTyping: boolean = false;
    public mntp: number = 0;
    public eth: number = 0;
    public estimateFee: number = 0;
    public averageTokenPrice: number = 0;
    public tokenBalance: BigNumber | any = 0;
    public sellPrice: BigNumber | any = 0;
    public ethAddress: string = null;
    public errors = {
      invalidBalance: false,
      ethLimit: false,
      tokenLimit: false
    };
    public etherscanUrl = environment.etherscanUrl;
    public fromToken: boolean = true;
    public ethLimits = {
      min: 0,
      max: 0
    };
    public tokenLimits = {
      min: 0,
      max: 0
    };
    public isInvalidNetwork: boolean = false;
    public MMNetwork = environment.MMNetwork;
    public isBalanceBetter: boolean = false;
    public minReturn: number;
    public isMinReturnError: boolean = false;
    public isMobile: boolean = false;
  
    private minReturnPercent = 1;
    private web3: Web3 = new Web3();
    private destroy$: Subject<boolean> = new Subject<boolean>();
    private sub1: Subscription;
  
    constructor(
      private ethService: EthereumService,
      private messageBox: MessageBoxService,
      private translate: TranslateService,
      private userService: UserService,
      private cdRef: ChangeDetectorRef,
      private commonService: CommonService
    ) { }
  
    ngOnInit() {
    }
  
    changeValue(event, fromToken: boolean) {
      this.isTyping = true;
      this.fromToken = fromToken;
  
      event.target.value = this.substrValue(event.target.value);
      fromToken ? this.mntp = +event.target.value : this.eth = +event.target.value;
  
      this.checkErrors(fromToken, +event.target.value);
    }
  
    changeMinReturn(event) {
      event.target.value = this.substrValue(event.target.value);
      this.minReturn = +event.target.value;
  
      this.isMinReturnError = this.minReturn > this.eth * this.minReturnPercent || this.minReturn <= 0;
      this.cdRef.markForCheck();
    }
  
    setCoinBalance(percent) {
      if (this.ethAddress) {
        let value = this.isBalanceBetter ? this.substrValue(this.tokenLimits.max * percent) : this.substrValue(+this.tokenBalance * percent);
        if (!value) {
          return
        }
        if (+value != this.mntp) {
          this.mntp = +value;
        }
        this.checkErrors(true, value);
        this.cdRef.markForCheck();
      }
    }
  
    substrValue(value) {
      return value.toString()
        .replace(',', '.')
        .replace(/([^\d.])|(^\.)/g, '')
        .replace(/^(\d{1,6})\d*(?:(\.\d{0,6})[\d.]*)?/, '$1$2')
        .replace(/^0+(\d)/, '$1');
    }
  
    checkErrors(fromToken: boolean, value: number) {
      this.errors.invalidBalance = fromToken && this.ethAddress && this.mntp > this.tokenBalance;
  
      this.errors.tokenLimit = fromToken && this.ethAddress && value > 0 &&
        (value < this.tokenLimits.min || value > this.tokenLimits.max);
  
      this.errors.ethLimit = !fromToken && this.ethAddress && value > 0 &&
        (value < this.ethLimits.min || value > this.ethLimits.max);
  
      this.cdRef.markForCheck();
    }
  
    initTransactionHashModal() {
      this.ethService.getSuccessSellRequestLink$.takeUntil(this.destroy$).subscribe(hash => {
        if (hash) {
          this.translate.get('MESSAGE.SentTransaction').subscribe(phrases => {
            this.messageBox.alert(`
              <div class="text-center">
                <div class="font-weight-500 mb-2">${phrases.Heading}</div>
                <div>${phrases.Hash}</div>
                <div class="mb-2 modal-tx-hash overflow-ellipsis">${hash}</div>
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
          this.messageBox.alert(phrase.Text, phrase.Heading).subscribe(ok => {
            ok && window.location.reload();
          });
        });
      }
    }
  
    onSubmit() {
      if (!this.ethAddress) {
        this.detectMetaMask('HeadingSell');
        return;
      }
  
      this.ethService._contractInfura.getMaxGasPrice((err, res) => {
        if (+res) {
          const amount = this.web3['toWei'](this.mntp);
          const minReturn = this.web3['toWei'](this.minReturn);
          this.ethService.sell(this.ethAddress, amount, minReturn, +res);
        }
      });
    }
  
    ngOnDestroy() {
      this.destroy$.next(true);
    }
}
