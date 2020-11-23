Object.defineProperty(Array.prototype, "last", {
    
    get: function last() {
        return this[this.length - 1];
    },

    set: function last(x) {
        this[this.length - 1] = x;
    }
    
});