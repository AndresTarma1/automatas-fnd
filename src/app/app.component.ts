import { Component, signal, WritableSignal } from '@angular/core';
import { CanvasComponent } from "./components/canvas/canvas.component";
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { QuintupleComponent } from "./components/quintuple/quintuple.component";
import { Quintupla } from './Interfaces/interfaces.interface';
import { TableTransitionComponent } from "./components/table-transition/table-transition.component";

@Component({
  selector: 'app-root',
  imports: [CanvasComponent, MatIconModule, MatToolbarModule, MatDividerModule, MatTabsModule, QuintupleComponent, TableTransitionComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  title = 'automatas-fnd';
  quintupla: WritableSignal<Quintupla | null> = signal(null); // Initialize with null or a default value


  obtenerQuintupla(quintupla : Quintupla | null) {
    this.quintupla.set(quintupla);
  }

}
