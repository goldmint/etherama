import {Component, HostBinding, OnInit} from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.sass']
})
export class AboutComponent implements OnInit {

  @HostBinding('class') class = 'page';

  public collapse: any = {};
  public totalCollapses: number = 8;

  constructor() { }

  ngOnInit() {
    for (let i = 1; i <= this.totalCollapses; i++) {
      this.collapse['item' + i] = true;
    }
  }

}
