/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/fileDownload/jquery.fileDownload.d.ts" />

/// <signature>
/// <summary>Downloads an object asynchronously. Returns a deferred object. Example: .done(function (data) { //Do something })</summary>
/// <param name="url" type="String" />
/// <param name="data" type="JSON">JSON object to be send to the server</param>
/// <param name="type" type="String">Default value is POST</param>
/// </signature>
function downloadObjectAsync(url:string, data:any, type?) {
    var deferred = $.Deferred();

    $.ajax({
        url: url,
        type: type || 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(data),
        success: function (data) {
            deferred.resolve(data);
        },
        error: function () {
            console.log("Communication error");
        }
    });
    return deferred;
}

/**
 * Synchronously download a variable number of objects. Returns a deferred object. 
 * Example: downloadObjects("url1", "url2", ...).done(function(object1, object2, ...) {});</summary>
 */
function downloadObjects(url: string, ...restUrls: string[]) {
    var deferred = $.Deferred();
    var deferreds = [];

    for (var i = 0; i < arguments.length; ++i) {
        if (typeof arguments[i] != "string" || arguments[i] != "") {
            deferreds.push($.ajax({
                url: arguments[i],
                type: "POST",                
            }));
        } else {
            deferreds.push({ 0: {} });
        }
    }

    $.when.apply($, deferreds).done(function () {
        var objects = [];

        if (deferreds.length == 1) {
            objects.push(arguments[0]);
        } else if (deferreds.length > 1) {
            for (var i = 0; i < arguments.length; ++i) {
                objects.push(arguments[i][0]);
            }
        }
        deferred.resolve.apply(deferred, objects);
    });

    return deferred;
}

/// <signature>
/// <summary>Submit data via a post message to the server. 
/// <param name="url" type="String" />
/// <param name="data" type="Object">Data to be send to the server</param>
/// <param name="cb" type="Function">Function called when data.Result is OK.</param>
/// </signature>
function submitData(url, data, cb) {
    $.ajax({
        url: url,
        data: data,        
        type: 'POST',
        success: function (data) {           
            if ($.isFunction(cb)) cb(data);
        },
        error: function (data) {
            if ($.isFunction(cb)) cb(data);
            console.log("Communication error");
        },
    });
};

/// <signature>
/// <summary>Download a file using the jQuery fileDownload plugin
/// <param name="url" type="String" />
/// <param name="data" type="Object">Data to be send to the server</param>
/// <param name="doneCb" type="Function">Function callback when a server resonse has been received.</param>
/// </signature>
function downloadFile(url, data, doneCb)
{
    $.fileDownload(url, {
        httpMethod: 'POST',
        data: data,
        preparingMessageHtml: Resources.Global.General_PreparingDownload,
        failMessageHtml: Resources.Global.General_ErrorPleaseTryAgain,
        failCallback: function (responseHtml, url) {
            var rawRespone = $(responseHtml).text();
            if (rawRespone.length > 0) {
                var response = JSON.parse(rawRespone);

                this.failMessageHtml = response.Message;
            }
        },
    }).done(function () {
        if ($.isFunction(doneCb))        
            doneCb();                    
    });
}