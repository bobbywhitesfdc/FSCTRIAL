({
    onInit: function(cmp, event, helper) {
        //get object metadata
        var fields = [];
        var headerColumns = cmp.get("v.headerColumns");
        for (var i = 0; i < headerColumns.length; i++) {
            var headerColumn = headerColumns[i];
            if (headerColumn.isInstanceOf("ui:dataGridColumn")) {
                fields.push(headerColumn.get("v.name"));
            }
        }
        //save column names
        cmp.set("v.priv_columnNames", fields);

        //trigger the data provider
        var dataProviders = cmp.get("v.dataProvider");
        if (!$A.util.isEmpty(dataProviders)) {
            for (var i = 0; i < dataProviders.length; i++) {
                //dataProviders[i].addHandler("onchange", cmp, "c.onDataChange");
            }
        }
        
        //call to backend to retrieve field information from columns
        var action = cmp.get("c.getFieldsFromObject");
        action.setParams({ 
            "typeName": cmp.get("v.sObjectName"),
            "fields": fields.join(),
            "operation": "Edit"
        });
        action.setStorable();
        action.setCallback(this, function(response) {
            if (response.getState() === "SUCCESS") {
                var columnList = response.getReturnValue();
                //create map of columns to field path, used for easier lookup
                var columns = {};
                for(var i=0; i < columnList.length; i++) {
                    var columnName = columnList[i].fieldPath;
                    columns[columnName] = columnList[i];
                }
                //set column & column names
                cmp.set("v.priv_columns", columns);
                
                if ($A.util.isEmpty(dataProviders)) {
                    if($A.util.isEmpty(cmp.get("v.items"))) {
                        helper.createInitRow(cmp, event, helper);
                    }
                } else {
                    helper.triggerDataProvider(cmp);
                }
                helper.setTable(cmp, event, helper);
            }
        });
        $A.enqueueAction(action);
    },
    onDataChange: function(cmp, event, helper) {
        var records = event.getParam("data");
        if(!$A.util.isEmpty(records)) {
            cmp.set("v.priv_redraw", false);
            cmp.set("v.items", records);
        } else {
            //initialize first row
            if($A.util.isEmpty(cmp.get("v.items"))) {
                cmp.set("v.priv_redraw", false);
                helper.createInitRow(cmp, event, helper);
            }
        }

        //fire change event
        cmp.getEvent("dataChanged").setParams({
            data: records,
            currentPage: event.getParam("currentPage")
        }).fire();
    },
    createInitRow: function(cmp, event, helper) {
        //check if there are defaultFieldValues
        var defaultRowValues = cmp.get("v.defaultRowValues");
        if(!$A.util.isEmpty(defaultRowValues)) {
            //create first row
            var columns = cmp.get("v.priv_columns");
            var obj = {Id: "", unsavedNewRow: true};
            for(var field in columns) {
                if(defaultRowValues.hasOwnProperty(field)) {
                    obj[field] = defaultRowValues[field];
                } else {
                    obj[field] = JSON.parse(columns[field].defaultValue);
                }
            }
            var items = cmp.get("v.items");
            items.push(obj);
            cmp.set("v.items", items); //this will trigger set table
        } else {
            //add empty row 
            helper.addRow(cmp, event, helper);
        }

        //fire change event
        cmp.getEvent("dataChanged").setParams({
            data: cmp.get("v.items"),
            currentPage: 1
        }).fire();
    },
    addRow: function(cmp, event, helper) {
        //create new instance of item based on columns
        cmp.set("v.priv_redraw", false);
        var columns = cmp.get("v.priv_columns");
        var obj = {Id: "", unsavedNewRow: true};
        // check the default value map to see if there are any columns
        // which has a default value that should be set to
        var defaultValueOverride = cmp.get("v.defaultValueOverride");
        for(var field in columns) {
            if (defaultValueOverride && defaultValueOverride[field]) {
                obj[field] = defaultValueOverride[field];
            } else {
                obj[field] = JSON.parse(columns[field].defaultValue);

            }
        }

        var items = cmp.get("v.items");
        items.push(obj);
        cmp.set("v.items", items);
        //reenable after drawing table
        cmp.find("add").set("v.disabled", false);

        //fire row add event
        cmp.getEvent("rowAddRemove").setParams({
            last: true,
            count: items.length,
            remove: false
        }).fire();
    },
    onRemoveRow: function(cmp, event, helper) {
        var index = event.getSource().get("v.name");
        var tableMatrix = cmp.get("v.priv_tableMatrix");
        if(index >= 0 && index < tableMatrix.length) {
            //fire row removed event
            cmp.getEvent("rowAddRemove").setParams({
                index: index,
                remove: true
            }).fire();
        }
    },
    deleteRow: function(cmp, removeIndex) {
        var items = cmp.get("v.items");
        if(removeIndex >= 0 && removeIndex < items.length) {
            //remove from table matrix 
            var tableMatrix = cmp.get("v.priv_tableMatrix");
            tableMatrix.splice(removeIndex, 1);
            cmp.set("v.priv_tableMatrix", tableMatrix);

            //remove from items
            items.splice(removeIndex, 1);
            cmp.set("v.items", items);
        }
    },
    onValueChange: function(cmp, event, helper) {
        //update value in item
        var payload = event.getParams().payload;
        var items = cmp.get("v.items");
        if(payload.index >= 0 && payload.index < items.length) {
            items[payload.index][payload.name] = payload.value;

            //fire change event
            cmp.getEvent("rowModified").setParams({
                typeOf: "ui:change",
                payload: {
                    index: payload.index,
                    name: payload.name,
                    value: payload.value,
                    label: payload.label
                }
            }).fire();
        }
    },
    setTable: function(cmp, event, helper) {
        //unable to build table without both columns & data
        var items = cmp.get("v.items");
        var columns = cmp.get("v.priv_columns");
        if($A.util.isEmpty(columns) || $A.util.isEmpty(items)) {
            return;
        }

        var tableMatrix = cmp.get("v.priv_tableMatrix");
        //create rows if needed
        var newRows = (items.length - tableMatrix.length);
        for(var i=0; i < newRows; i++) {
            var row = [];
            var columns = cmp.get("v.priv_columns");
            for(var field in columns) {
                row.push(JSON.parse(JSON.stringify(columns[field])));
            }
            // whether user can remove row
            var canRemoveRow = (items[i]["unsavedNewRow"] || cmp.get("v.canDelete"));
            // whether row should hide by default
            var hideRowDefault = (items[i]["unsavedNewRow"] && !(cmp.get("v.canCreate")));

            tableMatrix.push({
                metadata: row,
                errors: [],
                unsavedNewRow: items[i]["unsavedNewRow"],
                canRemoveRow: canRemoveRow,
                hideRow: hideRowDefault
            });
        }
        //update existing ones
        for(var i=0; i < items.length; i++) {
            //update metadata values
            for(var field in columns) {
                tableMatrix[i].metadata = this.updateRow(cmp, tableMatrix[i].metadata, field, items[i]);
            }
            //set error rows
            tableMatrix[i].errors = this.getErrors(cmp, tableMatrix[i].metadata);
        }
        //remove unnecessary rows
        if(items.length < tableMatrix.length) {
            for(var removeIndex=(tableMatrix.length-1); removeIndex >= items.length; removeIndex--) {
                tableMatrix.splice(removeIndex, 1);
            }
        }
        cmp.set("v.priv_tableMatrix", tableMatrix);
    },
    disableItem: function(cmp, index, name, disabled) {
        //add disabled information
        var items = cmp.get("v.items");
        var tableMatrix = cmp.get("v.priv_tableMatrix");
        if(!$A.util.isEmpty(tableMatrix) && index >= 0 && index < tableMatrix.length) {
            var metadata = tableMatrix[index].metadata;
            var changed = false;
            metadata.forEach(function(col) {
                if(col.fieldPath === name) {
                    changed = (col.disabled !== disabled);
                    col.disabled = disabled;
                }
            });
            //reset row
            if(changed) {
                tableMatrix[index].metadata = this.updateRow(cmp, tableMatrix[index].metadata, name, items[index]);
                cmp.set("v.priv_tableMatrix", tableMatrix);
            }
        }
    },
    isValidGrid: function(cmp) {
        //check if any of the items have an invalid column
        var tableMatrix = cmp.get("v.priv_tableMatrix");
        var self = this;
        var isValid = true;
        for(var i=0; i < tableMatrix.length; i++) {
            var metadata = tableMatrix[i].metadata;
            metadata.forEach(function(col) {
                if(col.invalid) {
                    isValid = false;
                }
            });
        }
        return isValid;
    },
    invalidateItem: function(cmp, index, name, errorMessage) {
        //add validation information
        var items = cmp.get("v.items");
        var tableMatrix = cmp.get("v.priv_tableMatrix");
        if(!$A.util.isEmpty(tableMatrix) && index >= 0 && index < tableMatrix.length) {
            var metadata = tableMatrix[index].metadata;
            var changed = false;
            metadata.forEach(function(col) {
                if(col.fieldPath === name) {
                    changed = (col.invalid !== !$A.util.isEmpty(errorMessage));
                    col.invalid = !$A.util.isEmpty(errorMessage);
                    col.errors = (col.invalid) ? [{message: errorMessage}] : undefined;
                }
            });
            //reset row
            if(changed) {
                tableMatrix[index].metadata = this.updateRow(cmp, tableMatrix[index].metadata, name, items[index]);
                tableMatrix[index].errors = this.getErrors(cmp, tableMatrix[index].metadata);
                cmp.set("v.priv_tableMatrix", tableMatrix);
            }
        }
    },
    updateRow: function(cmp, row, name, item) {
        //loop through and update necessary fields
        var colIndex = cmp.get("v.priv_columnNames").indexOf(name);
        if(colIndex != -1) {
            //reset value, errors, validation
            row[colIndex].fieldValue = item[name];
            var columnsOverride = cmp.get("v.columnsOverride");
            if(!$A.util.isEmpty(columnsOverride) && columnsOverride.hasOwnProperty(name)) {
                //override values in column
                var override = columnsOverride[name];
                for(var key in override) {
                    if(key === "picklistValues") {
                        //for picklists, clone the options otherwise any changes will propagate through all rows
                        var options = override.picklistValues;
                        var clonedOptions = [];
                        options.forEach(function(option) {
                            clonedOptions.push(JSON.parse(JSON.stringify(option)));
                        });
                        row[colIndex][key] = clonedOptions;
                    } else {
                        row[colIndex][key] = override[key];
                    }
                }
            }
        }

        //only updates individual column/row
        return row;
    },
    getErrors: function(cmp, row) {
        var errors = [];
        if(cmp.get("v.combineErrors")) {
            row.forEach(function(col) {
                var message = (!$A.util.isEmpty(col.errors)) ? col.errors : [];
                errors = errors.concat(message);
            }, this);
        }
        return errors;
    },
    triggerDataProvider: function(cmp, index) {
        if ($A.util.isEmpty(index)) {
            index = 0;
        }
        var dataProviders = cmp.get("v.dataProvider");
        if (index >= 0 && index < dataProviders.length) {
            dataProviders[index].set("v.columns", cmp.get("v.priv_columnNames"));
            dataProviders[index].get("e.provide").fire();
        }
    }
})