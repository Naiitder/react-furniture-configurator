// Definición del nodo de historial
class HistoryNode {
    constructor(state) {
        // Si state es un objeto ThreeJS y tiene metodo clone(), realizamos una copia profunda.
        this.state = (state && typeof state.clone === 'function') ? state.clone(true) : state;
        this.prev = null;
        this.next = null;
    }
}

// Clase para administrar el historial de estados
class UndoRedoHistory {
    constructor(maxHistoryLength = 25) {
        this.current = null;
        this.maxHistoryLength = maxHistoryLength;
        this.currentHistoryLength = 0;
    }

    pruneHistory() {
        // Si se supera el límite, elimina los nodos más antiguos que no sean necesarios.
        if (this.currentHistoryLength > this.maxHistoryLength) {
            let oldest = this.findOldestReachableNode();
            while (this.currentHistoryLength > this.maxHistoryLength && oldest !== null) {
                this.removeOldestNode(oldest);
                oldest = this.findOldestReachableNode();
            }
        }
    }

    findOldestReachableNode() {
        // Retrocede desde el nodo actual hasta el nodo más antiguo
        let node = this.current;
        while (node && node.prev !== null) {
            node = node.prev;
        }
        return node;
    }

    removeOldestNode(nodeToDelete) {
        // Ajusta el enlace para eliminar el nodo más antiguo
        if (nodeToDelete && nodeToDelete.next) {
            nodeToDelete.next.prev = null;
        }
        this.currentHistoryLength--;
    }

    addState(state) {
        // Crear un nuevo nodo y realizar una copia del estado (si es ThreeJS, se clona)
        const newNode = new HistoryNode(state);

        if (this.current === null) {
            // Primer estado almacenado
            this.current = newNode;
        } else {
            // Si hay estados futuros, se descartan y se añade el nuevo estado
            this.current.next = newNode;
            newNode.prev = this.current;
            this.current = newNode;
        }
        this.currentHistoryLength++;
        this.pruneHistory();
    }

    undo() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
            // Retornamos una copia del estado para aplicarlo
            return this.current.state;
        }
        return null;
    }

    redo() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
            return this.current.state;
        }
        return null;
    }
}

export { UndoRedoHistory };