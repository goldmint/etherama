import { Component, OnInit } from '@angular/core';
import 'anychart';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-statistic-charts',
  templateUrl: './statistic-charts.component.html',
  styleUrls: ['./statistic-charts.component.sass']
})
export class StatisticChartsComponent implements OnInit {

  public charts = {
    chart1: {},
    chart2: {},
    chart3: {}
  };
  public chartData = [
    ["2018-11-21", 11.177973000000003],
    ["2018-11-20", 23.997816999999994],
    ["2018-11-19", 33.667323],
    ["2018-11-18", 25.703345000000013],
    ["2018-11-17", 14.102203999999999],
    ["2018-11-16", 0.930288]
  ]

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
    for (let chart in this.charts) {
      this.initDailyStatChart(this.charts[chart], this.chartData, chart);
    }
  }

  // setChartsData(res) {
  //   if (res) {
  //     res.forEach(item => {
  //       const date = new Date(item.time * 1000);
  //       let month = (date.getMonth()+1).toString(),
  //         day = date.getDate().toString();
  //
  //       month.length === 1 && (month = '0' + month);
  //       day.length === 1 && (day = '0' + day);
  //
  //       const dateString = date.getFullYear() + '-' + month + '-' + day;
  //       this.rateChartData.push([dateString, +item.currently_opened_amount]);
  //     });
  //   }
  // }

  initDailyStatChart(chart: any, data: any[], id: string) {
    anychart.onDocumentReady( () => {
      chart.table = anychart.data.table();
      chart.table.addData(data);
      chart.mapping = chart.table.mapAs();
      chart.mapping.addField('value', 1);

      chart.chart = anychart.stock();
      chart.chart.plot(0).line(chart.mapping).name('Value');
      chart.chart.plot(0).legend().itemsFormatter(() => {
        return [
          {text: "Value", iconFill:"#63B7F7"}
        ]
      });

      chart.chart.title(id);
      // this.translate.get('PAGES.Pawnshop.Feed.PawnshopDetails.Charts.Rate').subscribe(phrase => {
      //   chart.chart.title(phrase);
      // });
      let containerId = 'chart-container-' + id;
      chart.chart.container(containerId);
      chart.chart.draw();
    });
  }

}
