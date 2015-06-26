$.extend(true, $.hik.jtable.prototype, {
    _addRecordDialog: null,

    /* Creates and prepares add new record dialog div
    * Difference: Submit when pressing enter
    *************************************************************************/
    _createAddRecordDialogDiv: function () {
        var self = this;

        self._addRecordDialog = new BootstrapDialog({
            type: BootstrapDialog.TYPE_PRIMARY,
            title: $("<h3></h3>").text(self.options.messages.addNewRecord),
            message: $("<div></div>"),
            closable: false,
            autodestroy: false,
            buttons: [
            {
                label: self.options.messages.cancel,
                cssClass: "btn btn-default",
                closable: false,
                action: function(dialog)
                {                       
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_WARNING,
                        title: $("<h3></h3>").text(Resources.Global.General_Warning),
                        message: Resources.Global.General_ConfirmCancel,
                        buttons: [
                        {
                            label: Resources.Global.General_No,
                            action: function (confirmDialog) {
                                confirmDialog.close();
                            }
                        }, 
                        {
                            label: Resources.Global.General_Yes,
                            cssClass: "btn btn-primary",
                            action: function (confirmDialog) {
                                dialog.close();
                                confirmDialog.close();
                            }
                        }]
                    });
                }
            },
            {
                id: "saveButton",
                icon: 'glyphicon glyphicon-send',
                label: self.options.messages.save,
                cssClass: "btn btn-primary",                
                action: function(dialog)
                {
                    dialog.enableButtons(false);
                    dialog.getButton('saveButton').spin();
                    self._SaveCreateForm();
                }
            }],            
            onhidden: function (dialog)
            {
                var form = dialog.getModalBody().find('form').first();
                self._trigger("formClosed", null, { form: form, formType: 'create' });
            }
        });
        
        if (self.options.addRecordButton) {
            //If user supplied a button, bind the click event to show dialog form
            self.options.addRecordButton.click(function (e) {
                e.preventDefault();
                self._showAddRecordForm();
            });
        } else {
            //If user did not supplied a button, create a 'add record button' toolbar item.
            self._defaultToolbarItems.push({
                icon: "glyphicon glyphicon-plus",
                cssClass: 'btn btn-default',
                text: self.options.messages.addNewRecord,
                click: function () {
                    self._showAddRecordForm();
                }
            }, true);
        }                
    },

    /* Shows add new record dialog form.
     * Difference: support for multiple forms inside the dialog
     *************************************************************************/
    _showAddRecordForm: function () {
        var self = this;                
        if (self._addRecordDialog.getModalBody()) self._addRecordDialog.getModalBody().empty();

        if (self.options.multiForms) self._createInputFormCount();

        // Create initial form.
        self._createForm(self, false);
        self._addRecordDialog.open();
    },

    /* Submit the forms. 
     * Difference: support for multiple forms inside the dialog
     */
    _SaveCreateForm: function () {
        var self = this;        
        var $addRecordForms = self._addRecordDialog.getModalBody().find('form').not(":hidden");

        //Validate every form in the dialog
        var fails = 0;
        $addRecordForms.each(function (index) {
            if (self._trigger("formSubmitting", null, { form: $(this), formType: 'create' }) == false) fails++;
        });
        if (fails > 0) {            
            self._addRecordDialog.enableButtons(true);
            self._addRecordDialog.getButton('saveButton').stopSpin();
            return;
        }
        
        self._saveAddRecordForms($addRecordForms);
    },            

    /* Create a spinbox to dynamically alter the amount of shown forms 
     */
    _createInputFormCount: function () {
        self = this;

        var row = $("<div class='row'></div>");
        var formGroup = $('<div class="form-group col-md-6"></div>').appendTo(row).append($('<label for="formCount">' + self.options.messages.formCount + '</label>'));
        var $input = $('<input placeholder="' + self.options.messages.formCount + '" class="form-control" id="formCount" type="number" name="formCount" value="1" step="1"></input>').appendTo(formGroup);
                
        //Update the amount of shown forms when changing the value of the spinnerbox
        $input.bind('keyup mouseup', function () {
            var target = $input.val();
            var formCount = 0;

            var forms = self._addRecordDialog.getModalBody().find('form').not(':hidden');

            if (forms != undefined)  formCount = forms.length;

            //Hide forms
            if (formCount > target) {
                $input.attr('disabled', true);

                var deleteCount = formCount - target;                
                forms = forms.toArray().reverse();
                for (var i = 0; i < deleteCount; i++)
                    $(forms[i]).slideUp("slow", function () {
                        $input.attr('disabled', false);
                    });
            }
                //Add or unhide forms
            else {
                var addCount = target - formCount;
                var hiddenForms = self._addRecordDialog.getModalBody().find('form:hidden');

                var hiddenCount = hiddenForms.length > addCount ? addCount : hiddenForms.length;
                for (var i = 0; i < hiddenCount; i++)
                    $(hiddenForms[i]).slideDown("slow");

                addCount -= hiddenCount;
                if (addCount > 0)
                    for (var i = formCount - addCount; i < formCount; i++)
                        self._createForm(self, true, i);
            }
        });

        if (self._addRecordDialog.getModalBody()) self._addRecordDialog.getModalBody().append(row);
        else self._addRecordDialog.options.message.append(row);
    },

    /* Create the form to add new records
     * Difference: Supports more field types
     */
    _createForm: function (self, animate, i) {        
        var id = "jtable-create-form";

        if (i != undefined) id = id + i;
        var $addRecordForm = $('<form id="' + id + '" role="form"></form>')
            .keydown(function (e) {
                if (e.which == 13) {
                    e.preventDefault();

                    if (self._addRecordDialog.getButton('saveButton').hasClass('disabled')) return;
                    self._addRecordDialog.enableButtons(false);
                    self._addRecordDialog.getButton('saveButton').spin();
                    self._SaveCreateForm();
                    return false;
                }
            });
        var row = $('<div class="row"></div>').appendTo($addRecordForm);
        
        //Create input elements
        var counter = 0;
        for (var i = 0; i < self._fieldList.length; i++) {
            if (counter % 2 == 0) row = $('<div class="row"></div>').appendTo($addRecordForm);

            var fieldName = self._fieldList[i];
            var field = self.options.fields[fieldName];

            //Do not create input for fields that is key and not specially marked as creatable
            if ((field.key == true && field.create == false) || field.create == false)
                continue;

            if (field.type == 'hidden' || field.type == 'image') {
                $addRecordForm.append(self._createInputForHidden(fieldName, field.defaultValue));
                continue;
            }
                              
            //Create input element                
            self._createInputForRecordField({
                fieldName: fieldName,
                formType: 'create',
                form: $addRecordForm
            }).appendTo(row);
            ++counter;
        }

        self._makeCascadeDropDowns($addRecordForm, undefined, 'create');
        self._makeShowOnInputs($addRecordForm);

        $addRecordForm.submit(function () {
            self._OnSaveCreateForm();
            return false;
        });
        
        if (self._addRecordDialog.getModalBody()) self._addRecordDialog.getModalBody().append($addRecordForm);
        else self._addRecordDialog.options.message.append($addRecordForm);
                  
        if (animate)
        {
            $addRecordForm.hide();
            $addRecordForm.slideDown("slow");
        }

        self._initializeSpecials($addRecordForm);
        self._trigger("formCreated", null, { form: $addRecordForm, formType: 'create' });
    },

    _initializeSpecials: function (form) {
        var self = this;
        for (var i = 0; i < self._fieldList.length; i++) {
            var fieldName = self._fieldList[i];
            var field = self.options.fields[fieldName];

            if (field.type == "typeAhead" || field.typeAhead) {                   
                self._initializeTypeAhead(field, fieldName, form);
            } else if (field.type == "file") {
                self._initializeUploadiFive(field, fieldName, form);
            }
        }
        $.each(form.find(".tt-hint"), function (i, input) {
            $(input).removeClass(); $(input).addClass("tt-hint");
        });
    },

    _initializeTypeAhead: function (field, fieldName, form) {
        var options = field.typeAhead,
            input = form.find('#Edit-' + fieldName),
            keyProp = options.valueField || "Value";
        
        initializeTypeAhead(input, options, function ($e, datum, datasetName) {
            form.find('#Edit-' + options.hiddenValueField).val(datum[keyProp]);
        });
    },

    _initializeUploadiFive: function (field, fieldName, form)
    {
        var self = this;
        var input = form.find('#Edit-' + fieldName);        
        input.uploadifive({
            buttonClass: 'btn btn-primary',
            buttonText: Resources.Global.Uploadify_SelectFile,
            auto: false,
            uploadScript: field.uploadOptions.actionUrl,
            fileType: field.uploadOptions.fileType,
            uploadLimit: field.uploadOptions.uploadLimit || 1,
            queueSizeLimit: field.uploadOptions.uploadLimit || 1,
            onUpload: function (file) {                        
                input.data('uploadifive').settings.formData = { "entity": JSON.stringify(self._serializeObject(form)) };
            },
            onError: function (response) {                
                self._showError(response);
                self._addRecordDialog.enableButtons(true);
                self._addRecordDialog.getButton('saveButton').stopSpin();
            },
            onUploadComplete: function (file, response) {                       
                var obj = jQuery.parseJSON(response);
                
                if (obj.Result != 'OK') $(this).uploadifive('clearQueue');
                self._processNewRecord(obj);
            },
        });
    },

    /* Saves new added record to the server and updates table.
        *************************************************************************/
    _saveAddRecordForms: function ($addRecordForms) {
        var self = this;

        //createAction may be a function, check if it is
        if ($.isFunction(self.options.actions.createAction)) {
            $addRecordForm.data('submitting', true); //TODO: Why it's used, can remove? Check it.
            //Execute the function
            var funcResult = self.options.actions.createAction($addRecordForms[0].serialize());

            //Check if result is a jQuery Deferred object
            if (self._isDeferredObject(funcResult)) {
                //Wait promise
                funcResult.done(function (data) {
                    self._processNewRecord(data);
                }).fail(function () {
                    self._showError(self.options.messages.serverCommunicationError);
                    self._addRecordDialog.enableButtons(true);
                    self._addRecordDialog.getButton('saveButton').stopSpin();
                });
            } else { //assume it returned the creation result
                self._processNewRecord(data);
            }

        } else { //Assume it's a URL string                                     
            var payload = [];
            $addRecordForms.each(function (index) {
                payload.push(self._serializeObject($(this)));
                $(this).data('submitting', true);
            });

            //Submit form via uploadify. N.B. currently works for only one instance op UploadiFive.
            var fileInputs = false;
            $addRecordForms.each(function (index) {
                if ($(this).find(".uploadifive-queue-item").length > 0)
                {
                    $(this).find("input.file").each(function (index, item) {
                        $(item).uploadifive("upload");
                        fileInputs = true;
                    });
                }                
            });
            if (fileInputs) return;
                        
            //Make an Ajax call to create record
            self._submitFormUsingAjax(
            self.options.actions.createAction,
            self.options.multiForms ? payload : payload[0],             
            function (data) {                             
                self._processNewRecord(data);
            },
            function () {
                self._showError(self.options.messages.serverCommunicationError);
                self._addRecordDialog.enableButtons(true);
                self._addRecordDialog.getButton('saveButton').stopSpin();
            });
        }        
    },

    _processNewRecord: function (data) {        
        var self = this;

        if (data.Result == 'ERROR') {
            self._showError(data.Message);         
        } else {
            if (data.Result == 'WARNING') warningDialog(data.Message);

            if (!data.Record && !data.Records) {
                self._logError('Server must return the created Record object.');                
            } else {
                if (data.Records != undefined) {
                    data.Records.forEach(function (record) {
                        // Keep in line with orignal JTable design
                        self._trigger("recordAdded", null, { record: record, serverResponse: data });

                        self._addRow(self._createRowFromRecord(record), {
                            isNewRow: true,
                            animationsEnabled: true
                        });
                    });
                }
                else {
                    self._onRecordAdded(data)

                    self._addRow(
                        self._createRowFromRecord(data.Record), {
                            isNewRow: true,
                            animationsEnabled: true
                        });
                }
                self._addRecordDialog.close();
            }            
        }                                                                        
                
        self._addRecordDialog.enableButtons(true);        
        self._addRecordDialog.getButton('saveButton').stopSpin();
    },
});