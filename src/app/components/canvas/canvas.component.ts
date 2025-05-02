import { JsonPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import * as go from "gojs";
import { AutomataService } from '../../core/automata.service';
import { GraphLinksModel, Quintupla, automataData } from '../../Interfaces/interfaces.interface';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import { TableTransitionComponent } from '../table-transition/table-transition.component';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-canvas',
  imports: [MatButtonModule, MatInputModule, TableTransitionComponent, MatDialogModule],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.css'
})
export class CanvasComponent implements OnInit {

  @ViewChild('diagramDiv', {static: true}) diagramDiv!: ElementRef<HTMLDivElement>;

  diagram!: go.Diagram;
  automataService: AutomataService = inject(AutomataService);
  quintupla: Quintupla | null = null; 

  ngOnInit() {
    this.initializeDiagram();
  }


  initializeDiagram(): void {
    
    this.diagram = new go.Diagram(this.diagramDiv.nativeElement, {"undoManager.isEnabled": true});

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
      this.diagram.nodeTemplate = new go.Node("Auto", { contextMenu: nodeContextMenu })
      .add(
        new go.Panel("Spot") // Usamos un Panel Spot para superponer las formas
          .add(
            // Círculo interno secundario (estado final, solo si "isLast" es true)
            new go.Shape("Circle", {
              width: 50, // Tamaño menor para que esté dentro
              height: 50,
              stroke: "black",
              strokeWidth: 1,
              opacity: 0.5,
              fill: null // Sin relleno
            }).bind("visible", "isLast"), // Visible solo si "isLast" es true
    
            // Círculo interno principal (siempre visible)
            new go.Shape("Circle", {
              width: 60,
              height: 60,
              stroke: "black",
              fill: null,
              portId: "",
              cursor: "pointer",
              fromLinkable: true,
              fromLinkableDuplicates: true,
              fromLinkableSelfNode: true,
              toLinkable: true,
              toLinkableSelfNode: true,
              opacity: 0.5,
            }).bind("fill", "isFirst", (isFirst: boolean) => {
              return isFirst ? "cyan" : null; // Cambia el color según el estado inicial
            }),
    
            // Etiqueta de texto dentro del círculo
            new go.TextBlock({ margin: 5 })
              .bindTwoWay("text", "label")
          )
      );

      this.diagram.linkTemplate = new go.Link({
        relinkableFrom: true,
        relinkableTo: true,
      })
      .add(
        new go.Shape({ strokeWidth: 1, name: 'LINE' , opacity: 0.5 }),
        new go.Shape({ toArrow: "Standard", stroke: null }),
        new go.Panel(go.Panel.Auto) // Usamos un Panel.Auto para el fondo del texto
          .add(
            new go.Shape("RoundedRectangle", { fill: "white", stroke: null, opacity: 1 }), // Fondo blanco para el texto
            new go.TextBlock({ text: 'Input', editable: true, margin: 3 })
              .bindTwoWay("text")
          )
          .bind(new go.Binding("segmentIndex").ofObject("LINE")) // Aseguramos que el panel esté en la línea
          .bind(new go.Binding("segmentFraction", "labelFraction", (f) => f === undefined ? 0.5 : f)) // Posición a lo largo de la línea
      );
  }


  addNode(): void {
    const newNodeKey = `q${this.diagram.model.nodeDataArray.length}`; // Generar un ID único para el nodo
    const newNode = {
      key: newNodeKey,
      label: `${newNodeKey}`,
      x: 100, // Posición inicial en X
      y: 100,  // Posición inicial en Y,
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

    if(this.quintupla){
      this.quintupla = null;
      return
    }

    
    const model = this.diagram.model as unknown as GraphLinksModel;
    
    if(model.nodeDataArray.length == 0){
      this.dialog.open(DialogData, {
        data: {
          message: `No se puede guardar el autómata, ya que no hay nodos`,
          title: "Error",
          buttonText: "Aceptar",
        },
      });
      
      return;
    }
    
    for(let transicion of model.linkDataArray){
      if(transicion.text == "" || transicion.text == null){
        this.dialog.open(DialogData, {
          data: {
            message: `No se puede guardar el autómata, ya que del estado ${transicion.from} al estado ${transicion.to} no hay un símbolo definido`,
            title: "Error",
            buttonText: "Aceptar",
          },
        });
        return;
      }
      
    }
    this.quintupla = this.automataService.quintupla(model);
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
