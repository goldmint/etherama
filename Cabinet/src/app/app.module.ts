import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppRouting } from './app.routing';

import { APIHttpInterceptor } from './common/api/api-http.interceptor';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { registerLocaleData } from '@angular/common';
import localeRu from '@angular/common/locales/ru';
registerLocaleData(localeRu);

import {
  BsDropdownModule,
  ModalModule,
  ButtonsModule
} from 'ngx-bootstrap';

import { HeaderBlockComponent } from './blocks/header-block/header-block.component';
import { NavbarBlockComponent } from './blocks/navbar-block/navbar-block.component';
import { MessageBoxComponent } from './common/message-box/message-box.component';
import { SpriteComponent } from './common/sprite/sprite.component';
import {EthereumService} from "./services/ethereum.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MessageBoxService} from "./services/message-box.service";
import {APIService} from "./services/api.service";
import {NotFoundPageComponent} from "./components/not-found-page/not-found-page.component";
import {LanguageSwitcherBlockComponent} from "./blocks/language-switcher-block/language-switcher-block.component";
import {UserService} from "./services/user.service";
import {BuyComponent} from "./components/buy/buy.component";
import {SellComponent} from "./components/sell/sell.component";
import {HomeComponent} from "./components/home/home.component";
import {SubstrPipe} from "./pipes/substr.pipe";
import {NoexpPipe} from "./pipes/noexp.pipe";
import { PromoBonusComponent } from './components/promo-bonus/promo-bonus.component';
import { AddTokenComponent } from './components/add-token/add-token.component';
import { TimerComponent } from './common/timer/timer.component';
import { StatisticChartsComponent } from './components/statistic-charts/statistic-charts.component';
import { BuySellModalComponent } from './common/buy-sell-modal/buy-sell-modal.component';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    AppRouting,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    ButtonsModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [
    AppComponent,
    LanguageSwitcherBlockComponent,
    HeaderBlockComponent,
    NavbarBlockComponent,
    MessageBoxComponent,
    SpriteComponent,
    NotFoundPageComponent,
    HomeComponent,
    BuyComponent,
    SellComponent,
    SubstrPipe,
    NoexpPipe,
    PromoBonusComponent,
    AddTokenComponent,
    TimerComponent,
    StatisticChartsComponent,
    BuySellModalComponent
  ],
  exports: [],
  providers: [
    Title,
    MessageBoxService,
    APIService,
    UserService,
    EthereumService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: APIHttpInterceptor,
      multi: true
    }
  ],
  entryComponents: [
    MessageBoxComponent,
    BuySellModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
