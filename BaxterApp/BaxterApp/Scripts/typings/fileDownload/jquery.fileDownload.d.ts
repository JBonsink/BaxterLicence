interface JQueryStatic {
    fileDownload(url: string, options: FileDownload.Options): JQueryDeferred<JQuery>
}

declare module FileDownload {

    interface Options {
        httpMethod: string;
        data: Object;
        preparingMessageHtml: string;
        failMessageHtml: string;
        failCallback(responseHtml: string, url: string): void;
    }
}