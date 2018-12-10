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
import {Meta} from "@angular/platform-browser";
import {MainContractService} from "../../services/main-contract.service";

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
  public refLink: string = '';
  public isRefAvailable: boolean = false;

  public tokenSupply: BigNumber | any = 0;
  public totalData: any = {
    totalEth: 0,
    totalTokens: 0
  };
  public isDataLoaded: boolean = false;
  public isBankLoaded: boolean = false;
  public expirationTime = {
    expiration: '-',
    tillExpiration: '-'
  };
  public tillExpiration: number = null;
  public tokenInfo: TokenInfo;
  public invalidContractAddress: boolean = false;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private ethService: EthereumService,
    private mainContractService: MainContractService,
    private userService: UserService,
    private apiService: APIService,
    private commonService: CommonService,
    private messageBox: MessageBoxService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private meta: Meta
  ) { }

  ngOnInit() {
    this.route.params.takeUntil(this.destroy$).subscribe(params => {
      let address = params.id,
          tokenAddress,
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
            tokenAddress = token.tokenContractAddress;
          }
        });

        if (addressExist) {
          let data: any = {};
          data.etheramaContractAddress = address;
          data.tokenContractAddress = tokenAddress;
          data.tokenId = tokenId;
          data.isTradePage = true;
          this.commonService.passMarketData$.next(data);

          this.apiService.getTokenInfo(tokenId).subscribe((data: any) => {
            this.tokenInfo = data.data;

            // ---
            this.meta.addTag({name: 'title', content: this.tokenInfo.ticker + ' ON ETHERAMA.IO'});
            this.meta.addTag({name: 'description', content: this.tokenInfo.description});

            this.meta.addTag({name: 'twitter:card', content: 'summary'});
            this.meta.addTag({name: 'twitter:site', content: 'ETHERAMA.IO'});
            this.meta.addTag({name: 'twitter:creator', content: 'ETHERAMA.IO'});

            this.meta.addTag({property: 'og:site_name', content: 'ETHERAMA.IO'});
            this.meta.addTag({property: 'og:title', content: this.tokenInfo.ticker + ' ON ETHERAMA.IO'});
            this.meta.addTag({property: 'og:description', content: this.tokenInfo.description});
            this.meta.addTag({property: 'og:url', content:this.refLink});
            this.meta.addTag({property: 'og:image', content: this.tokenInfo.logoUrl});
            this.meta.addTag({property: 'og:type', content: 'website'});
            // --

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

    this.commonService.isDataLoaded$.subscribe((isLoaded: any) => {
      this.isBankLoaded = isLoaded;
      this.cdRef.markForCheck();
    });

    this.mainContractService.isRefAvailable$.takeUntil(this.destroy$).subscribe(data => {
      this.isRefAvailable = data.isAvailable;
      this.refLink = data.refLink;
      this.cdRef.markForCheck();
    });
  }

  initTradePage() {
    this.ethService.passTokenBalance.takeUntil(this.destroy$).subscribe(balance => {
      if (balance) {
        this.tokenBalance = balance;
        this.cdRef.markForCheck();
      }
    });

    this.ethService.passEthAddress.takeUntil(this.destroy$).subscribe(address => {
      address && (this.ethAddress = address);
      if (this.ethAddress && !address) {
        this.ethAddress = address;
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
  }

  openBuySellModal() {
    this.messageBox.buySell(false);
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
