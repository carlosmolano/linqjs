﻿/*-- linq.js --*/
/*-- JavaScript linq extensions --*/
/*-- const.miyang@gmail.com --*/
/*-- http://www.miyconst.com/ --*/
/*-- Verion: 0.0.1 --*/

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (callback, thisArg) {
        var T, k;

        if (this == null) {
            throw new TypeError(' this is null or not defined');
        }

        var O = Object(this);
        var len = O.length >>> 0;

        if (typeof callback !== "function") {
            throw new TypeError(callback + ' is not a function');
        }

        if (arguments.length > 1) {
            T = thisArg;
        }

        k = 0;

        while (k < len) {
            var kValue;

            if (k in O) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }

            k++;
        }
    };
}

Array.lambda = function (s) {
    if (typeof s != "string") {
        return s;
    }

    s = s.split(/=[>]/gi);
    s[1] = "return " + s[1] + ";";
    s = Function.apply(null, s);

    return s;
};

Array.prototype.linqArray = true;

Array.prototype.first = function (d) {
    var result;

    d = Array.lambda(d);

    if (d) {
        for (var i = 0; i < this.length; i++) {
            var it = this[i];

            if (d(it)) {
                return it;
            }
        }
    } else {
        result = this[0];
    }

    return result;
};
Array.prototype.last = function (d) {
    var result;

    d = Array.lambda(d);

    if (d) {
        this.forEach(function (it) {
            if (d(it)) {
                result = it;
            }
        });
    } else {
        result = this[this.length - 1];
    }

    return result;
};
Array.prototype.where = function (d) {
    var result = [];

    d = Array.lambda(d);

    this.forEach(function (it, i) {
        if (d(it, i)) {
            result.push(it);
        }
    });

    return result;
};
Array.prototype.select = function (d) {
    var result = [];

    d = Array.lambda(d);

    this.forEach(function (it, i) {
        result.push(d(it, i));
    });

    return result;
};
Array.prototype.selectMany = function (d) {
    var result = [];

    d = Array.lambda(d);

    this.forEach(function (it) {
        d(it).forEach(function (it2) {
            result.push(it2);
        });
    });

    return result;
};
Array.prototype.take = function (c) {
    var result = [];

    this.forEach(function (it, i) {
        if (i < c) {
            result.push(it);
        } else {
            return { stop: true };
        }
    });

    return result;
}
Array.prototype.skip = function (c) {
    var result = [];

    this.forEach(function (it, i) {
        if (i >= c) {
            result.push(it);
        }
    });

    return result;
};
Array.prototype.clear = function () {
    this.splice(0, this.length);
};
Array.prototype.contains = function (el) {
    return this.indexOf(el) >= 0;
};

Array.prototype.group = function (d) {
    var me = this;
    var result = [];

    d = Array.lambda(d);

    this.forEach(function (it, i) {
        var key = d(it);
        var row;

        row = result.first(function (it) {
            if (key && typeof key.equals == "function") {
                return key.equals(it.key);
            } else {
                return it.key == key;
            }
        });

        if (!row) {
            row = [];
            row.key = key;
            result.push(row);
        }
        row.push(it);
    });

    return result;
};
Array.prototype.sum = function (d, dv) {
    var result = typeof dv != "undefined" ? dv : null;

    d = Array.lambda(d);
    this.forEach(function (it, i) {
        if (result == null) {
            result = d(it);
        } else {
            result += d(it);
        }
    });

    return result;
};
Array.prototype.max = function (d, dv) {
    var result = typeof dv != "undefined" ? dv : null;
    var next;

    d = Array.lambda(d);
    this.forEach(function (it, i) {
        if (result == null) {
            result = d(it);
        } else {
            next = d(it);
            if (next > result) {
                result = next;
            }
        }
    });

    return result;
};
Array.prototype.min = function (d, dv) {
    var result = typeof dv != "undefined" ? dv : null;
    var next;

    d = Array.lambda(d);
    this.forEach(function (it, i) {
        if (result == null) {
            result = d(it);
        } else {
            next = d(it);
            if (next < result) {
                result = next;
            }
        }
    });

    return result;
};
Array.prototype.avg = function (d, dv) {
    var result = typeof dv != "undefined" ? dv : null;
    var values = [];

    d = Array.lambda(d);
    this.forEach(function (it, i) {
        values.push(d(it));
    });
    result = values.sum("x=>x") / values.length;

    return result;
};
Array.prototype.distinct = function (d) {
    var result = [];
    var match = [];

    d = Array.lambda(d);
    if (d) {
        this.forEach(function (it, i) {
            var val = d(it);
            if (!match.contains(val)) {
                result.push(it);
                match.push(val);
            }
        });
    } else {
        this.forEach(function (it, i) {
            if (!result.contains(it)) {
                result.push(it);
            }
        });
    }
    return result;
};
Array.prototype.copy = function () {
    return this.slice();
};
Array.prototype.any = function (d) {
    var result;

    d = Array.lambda(d);

    if (d) {
        this.forEach(function (it) {
            if (d(it)) {
                result = it;
                return { stop: true };
            }
        });
    } else {
        result = this[0];
    }

    return result ? true : false;
}
Array.prototype.orderBy = function (d, desc) {
    var result = this.copy();

    d = Array.lambda(d);

    result.sort(function (a, b) {
        a = d(a);
        b = d(b);

        if (a > b) {
            return desc ? -1 : 1;
        } else if (b > a) {
            return desc ? 1 : -1;
        } else {
            return 0;
        }
    });

    return result;
};
Array.prototype.orderByDesc = function (d) {
    return this.orderBy(d, true);
};
Array.prototype.findIndex = function (d) {
    d = Array.lambda(d);

    for (var i = 0; i < this.length; i++) {
        if (d(this[i])) {
            return i;
        }
    }

    return -1;
};
Array.prototype.removeElement = function (it) {
    var index = this.indexOf(it);

    if (index >= 0) {
        this.splice(index, 1);
    }
};
Array.prototype.removeEl = Array.prototype.removeElement;
Array.prototype.removeAt = function (i) {
    this.splice(i, 1);
};

if (typeof Array.prototype.indexOf != "function") {
    Array.prototype.indexOf = function (element) {
        var index = -1;
        this.forEach(function (e, i) {
            if (element == e) {
                index = i;
                return { stop: true };
            }
        });
        return index;
    };
}