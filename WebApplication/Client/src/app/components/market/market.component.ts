import {Component, HostBinding, HostListener, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {BsModalRef, BsModalService} from "ngx-bootstrap";
import {UserService} from "../../services/user.service";
import {APIService} from "../../services/api.service";
import {TranslateService} from "@ngx-translate/core";
import {Page} from "../../models/page.model";

@Component({
  selector: 'app-market',
  templateUrl: './market.component.html',
  styleUrls: ['./market.component.sass']
})
export class MarketComponent implements OnInit {

  @ViewChild('searchInput') searchInput;
  @HostBinding('class') class = 'page';
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    let isMobile = event.target.innerWidth <= 992;
    this.isMobile !== isMobile && this.redrawingMiniCharts();
    this.isMobile = isMobile;
  }

  public page = new Page();
  public rows: Array<any> = [];
  public sorts: Array<any> = [{prop: 'date', dir: 'desc'}];
  public messages: any  = {emptyMessage: 'No data'};
  public isMobile: boolean = false;
  public loading: boolean = false;
  public isDataLoaded: boolean = false;
  public searchValue: string = '';

  private charts = {};
  private miniCharts = [];
  private destroy$: Subject<boolean> = new Subject<boolean>();

  modalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private userService: UserService,
    private apiService: APIService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.searchInput.valueChanges
      .debounceTime(500)
      .distinctUntilChanged()
      .takeUntil(this.destroy$)
      .subscribe(value => {

      });

    this.isMobile = (window.innerWidth <= 992);

    this.page.pageNumber = 0;
    this.page.size = 10;

    this.setPage({ offset: 0 });

    // const combined = combineLatest();
    // combined.subscribe(data => {
    //   this.isDataLoaded = true;
    // });

    this.userService.currentLocale.takeUntil(this.destroy$).subscribe(() => {
      if (this.isDataLoaded) {
        this.translate.get('PAGES.TokenList.Chart.Detail').subscribe(phrase => {
          this.charts['chart'] && this.charts['chart'].title(phrase);
        });
      }
    });
  }

  onSort(event) {
    this.sorts = event.sorts;
    this.setPage({ offset: 0 });
  }

  setPage(pageInfo) {
    // this.loading = true;
    this.page.pageNumber = pageInfo.offset;

    for (let i = 0; i<= 8; i++) {
      this.rows.push(
        {
          chartData: [
            ["2018-11-06", Math.floor(Math.random() * 11)],
            ["2018-11-05", Math.floor(Math.random() * 11)],
            ["2018-11-04", Math.floor(Math.random() * 11)],
            ["2018-11-03", Math.floor(Math.random() * 11)],
            ["2018-11-02", Math.floor(Math.random() * 11)],
            ["2018-11-01", Math.floor(Math.random() * 11)],
          ]
        }
      )
    }

    this.rows.forEach((item, i) => {
      setTimeout(() => {
        this.createMiniChart(item.chartData, i);
      }, 0);
    });

    this.page.totalElements = this.rows.length;
    this.page.totalPages = Math.ceil(this.page.totalElements / this.page.size);
    this.isDataLoaded = true;

    // this.apiService.getActiveNodes(this.page.pageNumber * this.page.size, this.page.size, this.sorts[0].prop, this.sorts[0].dir)
    //   .finally(() => {
    //     this.loading = false;
    //   })
    //   .subscribe(
    //     res => {
    //       this.rows = res['data'].items.map((item, i) => {
    //         item.chartData = [];
    //         item.nodeInfo.launchDate = new Date(item.nodeInfo.launchDate.toString() + 'Z');
    //         const nodeRewardDict = item.nodeRewardDict[item.nodeInfo.nodeWallet];
    //
    //         if (nodeRewardDict.length) {
    //           item.rewardData = {
    //             ctRewardTotal: nodeRewardDict[nodeRewardDict.length - 1].ctRewardTotal,
    //             utRewardTotal: nodeRewardDict[nodeRewardDict.length - 1].utRewardTotal
    //           };
    //
    //           nodeRewardDict.forEach(node => {
    //             const date = new Date(node.createDate.toString() + 'Z');
    //             let month = (date.getMonth()+1).toString();
    //             month.length === 1 && (month = '0' + month);
    //             const dateString = date.getFullYear() + '-' + month + '-' + date.getDate();
    //             item.chartData.push([dateString, node.ctRewardTotal]);
    //           });
    //         } else {
    //           item.rewardData = {
    //             ctRewardTotal: '-',
    //             utRewardTotal: '-'
    //           };
    //         }
    //
    //         setTimeout(() => {
    //           this.createMiniChart(item.chartData, i);
    //         }, 0);
    //         return item;
    //       });
    //
    //       this.page.totalElements = res['data'].total;
    //       this.page.totalPages = Math.ceil(this.page.totalElements / this.page.size);
    //       this.isDataLoaded = true;
    //     });
  }

  createMiniChart(data: any[], i: number) {
    anychart.onDocumentReady( () => {
      this.miniCharts[i] = {};
      const container = 'chart-container-' + i;
      const child = document.querySelector(`#${container} > div`);
      child && child.remove();

      this.miniCharts[i]['table'] = anychart.data.table();
      this.miniCharts[i]['table'].addData(data);

      this.miniCharts[i]['mapping'] = this.miniCharts[i]['table'].mapAs();
      this.miniCharts[i]['mapping'].addField('value', 1);

      this.miniCharts[i]['chart'] = anychart.stock();
      this.miniCharts[i]['chart'].scroller().enabled(false);
      this.miniCharts[i]['chart'].crosshair(false);
      this.miniCharts[i]['chart'].plot(0).line(this.miniCharts[i]['mapping']);

      this.miniCharts[i]['chart'].plot(0).xAxis().enabled(false);
      this.miniCharts[i]['chart'].plot(0).yAxis().enabled(false);
      this.miniCharts[i]['chart'].plot(0).legend().enabled(false);

      if (document.getElementById(container)) {
        this.miniCharts[i]['chart'].container(container);
        this.miniCharts[i]['chart'].draw();
      }
    });
  }

  showDetailsChart(data: any[], template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    document.querySelector('modal-container').classList.add('modal-chart');
    this.initDetailsChart(data);
  }

  initDetailsChart(data: any[]) {
    anychart.onDocumentReady( () => {
      this.charts['table'] && this.charts['table'].remove();

      this.charts['table'] = anychart.data['table']();
      this.charts['table'].addData(data);

      this.charts['mapping'] = this.charts['table'].mapAs();
      this.charts['mapping'].addField('value', 1);

      this.charts['chart'] = anychart.stock();

      this.charts['chart'].plot(0).line(this.charts['mapping']);
      this.charts['chart'].plot(0).legend().itemsFormatter(() => {
        return [
          {text: "Total reward", iconFill:"#63B7F7"}
        ]
      });

      this.translate.get('PAGES.TokenList.Chart.Detail').subscribe(phrase => {
        this.charts['chart'].title(phrase);
      });

      this.charts['chart'].container('details-chart-container');
      this.charts['chart'].draw();
    });
  }

  redrawingMiniCharts() {
    this.miniCharts = [];
    this.rows.forEach((item, i) => {
      setTimeout(() => {
        this.createMiniChart(item.chartData, i);
      }, 0);
    });
  }

  search() {

  }

  ngOnDestroy() {
    this.destroy$.next(true);
  }

}
