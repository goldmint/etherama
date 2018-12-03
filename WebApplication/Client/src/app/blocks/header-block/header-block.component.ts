import { Component, OnInit, ViewEncapsulation, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import {UserService} from "../../services/user.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header-block.component.html',
  styleUrls: ['./header-block.component.sass'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderBlockComponent implements OnInit {

  public locale: string;
  public isShowMobileMenu: boolean = false;
  public isMobile: boolean = false;

  constructor(
    private cdRef: ChangeDetectorRef,
    private userService: UserService,
    private router: Router
  ) {
    router.events.subscribe(route => {
      if (route instanceof NavigationEnd) {
        this.isShowMobileMenu = false;
        this.cdRef.markForCheck();
      }
    })
  }

  ngOnInit() {
    this.userService.currentLocale.subscribe(currentLocale => {
      this.locale = currentLocale;
      this.cdRef.markForCheck();
    });

    window.innerWidth > 992 ? this.isMobile = this.isShowMobileMenu = false : this.isMobile = true;

    window.onresize = () => {
      if (window.innerWidth > 992) {
        this.isMobile = this.isShowMobileMenu = false;
        document.body.style.overflow = 'visible';
      } else {
        this.isMobile = true;
      }
      this.cdRef.markForCheck();
    };
    this.cdRef.markForCheck();
  }

  toggleMobileMenu(e) {
    this.isShowMobileMenu = !this.isShowMobileMenu;
    document.body.style.overflow = this.isShowMobileMenu ? 'hidden' : 'visible';
    e.stopPropagation();
    this.cdRef.markForCheck();
  }
}
