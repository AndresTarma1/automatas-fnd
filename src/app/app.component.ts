import { Component } from '@angular/core';
import { CanvasComponent } from "./components/canvas/canvas.component";
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [CanvasComponent, MatIconModule, MatToolbarModule, MatDividerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'automatas-fnd';

}
