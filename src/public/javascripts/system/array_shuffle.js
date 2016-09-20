/**
 * Created by C5217649 on 29.01.2016.
 */

Array.prototype.shuffle = function() {
    var i = this.length, j, temp;
    if ( i === 0 ) {
        return this;
    }
    while ( --i ) {
        j = Math.floor( Math.random() * ( i + 1 ) );
        temp = this[i];
        this[i] = this[j];
        this[j] = temp;
    }
    return this;
};


Math.rand = function(min, max) {
    if (!max) {
        max = min;
        min = 0;
    }
    return (Math.round(Math.random() * (max - min) + min));
};

