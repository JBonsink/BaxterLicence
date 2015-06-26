$.extend(true, $.hik.jtable.prototype, {
    _editRecordDialog: null,

	/* Creates and prepares edit dialog div
     * Difference: Button ordering and dialog css
     *************************************************************************/
	_createEditDialogDiv: function () {
		var self = this;
		var confirm = $("<div></div>");

		self._editRecordDialog = new BootstrapDialog({
		    type: BootstrapDialog.TYPE_PRIMARY,
		    title: $("<h3></h3>").text(self.options.messages.editRecord),
		    closable: false,
		    autodestroy: false,
		    buttons: [
            {
                label: self.options.messages.cancel,
                cssClass: "btn btn-default",
                action: function (dialog) {
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_WARNING,
                        closable: false,
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
                action: function (dialog) {
                    dialog.enableButtons(false);
                    dialog.getButton('saveButton').spin();
                    self._SaveEditForm();
                }
            }],
		    onhidden: function (dialog) {
		        var form = dialog.getModalBody().find('form').first();
		        self._trigger("formClosed", null, { form: form, formType: 'create', table: self });
		    }
		});
	},

	_showEditForm: function ($tableRow) {
	    var self = this;
	    var record = $tableRow.data('record');
        
        //Check if editing the record is allowed
	    if (self.options.allowEdit == false) return;	    
	    else if ($.isFunction(self.options.allowEdit) && !self.options.allowEdit(record)) return;
	    
	    if (self._editRecordDialog.getModalBody()) self._editRecordDialog.getModalBody().empty();

	    //Create edit form	    
	    var $editForm = $('<form role="form"></form>')
	        .keydown(function (e) {
                //Enter
	            if (e.which == 13) {
	                e.preventDefault();

	                if (self._editRecordDialog.getButton('saveButton').hasClass('disabled')) return;
	                self._editRecordDialog.enableButtons(false);
	                self._editRecordDialog.getButton('saveButton').spin();
	                self._SaveEditForm();
	                return false;
	            }
	        });
	    var row = $('<div class="row"></div>').appendTo($editForm);

	    //Create input fields	  
	    var counter = 0;
	    for (var i = 0; i < self._fieldList.length; i++) {
	        if (counter % 2 == 0) row = $('<div class="row"></div>').appendTo($editForm);

	        var fieldName = self._fieldList[i];
	        var field = self.options.fields[fieldName];
	        var fieldValue = record[fieldName];

	        //Create hidden field for key
	        if (field.key == true) {     	            
	            $editForm.append(self._createInputForHidden(fieldName, fieldValue));
	            continue;
	        }	        
	        
	        //Hidden field
	        if (field.type == 'hidden' || field.edit != undefined && !field.edit) {
	            $editForm.append(self._createInputForHidden(fieldName, fieldValue));
	            continue;
	        }	    
                                              
	        //Create input element with it's current value
	        var currentValue = self._getValueForRecordField(record, fieldName);
	        //$fieldContainer.append(
	        self._createInputForRecordField({
	            fieldName: fieldName,
	            value: currentValue,
	            record: record,
	            formType: 'edit',
	            form: $editForm
	        }).appendTo(row);
	        ++counter;
	    }

	    self._makeCascadeDropDowns($editForm, record, 'edit');
	    self._makeShowOnInputs($editForm);

	    $editForm.submit(function () {
	        self._OnSaveEditForm();
	        return false;
	    });
        	    
	    self._$editingRow = $tableRow;
	    
	    if (self._editRecordDialog.getModalBody()) self._editRecordDialog.getModalBody().append($editForm);
	    else self._editRecordDialog.options.message = $editForm;

	    self._initializeSpecialsEdit($editForm);
	    self._trigger("formCreated", null, { form: $editForm, formType: 'edit', record: record, row: $tableRow });
	    self._editRecordDialog.open();
	},

	_initializeSpecialsEdit: function (form) {
	    var self = this;
	    for (var i = 0; i < self._fieldList.length; i++) {
	        var fieldName = self._fieldList[i];
	        var field = self.options.fields[fieldName];

	        if (field.type == "typeAhead" || field.typeAhead) {
	            self._initializeTypeAhead(field, fieldName, form);
	        } else if (field.type == "file") {
	            self._initializeUploadiFiveEdit(field, fieldName, form);
	        }
	    }
	    $.each(form.find(".tt-hint"), function (i, val) {
	        $(val).removeClass(); $(val).addClass("form-control tt-hint");
	    });
	},
    	
	_initializeUploadiFiveEdit: function (field, fieldName, form) {
	    var self = this;
	    var input = form.find('#Edit-' + fieldName);
	    input.uploadifive({
	        auto: false,
	        buttonClass: 'btn btn-primary',
	        buttonText: Resources.Global.Uploadify_SelectFile,
	        uploadScript: field.uploadOptions.actionUrl,
	        fileType: field.uploadOptions.fileType,
	        uploadLimit: field.uploadOptions.uploadLimit || 1,
	        queueSizeLimit: field.uploadOptions.uploadLimit || 1,	        
	        onUpload: function (file) {
	            input.data('uploadifive').settings.formData = { "entity": JSON.stringify(self._serializeObject(form)) };
	        },
	        onUploadComplete: function (file, response) {
	            var obj = jQuery.parseJSON(response);

	            self._processRecord(obj);
	        },
	    });
	},

	/* Saves editing form to server.
     * Multi form support
     *************************************************************************/
	_SaveEditForm: function () {
		var self = this;			

		var $editForm = self._editRecordDialog.getModalBody().find('form');
                        
		//Validate every form in the dialog
		var fails = 0;
		$editForm.each(function (index) {
			if (self._trigger("formSubmitting", null, { form: $(this), formType: 'edit', row: self._$editingRow }) == false) fails++;
		});
		if (fails > 0) {
		    self._editRecordDialog.enableButtons(true);
		    self._editRecordDialog.getButton('saveButton').stopSpin();
		    return;
		}
        		
		self._saveEditForm($editForm);
	},

    /* Saves editing form to the server and updates the record on the table.
       *************************************************************************/
	_saveEditForm: function ($editForm) {
	    var self = this;
	    
	    //updateAction may be a function, check if it is
	    if ($.isFunction(self.options.actions.updateAction)) {

	        //Execute the function
	        var funcResult = self.options.actions.updateAction($editForm.serialize());

	        //Check if result is a jQuery Deferred object
	        if (self._isDeferredObject(funcResult)) {
	            //Wait promise
	            funcResult.done(function (data) {
	                self._processRecord(data);
	            }).fail(function () {
	                self._showError(self.options.messages.serverCommunicationError);
	                self._editRecordDialog.enableButtons(true);
	                self._editRecordDialog.getButton('saveButton').stopSpin();
	            });
	        } else { //assume it returned the creation result
	            self._processRecord(funcResult);
	        }

	    } else { //Assume it's a URL string 
	        if ($editForm.find(".uploadifive-queue-item").length > 0)
	        {
	            if ($editForm.find("input.file").length > 0) {
	                $editForm.find("input.file").each(function (index, item) {
	                    $(item).uploadifive("upload");
	                });
	                return;
	            }
	        }                    
	        
	        //Make an Ajax call to update record
	        self._submitFormUsingAjax(
                self.options.actions.updateAction,
                self._serializeObject($editForm),
                function (data) {                                        
                    self._processRecord(data);
                },
                function () {                    
                    self._showError(self.options.messages.serverCommunicationError);
                    self._editRecordDialog.enableButtons(true);
                    self._editRecordDialog.getButton('saveButton').stopSpin();
                });
	    }
	},
    
	_processRecord: function (data) {
	    var self = this;	    
	    var $editForm = self._editRecordDialog.getModalBody().find('form');

	    if (data.Result == 'ERROR') {
	        self._showError(data.Message);	        
	    } else
	    {
	        if (data.Result == 'WARNING') warningDialog(data.Message);
	        var record = self._$editingRow.data('record');

	        if (data.Record == undefined) self._updateRecordValuesFromForm(record, $editForm);
	        else self._updateRecordValuesFromServerResponse(record, data);
	        self._updateRowTexts(self._$editingRow);

	        self._$editingRow.attr('data-record-key', self._getKeyValueOfRecord(record));

	        self._onRecordUpdated(self._$editingRow, data);

	        if (self.options.animationsEnabled) {
	            self._showUpdateAnimationForRow(self._$editingRow);
	        }

	        self._editRecordDialog.close();	        
	    }
	    self._editRecordDialog.enableButtons(true);
	    self._editRecordDialog.getButton('saveButton').stopSpin();
	},

    /* Shows 'updated' animation for a table row.
     *************************************************************************/
	_showUpdateAnimationForRow: function ($tableRow) {
	    var className = 'bg-success';
	    	    
        $tableRow.addClass(className);
	    	    
        setTimeout(function() {
            	$tableRow.removeClass(className);
            }, 2000) 
    },

    // Overload events to add table to data object
	_onRowUpdated: function ($row) {
	    this._trigger("rowUpdated", null, { table: this, row: $row, record: $row.data('record') });
	},

	_onRecordUpdated: function ($row, data) {
	    this._trigger("recordUpdated", null, { table: this, record: $row.data('record'), row: $row, serverResponse: data });
	}
});