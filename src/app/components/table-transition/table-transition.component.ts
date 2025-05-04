import { Component, effect, Input, input, InputSignal, OnInit } from '@angular/core';
import { LinkData, Quintupla } from '../../Interfaces/interfaces.interface';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-table-transition',
  imports: [MatTableModule, CommonModule],
  templateUrl: './table-transition.component.html',
  styleUrl: './table-transition.component.css'
})
export class TableTransitionComponent implements OnInit {

  quintupla = input<Quintupla| null>();

  estados: string[] = [];
  alfabeto: string[] = [];
  transiciones: LinkData[] = [];

  dataSource: any= []; // Use any[] for simplicity
  Columnas: string[] = []; // Start with 'estado'

  constructor(){
    effect( () => {
      this.dataSource = [];
      this.modifyTable();
    })
  }
  ngOnInit(): void {

    
  }

  modifyTable() {
    if (this.quintupla()) {
      this.estados = this.quintupla()!.estados;
      this.alfabeto = this.quintupla()!.alfabeto;
      this.transiciones  = this.quintupla()!.transiciones;
    }

    this.Columnas = ['estado', ...this.alfabeto] // Add 'estado' and the symbols to the columns

    for(const estado of this.estados){
      const fila: any = { estado }; // Create an object with the 'estado' property

      for (const simbolo of this.alfabeto) {
        fila[simbolo] = this.obtenerTransicion(estado, simbolo); // Add the transition value for each symbol
      }
      this.dataSource.push(fila); // Push the row object to the dataSource array
    }
  }

  obtenerTransicion(estado: string, simbolo: string): string {

    // Busca la transición correspondiente al estado y símbolo
    const transicion = this.quintupla()?.transiciones.find(
      (t) => t.from === estado && t.text === simbolo
    );
    return transicion ? transicion.to : '-';
  }
  
}
