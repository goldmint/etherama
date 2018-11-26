import {Component, HostBinding, OnInit} from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.sass']
})
export class FaqComponent implements OnInit {

  @HostBinding('class') class = 'page';

  public collapse: any = {};
  public totalCollapses: number = 13;
  public ngForArray = new Array(this.totalCollapses)

  constructor() { }

  ngOnInit() {
    for (let i = 0; i < this.totalCollapses; i++) {
      this.collapse['item' + i] = true;
    }
  }

}
