({
//copy paste from aura framework since locker service blocks it
    isPlainObject: function(o){
        function isObjectObject(x) {
        return (typeof x === 'object' && x !== null)
            && Object.prototype.toString.call(x) === '[object Object]';
    }

    if (isObjectObject(o) === false) { return false; }

    // If has modified constructor
    if (typeof o.constructor !== 'function') { return false; }

    // If has modified prototype
    var p = o.constructor.prototype;
    if (isObjectObject(p) === false) { return false; }

    // If constructor does not have an Object-specific method
    if (p.hasOwnProperty('isPrototypeOf') === false) {
        return false;
    }

    // Most likely a plain Object
    return true;
    }
})