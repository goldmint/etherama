import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {EthereumService} from "../../services/ethereum.service";
import {Subject} from "rxjs/Subject";
import * as Web3 from "web3";
import {BigNumber} from "bignumber.js";
import {environment} from "../../../environments/environment";
import {TranslateService} from "@ngx-translate/core";
import {MessageBoxService} from "../../services/message-box.service";
import {UserService} from "../../services/user.service";
import {CommonService} from "../../services/common.service";
import {TokenInfoDetails} from "../../interfaces/token-info-details";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.sass']
})
export class TransferComponent implements OnInit, OnDestroy {

  @Input('tokenInfo') tokenInfo: TokenInfoDetails;

  public tokenAmount: number = 0;
  public toAddress: string;
  public tokenBalance: BigNumber | any = 0;
  public ethAddress: string = null;
  public errors = {
    invalidBalance: false,
    invalidAddress: false,
    addressMatches: false
  };
  public etherscanUrl = environment.etherscanUrl;

  public isInvalidNetwork: boolean = false;
  public MMNetwork = environment.MMNetwork;
  public isMobile: boolean = false;

  private web3: Web3 = new Web3();
  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private messageBox: MessageBoxService,
    private translate: TranslateService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.initTransactionHashModal();

    this.ethService.passTokenBalance.takeUntil(this.destroy$).subscribe(balance => {
      if (balance) {
        this.tokenBalance = balance;
        this.tokenAmount = +this.substrValue(+balance);
        this.checkErrors();
      }
      this.cdRef.markForCheck();
    });

    this.ethService.passEthAddress.takeUntil(this.destroy$).subscribe(address => {
      this.ethAddress = address;
      if (address !== null) {
        if (this.ethAddress && !address) {
          this.tokenBalance = this.tokenAmount = 0;
        }
        this.checkErrors();
        this.toAddress && this.changeAddress(this.toAddress);
      }
      this.cdRef.markForCheck();
    });

    this.ethService.getObservableNetwork().takeUntil(this.destroy$).subscribe(network => {
      network !== null && (this.isInvalidNetwork = network != this.MMNetwork.index);
      this.cdRef.markForCheck();
    });

    this.commonService.isMobile$.takeUntil(this.destroy$).subscribe(isMobile => this.isMobile = isMobile);
  }

  changeValue(event) {
    event.target.value = this.substrValue(event.target.value);
    this.tokenAmount = +event.target.value
    this.checkErrors();
    this.cdRef.markForCheck();
  }

  changeAddress(address: string) {
    this.errors.invalidAddress = !this.ethService.isValidAddress(address);
    this.ethAddress && (this.errors.addressMatches = address.toLowerCase() === this.ethAddress.toLowerCase());
    this.cdRef.markForCheck();
  }

  setCoinBalance(percent) {
    if (this.ethAddress) {
      this.tokenAmount = this.substrValue(+this.tokenBalance * percent);
      this.checkErrors();
    }
  }

  substrValue(value) {
    return value.toString()
      .replace(',', '.')
      .replace(/([^\d.])|(^\.)/g, '')
      .replace(/^(\d{1,6})\d*(?:(\.\d{0,6})[\d.]*)?/, '$1$2')
      .replace(/^0+(\d)/, '$1');
  }

  checkErrors() {
    this.errors.invalidBalance = this.ethAddress && this.tokenAmount > this.tokenBalance;
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

    const amount = this.web3['toWei'](this.tokenAmount);
    this.ethService._contractInfura.getMaxGasPrice((err, res) => {
      if (+res) {
        this.ethService.transfer(this.ethAddress, this.toAddress, amount, +res);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }
}
