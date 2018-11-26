import {ChangeDetectorRef, Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {AddToken} from "../../models/add-token";

@Component({
  selector: 'app-add-token',
  templateUrl: './add-token.component.html',
  styleUrls: ['./add-token.component.sass']
})
export class AddTokenComponent implements OnInit {

  @HostBinding('class') class = 'page';
  @ViewChild('form') from;

  public addTokenData: AddToken = new AddToken();
  public controlsMap = {
    1: 'company',
    2: 'ticker',
    3: 'price',
    4: 'isCreate',
    5: 'contract',
    6: 'supply'
  }
  public currentStep: number = 1;
  public lastStep: number = Object.keys(this.controlsMap).length;
  public invalidField: boolean = true;

  constructor(
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  checkField(isNext: boolean) {
    this.invalidField = false;

    if (this.currentStep === 5 && this.addTokenData.isCreate) {
      this.currentStep = isNext ? this.currentStep+1 : this.currentStep-1;
    }

    let control = this.from.controls[this.controlsMap[this.currentStep]];
    this.invalidField = control && control.invalid;
  }

  prevStep(isNext: boolean) {
    this.currentStep--;
    this.checkField(isNext);
  }

  nextStep(isNext: boolean) {
    this.currentStep++;
    this.checkField(isNext);
  }

  addToken() {
    if (this.currentStep === this.lastStep) {
      console.log(this.addTokenData);
    }
  }
}
