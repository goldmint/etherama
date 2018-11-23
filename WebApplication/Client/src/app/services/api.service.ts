import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";

@Injectable()
export class APIService {

  private _gasPriceLink = environment.gasPriceLink;

  constructor(
    private http: HttpClient
  ) {}

  getGasPrice() {
    return this.http.get(this._gasPriceLink);
  }

}
