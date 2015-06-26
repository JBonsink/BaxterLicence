function barcodeListener(containerCallback, drawerCallback) {
    /// <signature>
    /// <summary>
    /// Returns barcode listener object. The listener can detect container and drawer barcodes. When
    /// a barcode of said types is scanned, the corresponding callback is called. The ID encoded in the
    /// barcode is passed as an argument.
    /// </summary>
    /// <param name="containerCallback" type="function" />
    /// <param name="drawerCallback" type="function" />
    /// </signature>
    
    this._pause = false;
    this._reading = false;
    this._barcode = null;
    this._containerCb = containerCallback;
    this._drawerCb = drawerCallback;
            
    var self = this;
    $('body').keydown(function (e) {
        // Dollar 
        if (e.which == 52 && e.shiftKey) {
            self._barcode = "";
            self._reading = true;
        } // Percentage
        else if (e.which == 53 && e.shiftKey) {
            self._reading = false;
            self._checkBarcode();
        }  // Alfanumerical, 48-59 = 0-9, 64-91 = A-Z
        else if (self._reading && (e.which > 47 && e.which < 59 || e.which > 64 && e.which < 91)) {
            var c = String.fromCharCode(e.which);
            self._barcode += c;
        }
    });
                           
    this._checkBarcode = function () {
        var self = this;
        if (self._pause) return;

        if (self._barcode.startsWith('D')) {
            var containerID = self._barcode.substring(1) ^ 341334;
            if (self._containerCb && $.isFunction(self._containerCb)) self._containerCb(containerID);
        }
        else if (self._barcode.startsWith('L')) {
            var drawerID = self._barcode.substring(1) ^ 341334;
            if (self._drawerCb && $.isFunction(self._drawerCb)) self._drawerCb(drawerID);
        }
    };

    this.pause = function () {
        /// <signature>
        /// <summary>
        /// Pause the listener. The callbacks will not be called.
        /// </summary>
        /// </signature>
        this._pause = true;
    };

    this.unpause = function () {
        /// <signature>
        /// <summary>
        /// Unpause the listener.
        /// </summary>
        /// </signature>
        this._pause = false;
    };
}
