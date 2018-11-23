import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import { MessageBoxService } from '../../services/message-box.service';

@Injectable()
export class APIHttpInterceptor implements HttpInterceptor {

  constructor(private _messageBox: MessageBoxService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(req)
      .catch((error, caught) => {
        this._messageBox.alert('Service is temporary unavailable', 'Info');

        return Observable.throw(error);
      }) as any;
  }

}
