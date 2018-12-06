import {Component, HostBinding, OnInit} from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.sass']
})
export class FaqComponent implements OnInit {

  @HostBinding('class') class = 'page';

  public collapse: any = {
    about: {},
    faq: {}
  };
  public totalCollapses = {
    about: 8,
    faq: 13
  }
  public ngForArray = new Array(this.totalCollapses.faq);

  constructor() { }

  ngOnInit() {
    for (let i = 1; i <= this.totalCollapses.about; i++) {
      this.collapse.about['about' + i] = true;
    }

    for (let i = 0; i < this.totalCollapses.faq; i++) {
      this.collapse.faq['faq' + i] = true;
    }
  }

}
