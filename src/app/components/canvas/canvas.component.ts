import { CommonModule, JsonPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, computed, ElementRef, inject, model, OnInit, output, Sanitizer, Signal, signal, ViewChild, WritableSignal } from '@angular/core';
import * as go from "gojs";
import { AutomataService } from '../../core/automata.service';
import { GraphLinksModel, Quintupla, automataData } from '../../Interfaces/interfaces.interface';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { TableTransitionComponent } from '../table-transition/table-transition.component';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {  MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';

@Component({
  selector: 'app-canvas',
  imports: [MatButtonModule, MatInputModule, MatDialogModule, MatIconModule,  CommonModule, MatListModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements OnInit, AfterViewInit {

  @ViewChild('diagramDiv') diagramDiv!: ElementRef<HTMLDivElement>;

  diagram!: go.Diagram;
  automataService: AutomataService = inject(AutomataService);
  quintupla: WritableSignal<Quintupla | null> = signal(null);
  diagramaData: go.GraphLinksModel | null = null ;
  outputQuintupla = output<Quintupla| null>();
  private _snackBar = inject(MatSnackBar);

  openSnackBar(message: string, action: string = "Okay") {
    return  this._snackBar.open(message, action, { duration: 2000 });
  }

  constructor() {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.diagram = this.initializeDiagram();

    this.diagramaData = this.diagram.model as go.GraphLinksModel
  }



  initializeDiagram(): go.Diagram{
    
    let diagram = new go.Diagram(this.diagramDiv.nativeElement, {"undoManager.isEnabled": true});
    diagram.allowCopy = false;

    const nodeContextMenu = 
    go.GraphObject.build("ContextMenu")
      .add(
        go.GraphObject.build("ContextMenuButton",
          { click: this.firstState }
        )
        .add(
          new go.TextBlock()
            .bind("text", "isFirst", (isFirst: boolean) => {
              return isFirst ? "Desmarcar como Estado inicial" : "Marcar como Estado inicial"; // Cambia el texto según el estado inicial
            })
        ), 
        go.GraphObject.build("ContextMenuButton",
          { click: this.lastState }
        )
        .add(
          new go.TextBlock("Marcar como Estado final")
            .bind("text", "isLast", (isLast: boolean) => {
              return isLast ? "Desmarcar como Estado final" : "Marcar como Estado final"; // Cambia el texto según el estado final
          })
        )
      )

      // Configuracion basica del diagrama
      diagram.nodeTemplate = new go.Node(
        go.Panel.Spot , 
        { 
          contextMenu: nodeContextMenu,
        })
      .add(
        new go.Panel("Spot") // Usamos un Panel Spot para superponer las formas
          .add(

            // Círculo interno principal (siempre visible)
            new go.Shape("Circle", {
              width: 60,
              height: 60,
              stroke: "black",
              portId: "",
              cursor: "pointer",
              fromLinkable: true,
              fromLinkableDuplicates: true,
              fromLinkableSelfNode: true,
              toLinkable: true,
              toLinkableSelfNode: true,
              toLinkableDuplicates: true,
              opacity: 0.5,
            }).bind("fill", "isFirst", (isFirst: boolean) => {
              return isFirst ? "cyan" : 'white'; // Cambia el color según el estado inicial
            }),

            // Círculo interno secundario (estado final, solo si "isLast" es true)
            new go.Shape("Circle", {
              width: 50, // Tamaño menor para que esté dentro
              height: 50,
              stroke: "black",
              strokeWidth: 1,
              opacity: 0.5,
              cursor: "null",
              pickable: false,
              mouseEnter: null,
              mouseLeave: null,
              fill: null // Sin relleno
            }).bind("visible", "isLast"), // Visible solo si "isLast" es true
    
            
    
            // Etiqueta de texto dentro del círculo
            new go.TextBlock({ margin: 5, editable: true})
              .bindTwoWay("text", "label")
            )
      );

      diagram.linkTemplate = new go.Link({
        relinkableFrom: true,
        relinkableTo: true,
      })
      .add(
        new go.Shape({ strokeWidth: 1, name: 'LINE' , opacity: 0.5 }),
        new go.Shape({ toArrow: "Standard", stroke: null }),
        new go.Panel(go.Panel.Auto) // Usamos un Panel.Auto para el fondo del texto
          .add(
            new go.Shape("RoundedRectangle", { fill: "white", stroke: null, opacity: 1 }), // Fondo blanco para el texto
            new go.TextBlock(
              { 
                editable: true,
                text: 'ε',
                margin: 3, 
                textValidation: (textBlock, oldText, newText) => {
                  
                  if (newText.length > 1) {
                    this.openSnackBar("El símbolo no puede tener más de un carácter")
                    return false;
                  }

                  if(newText.length == 0) {
                    this.openSnackBar("El símbolo no puede estar vacío")
                    return false;
                  }

                  // 📌 Obtener el enlace (`LinkData`) que contiene este `TextBlock`
                  const linkData = textBlock.part?.data;
                  if (!linkData) return true;

                  // 📌 Verificar si ya existe una transición con este símbolo desde el mismo estado
                  const duplicateLink = this.diagramaData?.linkDataArray.some(
                    (link) => link["from"] === linkData.from && link["text"] === newText && link["to"] !== linkData.to
                  );

                  if (duplicateLink) {
                    this.openSnackBar(`Ya existe una transición con '${newText}' desde '${linkData.from}'`);
                    return false;
                  }
                
                  return true;
                },
              }
            ).bindTwoWay("text") // Vinculamos el texto al modelo
          )
          .bind(new go.Binding("segmentIndex").ofObject("LINE")) // Aseguramos que el panel esté en la línea
          .bind(new go.Binding("segmentFraction", "labelFraction", (f) => f === undefined ? 0.5 : f)) // Posición a lo largo de la línea
      );

      return diagram;
  }



  addNode(): void {
    
    const lastNode = this.diagram.model.nodeDataArray[this.diagram.model.nodeDataArray.length - 1]; 
    const lastNodeKey = lastNode ? lastNode["key"] : null; 
    const number = lastNodeKey ? parseInt(lastNodeKey.substring(1)) : 0; 
    let newNodeKey; 

    if(lastNodeKey){
      newNodeKey = `q${number + 1}`; 
    }else{
      newNodeKey = `q0`;
    }

    const newNode = {
      label: `${newNodeKey}`,
      key: newNodeKey,
      x: 100,
      y: 100,
      isFirst: false,
      isLast: false,
    };
    
    this.diagram.model.addNodeData(newNode);
  }

  lastState = (e: any, obj: any) => {
    const node = obj.part; // Obtener el nodo del objeto clickeado

    this.diagram.model.commit((m) => {
      const nodeData = node.part.data;
      m.set(nodeData, "isLast", !nodeData.isLast); // Cambiar el estado de isLast
    });
  }

  firstState = (e: any, obj: any) => {
    const node = obj.part; // Obtener el nodo del objeto clickeado

    // Verificar si hay un nodo con isFirst
    let FIRSTNODE  = this.diagram.model.nodeDataArray.find((n: any) => n.isFirst);

    this.diagram.model.commit((m) => {
      // Verificar si ya existe un nodo con isFirst y es el mismo nodo clickeado
      if (FIRSTNODE && FIRSTNODE["key"] === node.data.key) {
          // Si ya es el nodo actual, desmarcarlo como "isFirst"
          m.set(node.data, "isFirst", false);
          return;
      }
  
      // Si ya existe otro nodo con isFirst, no permitir más cambios
      if (FIRSTNODE) return;
  
      // Marcar el nodo actual como "isFirst"
      m.set(node.data, "isFirst", true);
    });
  }

  dialog = inject(MatDialog);
  automataQuintupla(): void {

    if(this.quintupla()){
      this.quintupla.set(null);
      this.outputQuintupla.emit(null);
      return
    }

    const model = this.diagram.model as unknown as GraphLinksModel;
    
    if(model.nodeDataArray.length == 0){

      this._snackBar.open("No se puede guardar el autómata, ya que no hay nodos", "Aceptar");
      return;
    }

    if(!model.nodeDataArray.find( (n: automataData) => n.isFirst == true)){
      this._snackBar.open("No se puede guardar el autómata, ya que no hay un estado inicial", "Aceptar");
      return;
    }

    
    for(let transicion of model.linkDataArray){
      if(transicion.text == "" || transicion.text == null){

        this._snackBar.open("No se puede guardar el autómata, ya que hay transiciones sin símbolo", "Aceptar");
        return;
      }
      
    }
    this.quintupla.set(this.automataService.quintupla(model));

    this.outputQuintupla.emit(this.quintupla());
  }

  verificarCadena(cadena: string) {
    let model = this.diagram.model as unknown as GraphLinksModel;
    let valido: boolean = this.automataService.stringEval(cadena, model);

    alert(valido ? "Cadena aceptada" : "Cadena no aceptada");

  }
}

@Component({
  selector: 'dialog-data-example-dialog',
  template: `
    <h1 mat-dialog-title>{{data.title}}</h1>
    <div mat-dialog-content>
      <p>{{data.message}}</p>
    </div>
    `,
  imports: [MatDialogModule],
})
export class DialogData{
  data = inject(MAT_DIALOG_DATA);
}
