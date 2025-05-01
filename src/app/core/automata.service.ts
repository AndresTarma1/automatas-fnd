import { Injectable } from '@angular/core';
import { Quintupla, GraphLinksModel, automataData, LinkData } from '../Interfaces/interfaces.interface';


@Injectable({
  providedIn: 'root'
})
export class AutomataService {

  constructor() { }
  
  quintupla(model: GraphLinksModel): Quintupla {
    //estados
    const estados = model.nodeDataArray.map(nodo => nodo.key);

    //para ver los estados finales y iniciales
    var inicial: string = "";
    var final: string[] = [];

    model.nodeDataArray.forEach(nodo => {
  
      if (nodo.isFirst) {
        inicial=nodo.key
      } 
      if (nodo.isLast) {
        final.push(nodo.key)
      }
  
    });
  
    //para obtener el lenguaje
    var lenguanje: string[] = [];
  
    model.linkDataArray.forEach(nodo => {
      if (lenguanje.indexOf(nodo.text) === -1) lenguanje.push(nodo.text)
    });
  
  
    return {
      estados: estados,
      alfabeto: lenguanje,
      transiciones: model.linkDataArray,
      inicial: inicial,
      final: final
    };
  }
  
  stringEval(palabra: string, model: GraphLinksModel): boolean {
    const { inicial, final, transiciones } = this.quintupla(model);
    let estadoActual = inicial;
  
    for (const simbolo of palabra) {
      let transEncontrada: LinkData | null = null;
  
  
      for (const t of transiciones) {
        if (t.from === estadoActual && t.text === simbolo) {
          transEncontrada = t;
          break;
        }
      }
  
      if (!transEncontrada) return false;
  
    
      estadoActual = transEncontrada.to;
    }
  
  
    const esFinalA = final.indexOf(estadoActual) !== -1;
  
  
    const esFinalB = final.some((f: any) => f === estadoActual);
  
    return esFinalA;  
  }
  
  
  

}
