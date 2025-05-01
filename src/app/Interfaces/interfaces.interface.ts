export interface automataData {
    key: string;
    label: string;
    x: number;
    y: number;
    isFirst: boolean;
    isLast: boolean;
};

export interface LinkData {
    from: string;
    to: string;
    text: string;
};

export interface GraphLinksModel {
    class: string;
    nodeDataArray: automataData[];
    linkDataArray: LinkData[];
};

export interface Quintupla {
    estados: string[];
    alfabeto: string[];
    transiciones: LinkData[];
    inicial: string;
    final: string[];
};