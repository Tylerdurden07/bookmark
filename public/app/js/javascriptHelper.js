//Helper Function to clone any object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

//javascript prototype
Array.prototype.indexOfRootFolder = function (folderId) {
    for (var i = 0; i < this.length; i++)
        if (this[i]._id === folderId)
            return i;
    return -1;
}
