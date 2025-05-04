import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { Quintupla } from '../../Interfaces/interfaces.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quintuple',
  imports: [MatCardModule, MatListModule, CommonModule],
  templateUrl: './quintuple.component.html',
  styleUrl: './quintuple.component.css'
})
export class QuintupleComponent {
  
  quintupla = input<Quintupla | null>();


  
}
