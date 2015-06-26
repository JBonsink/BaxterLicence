/// <reference path="../../constants.ts" />

interface JQuery {
    /**
     * Initialize kTable on the JQuery object.
     */
    kTable<T>(options: kTable.Options<T>);

    /**
     * Call a kTable function using the JQuery object.
     */
    kTable(action: string);
}

declare module kTable {
    class kTable<T> {
        options: Options<T>;

        /**
         * Request data from the listAction. Clear the table and fill it with the new data.
         *
         * @param postData Data to be send to the listAction.
         * @param completeCallback Callback triggered when loading has been completed.
         */
        load(postData: Object, completeCallback?: Function);

        /**
         * Reload the table.
         *
         * @param completeCallback Callback triggered when loading has been completed.
         */
        reload(completeCallback?: Function);

        /**
         * Dynamically change a kTable option.
         *
         * @param key The option name, e.g. actions.
         * @param value The new value of the option.
         */
        setOption(key: string, value: any);
                
        /**
         * Dynamically change the options of a kTable field. NOTE: you can't update a single property of a field option.
         * You need to provide a complete fieldOptions object.
         *
         * @param field The name of the field.
         * @param options The new options of the field.
         */
        setFieldOptions(field: string, options: Field<T>);

        /**
         * Dynamically change the options of a kTable field.          
         *
         * @param field The name of the field.
         * @param option The option name
         * @param value The new value of the option
         */
        setFieldOption(field: string, option: string, value: any);

        /**
         * Dynamically set the actions.
         */
        setActions(actions: Actions);

        /**
         * Dynamically set the table title.
         */
        setTableTitle(title: string);

        /**
         * Get the row of a entity by key. 
         */
        GetRowByKey(key: any): JQuery;

        /**
         * Get the JQuery row objects.
         */
        getDataRows(): Array<JQuery>;

        /**
         * Get the selected rows.
         */
        getSelectedRows(): Array<JQuery>;

        /**
         * Make the provided rows selected.
         */
        selectRows(rows: Array<JQuery>);

        /**
         * Show the add new record form.
         */
        showCreateForm();

        /**
         * Add a new record to the table. Optionally send the provided data to the createAction as well. 
         */
        addRecord(data: CRUDRecordData);

        /**
         * Update a record in the table. Optionally send the provided data to the updateAction as well.
         */
        updateRecord(data: CRUDRecordData);

        /**
         * Delete a record from the table. Optionally send the provided data to the deleteAction as well.
         *
         * UNTESTED: may be buggy.
         */
        deleteRecord(data: CRUDRecordData);
        
        /**
         * Delete one ore more rows from the table and the server.
         */
        deleteRows(rows: Array<JQuery>);

        /**
         * Creates and opens a new child table for a given row.
         *
         * @param row The parent row of the child table.
         * @param options The kTable options of the child tbale.
         * @param opened Function to be called when the table has been opened.
         */
        openChildTable<C>(row: JQuery, options: kTable.Options<C>, opened: (childTable: kTable<C>) => void);
    }

    /**
     * View the online API reference for more information: http://jtable.org/ApiReference/Actions
     */
    interface Actions {
        /*
         * URL to the listAction on the server. If you want to create a 
         * client only table, you will need to provide a javascript function. See the jTable API.
         */
        listAction: any;

        /*
         * URL to the createAction on the server. If you want to create a 
         * client only table, you will need to provide a javascript function. See the jTable API.
         */
        createAction?: any;

        /*
         * URL to the updateAction on the server. If you want to create a 
         * client only table, you will need to provide a javascript function. See the jTable API.
         */
        updateAction?: any;

        /*
         * URL to the deleteAction on the server. If you want to create a 
         * client only table, you will need to provide a javascript function. See the jTable API.
         */
        deleteAction?: any;
    }

    interface Options<T> {
        /**
         * Configure the available CRUD actions.
         */
        actions?: Actions;

        /**
         * An object that defines default options for all ajax requests performed by jTable.
         */
        ajaxSettings?: JQueryAjaxSettings;

        /**
         * Allow the selected record(s) to be deleted? The provided function will be called when the user clicks on the
         * trash icon in the table row or the multi delete button in the toolbar.
         */
        allowDeletion? (record: T): boolean;                

        /**
         * Show animations when the user creates, updates or deletes a row? Defaults to true.
         */
        animationsEnabled?: boolean;

        /**
         * Allow the user to resize data columns by dragging? Defaults to true.
         */
        columnResizable?: boolean;

        /**
         * Allow the user to show/hide data columns by right clicking table header? Defaults to true.
         */
        columnSelectable?: boolean;

        /**
         * Show a delete confirmation dialog to the user? Defaults to true.
         */
        confirmDeletion?: boolean;

        /**
         * You can customize the body of the confirmation dialog by providing a function that returns html (text).         
         */
        confirmDeletionBody? (data: RowData<T>): string;

        /**
         * Default format of a date field. See https://bootstrap-datepicker.readthedocs.org/en/latest/options.html#format.
         */
        defaultDateFormat?: string;

        /**
         * The default sorting settings. For example, if you want the table sorted by the column 'Name' by default, 
         * the option should equal 'Name ASC' or 'Name DESC'.
         */
        defaultSorting?: string;                       
        
        /**
         * The fields of the table. One of the interfaces defined in typings/ktable/fields.d.ts.
         */
        fields: Object;

        /**
         * Provide an array of field names to set the field order.
         */
        fieldOrder?: Array<string>;

        /**
         * If paging is enabled, you can use this option to configure the 'go to page' input. Possible values:
         * 
         * 'combobox': Show a combobox (that contains all pages) to allow the user to go to the desired page.
         * 'textbox': Show a text box to allow the user to go to the desired page.
         * 'none': Don't show anything.
         *
         * Defaults to 'combobox';
         */
        gotoPageArea?: string;

        /**
         * Hide the create button but keep the create action? Then use this option.
         * Defaults to false.
         */
        hideCreateButton?: boolean;

        /**
        * Hide the create button but keep the create action? Then use this option.
        * Defaults to false.
        */
        hideDeleteButton?: boolean;

        /**
         * Hide the create button but keep the create action? Then use this option.
         * Defaults to false.
         */
        hideEditButton?: boolean;

        /**
         * TODO: REWRITE
         * jTable delays 'loading...' animation for a while to allow ajax request to complete. If it does not complete in defined timeout,
         * animation is shown. This option defines this timeout value (as milliseconds). To disable this feature, set 0 to loadingAnimationDelay option.
         */
        loadingAnimationDelay?: number;

        /**
         * Use this option to localize kTable.
         */
        messages?: ResourceStrings;

        /**
         * Allow the user to select multiple rows at once? Defaults to false.
         */
        multiselect?: boolean;

        /**
         * Allow the user to sort the table according to multiple columns?  If this option is set to true,
         * the user can perform sort by multiple columns by holding the CTRL key while clicking.
         * If user selects multiple column for sorting, the sorting parameters will be send like 'Name DESC,BirthDay ASC'.
         *
         * NOTE: GenericController doesn't support this option.
         */
        multiSorting?: boolean;
       
        /**
         * Automaticaly close other open child tables when a child table is opened. Defaults to true.
         */
        openChildAsAccordion?: boolean;

        /**
         * Use paging? Defaults to true. Additional parameters will be send to the server if paging is enabled. 
         * See http://jtable.org/ApiReference/Actions#act-listAction for more information.
         */
        paging?: boolean;

        /**
         * This option is used to select page list type. Possible values:
         *
         * minimal: Show only first, previous, next and last links.
         * normal: Shows page numbers in addition to 'minimal'.
         *
         * Defaults to 'normal'.
         */
        pageList?: string;

        /**
         * The user selects the page size of the table out of a fixed set of options. The default options are: 10, 25, 50, 100, 250, 500.          
         * Provide your own list of page sizes if you want to differ from the default options.
         */
        pageSizeOptions?: Array<number>;

        /**
         * Allow the user to change/select the page size? Defaults to true.
         */
        pageSizeSelectable?: boolean;

        /**
         * Use this to add search options to the table. The search query will be handled by the Generic Controller.
         */
        searchFields?: Array<SearchField>;

        /**
         * Save user preferences such as column selections and sizes? Defaults to true.
         */
        saveUserPreferences?: boolean;

        /**
         * Allow the user to select rows? Defaults to false.
         */
        selecting?: boolean;

        /**
         * Show checkboxes to select rows? Defaults to false.
         */
        selectingCheckboxes?: boolean;

        /**
         * Select rows by clicking anywhere on the row? Set to false if you only wish to use checkboxes
         * to select rows. Defaults to true.
         */
        selectOnRowClick?: boolean;

        /**
         * Allow sorting? Defaults to false.
         */
        sorting?: boolean;

        /**
         * The title of the table. 
         */
        title: string

        /**
         * Add items to the toolbar. If applicable a create and delete button will be present in the toolbar. The toolbar of child tables will also
         * include a close button.
         */
        toolbar?: kTable.Toolbar<T>;

        /**
         * A URL to redirect the page to when an ajax request to the server returns with UnAuthorizedRequest = true or HTTP status 401.          
         */
        unAuthorizedRequestRedirectUrl?: string;
    } 

    /**
     * Events. For more information visit: http://jtable.org/ApiReference/Events
     */
    interface Options<T> {
        /*
         *
         */
        closeRequested? (event: JQueryEventObject, data: Object);

        /*
         *
         */
        formClosed? (event, data);

        /*
         *
         */
        formCreated? (event, data);

        /*
         *
         */
        formSubmitting? (event, data);

        /*
         *
         */
        loadingRecords? (event, data);

        /*
         *
         */
        recordAdded? (event, data);

        /*
         *
         */
        recordDeleted? (event, data);

        /*
         *
         */
        recordsLoaded? (event, data);

        /*
         *
         */
        recordUpdated? (event, data);

        /*
         *
         */
        rowInserted? (event, data: RowData<T>);

        /*
         *
         */
        rowsRemoved? (event, data);

        /*
         *
         */
        rowUpdated? (event, data);

        /*
         *
         */
        selectionChanged? (event, data);
    }

    interface Field<T> {
        /**
         * Allow this column to be resized by the user? Table's columnResizable option must be set to true
         * (it's default) to use this option.
         */
        columnResizable?: boolean;

        /**
         * Create a input field for this field in the create record form? Defaults to true.
         */
        create?: boolean;

        /**
         * Show this field in the edit record form? If false, a hidden input field will be created. Defaults to true.
         */
        edit?: boolean;

        /**
         * The default value of this field. 
         */
        defaultValue?: string;

        /**
         * Use this option to create cascaded dropdowns. For more information see http://jtable.org/Demo/CascadeDropDown.
         */
        dependsOn?: string;

        /**
         * Customize the data shown in the column of this field. Return the contents of the column as (HTML) text.
         */
        display? (data: RecordData<T>): JQuery;

        /**
         * Customize the input created for this field. Return a jQuery object.          
         */
        input? (data: InputData<T>): JQuery;

        /**
         * Add class(es) to the input field.
         */
        inputClass?: string;

        /**
         * Is this field the primary key of the record? Every record must have one and only one key. 
         * If a field is marked as key, create and edit options are set to false by default.
         * If a key field is not editable, a hidden input element is generated for it. 
         */
        key?: boolean;

        /**
         * Show this field in the table? Defaults to true.
         */
        list?: boolean;

        /**
         * Show this field in the table? Defaults to true.
         */
        listClass?: string;

        /**
         * Create a combobox by supplying a list of options:
         *
         * object: Property names are values, property values are display texts.
         * { '1': 'Home phone', '2': 'Office phone', '3': 'Cell phone' }
         *
         * array: An array of options.
         * [{ Value: '1', DisplayText: 'Home phone' }]
         *
         * url: Link to an action to download the options.
         * '/Drugs/GetOptions'
         * 
         * function: A function that returns one of the options sources stated above.
         * You will need this if this field is a cascaded combobox. See http://jtable.org/ApiReference/FieldOptions#fopt-options
         */
        options?: any;

        /**
         * By default options are shown in the supplied order. Use this option for client side sorting of the options:
         * 
         * value: Sorts options according to value (ascending).
         * value-desc: Sorts options according to value (descending).
         * text: Sorts options according to display text (ascending).
         * text-desc: Sorts options according to display text (descending).
         */
        optionsSorting?: string;

        /**
         * Allow to sort on this field?
         */
        sorting?: boolean;

        /**
         * Column header in the table and label in the forms for this field.
         */
        title: string;

        /**
         * Autocomplete
         */
        typeAhead?: TypeAheadOptions;

        /**
         * The data type for this filed. Defaults to text input.
         */
        type?: InputType;

        /**
         * Adds units selector to a inputfield of type number.
         */
        units?: Array<string>;

        /**
         * A column can be shown or hidden by the user. Options:
         *
         * Fixed: the column is always visible and can't be hidden by the user.
         * Visible: the column is visible by default but can be hidden by the user.
         * Hidden: the column is hidden by default but can be shown by the user.
         *
         * Defaults to Visible.
         */
        visibility?: Visibility;

        /**
         * Set the width of the column. Handy for manually setting the width of smaller columns.
         * By default kTable is designed to evenly divide the available width.
         *
         * The value needs to be formatted as follows: 'width%', e.g. '10%'.
         */
        width?: string;
    }

    interface Data<T> {
        table: kTable<T>;
    }

    interface RecordData<T> extends Data<T> {
        record: T;
    }

    interface InputData<T> extends RecordData<T> {
        formType: string;
        form: JQuery;
        value: string;
        field: Field<T>;
        fieldName: string;
    }

    interface RowData<T> extends RecordData<T> {
        row: JQuery;
    }

    interface CRUDRecordData {
        /**
         * The record that is going to be added to the table.
         */
        record: Object;

        /**
         * Only add the record to the table? Defaults to false, the data will be send to the server as well.
         */
        clientOnly?: boolean;

        /**
         * Succes callback.
         */
        succes?: Function;

        /**
         * Error callback.
         */
        error?: Function;

        /**
         * The url of the of createAction. Defaults to preconfigured action.
         */
        url?: string;
    }

    interface ResourceStrings {
        serverCommunicationError: string;
        loadingMessage: string;
        noDataAvailable: string;
        addNewRecord: string;
        editRecord: string;
        areYouSure: string;
        deleteConfirmation: string;
        save: string;
        saving: string;
        cancel: string;
        deleteText: string;
        deleting: string;
        error: string;
        close: string;
        cannotLoadOptionsFor(val): string;
        pagingInfo(val0, val1, val2): string;
        pageSizeChangeLabel: string;
        gotoPageLabel: string;
        canNotDeletedRecords(val0, val1): string;
        deleteProggress(val0): string;
    }

    interface Toolbar<T> {
        items: Array<ToolbarItem<T>>;
    }

    interface ToolbarItem<T> {
        /**
         * Font Awesome or Glyphicon classes.
         */
        icon?: string;

        /**
         * Text shown inside the button.
         */
        text: string;

        /**
         * On click function.
         */
        click(table: kTable<T>);

        /**
         * The css class(es) of the button. Defaults to 'btn btn-default';
         */
        cssClass?: string;

        /**
         * Use this options to set a tool tip for this item. Currently the HTML 'title' attribute will be set.
         * You may want to change it to a Bootstrap tooltip.
         */
        tooltip?: string;
    }

    interface SearchField {
        /**
         * 
         */
        column: string;

        /**
         *
         */
        label: string;

        /**
         *
         */
        type: SearchType;

        /**
         *
         */
        operator: Operator;

        /**
         *
         */
        defaultValue?: string;

        /**
         *
         */
        dropdown?: SearchFieldRemote;
    }

    interface SearchFieldRemote {
        /**
         *
         */
        remote?: string;

        options?: Array<DropdownOption>
    }

    interface DropdownOption {
        Value: number;
        DisplayText: string;
    }

    interface TypeAheadOptions {
        remote: string;
        prefetch: string;

        /**
         * Set the value of the hidden value field to the selected suggestion.
         */
        hiddenValueField: string;
    }

    interface Payload {
        searchFields: Array<SearchObject>;
    }

    interface SearchObject {
        Column: string;
        Value: any;
        Operator: Operator;
    }
}