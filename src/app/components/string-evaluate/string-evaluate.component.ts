import { CommonModule } from '@angular/common';
import { Quintupla } from './../../Interfaces/interfaces.interface';
import { Component, inject, input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AutomataService } from '../../core/automata.service';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-string-evaluate',
  imports: [CommonModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './string-evaluate.component.html',
  styleUrl: './string-evaluate.component.css'
})
export class StringEvaluateComponent implements OnChanges {

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.quintupla()){
      this.stringsEvaluated = [];
    }
  }

  quintupla = input<Quintupla | null>();
  stringsEvaluated: { cadena: String, isValid: boolean}[] = [];


  automataService = inject(AutomataService);
  _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string = "Okay") {
    return  this._snackBar.open(message, action, { duration: 2000 });
  }


  evaluarCadena(cadena: string): void {

    const exist = this.stringsEvaluated.find((item) => item.cadena === cadena);

    if (exist) {
      this.openSnackBar("Cadena ya evaluada", "Okay");
      return;
    }
    let isValid = this.automataService.stringEvalWithoutModel(cadena, this.quintupla()!);
    this.stringsEvaluated.push({ cadena, isValid });
  }
}
