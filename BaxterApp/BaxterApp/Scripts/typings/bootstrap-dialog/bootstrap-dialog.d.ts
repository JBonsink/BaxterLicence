/// <reference path="../jquery/jquery.d.ts"/>

declare var BootstrapDialog: Modal.BootstrapDialog_Static;

declare module Modal {
    interface BootstrapDialog_Static {
        new (options: Options): BootstrapDialog_Instance;

        TYPE_DEFAULT;
        TYPE_INFO;
        TYPE_PRIMARY;
        TYPE_SUCCESS;
        TYPE_WARNING;
        TYPE_DANGER;

        SIZE_NORMAL;
        SIZE_WIDE;
        SIZE_LARGE;

        confirm(options: ConfirmOptions);
        show(options: Options);
    }

    interface BootstrapDialog_Instance {
        open();
        close();
        enableButtons(enable: boolean);
        setButtons(buttons: Array<ButtonOptions>);
        getButton(buttonID: string): Button;
        setData(key: string, value: any);
        getData(key: string): any;
        getTitle();
        setTitle(title: any);
        getModalHeader();
        getMessage(): any;
        realize();
    }

    interface Button {
        enable();
        disable();
        spin();
        stopSpin();
    }

    interface ConfirmOptions {
        /*
         * The title of the dialog. String or Object.
         */
        title?: any;

        /* 
         *
         */
        message?: any;

        /* 
         *
         */
        type?: string;        

        /* 
         *
         */
        closable?: boolean;

        /* 
         *
         */
        draggable?: boolean;

        /* 
         *
         */
        btnCancelLabel?: string;

        /* 
         *
         */
        btnOKLabel?: string;

        /* 
         *
         */
        btnOKClass?: string;

        /* 
         *
         */
        callback?: (confirmed: boolean) => void;
    }

    interface Options {
        /* 
         * Remove all elements from the DOM tree after closing the dialog? Set it to false if you are planning 
         * to repeatedly open and close the same dialog.
         */
        autodestroy?: boolean;
    
        /* 
         * Use this option to add buttons to the dialog.
         */
        buttons?: Array<ButtonOptions>;

        /* 
         * Allow the user to close the dialog? Defaults to true.
         *
         * When set to true, the user can close the dialog by:
         * - Clicking the close icon in the dialog header.
         * - Clicking outside the dialog
         * - Pressing the ESC key.
         */
        closable?: boolean;
    
        /* 
         * Additional css classes that will be added to your dialog.
         */
        cssClass?: string;

        /* 
         * Allow the user to drag the dialog? Defaults to false.
         */
        draggable?: boolean;

        /* 
         * The contents of the dialog body. String or Object.
         */
        message?: any;

        /* 
         * Adjust the dialog size. Possible values:
         *
         * BootstrapDialog.SIZE_NORMAL
         * BootstrapDialog.SIZE_WIDE
         * BootstrapDialog.SIZE_LARGE
         */
        size?: string;

        /* 
         * The title of the dialog. String or Object.     
         */
        title?: any;

        /* 
         * Give the dialog a specific look. Possible values:
         *
         * BootstrapDialog.TYPE_DEFAULT
         * BootstrapDialog.TYPE_INFO
         * BootstrapDialog.TYPE_PRIMARY
         * BootstrapDialog.TYPE_SUCCESS
         * BootstrapDialog.TYPE_WARNING
         * BootstrapDialog.TYPE_DANGER
         */
        type?: string;

        onshow?: (dialog: BootstrapDialog_Instance) => void;
        onshown?: (dialog: BootstrapDialog_Instance) => void;
        onhide?: (dialog: BootstrapDialog_Instance) => void;
        onhidden?: (dialog: BootstrapDialog_Instance) => void;
    }

    interface ButtonOptions {
        label: string;
        action: (dialog: BootstrapDialog_Instance) => void;
        cssClass?: string;
        id?: string;
        icon?: string;
    }
}
