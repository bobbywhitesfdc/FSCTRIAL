({
    configMap: {
        "anytypeEdit": {
            componentDef: "ui:inputText"
        },
        "base64Edit": {
            componentDef: "ui:inputText"
        },
        "booleanEdit": {
            componentDef: "FinServ:toggle"
        },
        "comboboxEdit": {
            componentDef: "ui:inputSelect",
            attributeKey: "options"
        },
        "currencyEdit": {
            componentDef: "ui:inputCurrency"
        },
        "datacategorygroupreferenceEdit": {
            componentDef: "ui:inputText"
        },
        "dateEdit": {
            componentDef: "ui:inputDate"
        },
        "datetimeEdit": {
            componentDef: "ui:inputDateTime"
        },
        "doubleEdit": {
            componentDef: "ui:inputNumber"
        },
        "emailEdit": {
            componentDef: "ui:inputEmail"
        },
        "encryptedstringEdit": {
            componentDef: "ui:inputText"
        },
        "phoneEdit": {
            componentDef: "ui:inputPhone"
        },
        "idEdit": {
            componentDef: "ui:inputText"
        },
        "integerEdit": {
            componentDef: "ui:inputNumber",
            attributeKey: "values"
        },
        "multipicklistEdit": {
            componentDef: "ui:inputSelect",
            attributeKey: "options"
        },
        "multiselectpillEdit": {
            componentDef: "FinServ:customMultiSelectPill",
            attributeKey: "options"
        },
        "multiselectpicklistEdit": {
            componentDef: "FinServ:picklist",
            attributeKey: "options"
        },
        "percentEdit": {
            componentDef: "ui:inputNumber"
        },
        "picklistEdit": {
            componentDef: "ui:inputSelect",
            attributeKey: "options"
        },
        "referenceEdit": {
            componentDef: "FinServ:customLookUp"
        },
        "stringEdit": {
            componentDef: "ui:inputText"
        },
        "textareaEdit": {
            componentDef: "ui:inputTextArea"
        },
        "timeEdit": {
            componentDef: "ui:inputDateTime"
        },
        "urlEdit": {
            componentDef: "ui:inputURL"
        },
        "anytypeRead": {
            componentDef: "ui:outputText"
        },
        "base64Read": {
            componentDef: "ui:outputText"
        },
        "booleanRead": {
            componentDef: "ui:outputCheckbox"
        },
        "comboboxRead": {
            componentDef: "ui:outputSelect",
            attributeKey: "options"
        },
        "currencyRead": {
            componentDef: "ui:outputCurrency"
        },
        "datacategorygroupreferenceRead": {
            componentDef: "ui:outputText"
        },
        "dateRead": {
            componentDef: "ui:outputDate"
        },
        "datetimeRead": {
            componentDef: "ui:outputDateTime"
        },
        "doubleRead": {
            componentDef: "ui:outputNumber"
        },
        "emailRead": {
            componentDef: "ui:outputEmail"
        },
        "encryptedstringRead": {
            componentDef: "ui:outputText"
        },
        "phoneRead": {
            componentDef: "ui:outputPhone"
        },
        "idRead": {
            componentDef: "ui:outputText"
        },
        "integerRead": {
            componentDef: "ui:outputNumber",
            attributeKey: "values"
        },
        "multipicklistRead": {
            componentDef: "ui:outputText",
        },
        "multiselectpillRead": {
            componentDef: "ui:outputText",
        },
        "multiselectpicklistRead": {
            componentDef: "ui:outputText",
        },
        "percentRead": {
            componentDef: "ui:outputNumber"
        },
        "picklistRead": {
            componentDef: "ui:outputSelect",
            attributeKey: "options"
        },
        "stringRead": {
            componentDef: "ui:outputText"
        },
        "textareaRead": {
            componentDef: "ui:outputTextArea"
        },
        "timeRead": {
            componentDef: "ui:outputDateTime"
        },
        "urlRead": {
            componentDef: "ui:outputURL"
        },
        "referenceRead": {
            componentDef: "FinServ:readOnlyLookup"
        }
    },
    createComponent: function(component) {
        var fieldName = component.get("v.fieldName");
        var fieldType = component.get("v.fieldType").toLowerCase();
        var fieldLabel = component.get("v.fieldLabel");
        var fieldValue = component.get("v.fieldValue");
        var fieldRequired = component.get("v.fieldRequired");
        var disabled = component.get("v.disabled");
        var invalid = component.get("v.invalid");
        var options = component.get("v.options");
        var format = component.get("v.format");
        var viewType = component.get("v.viewType");
        var config = this.configMap[fieldType + viewType];
        var uiType = config.componentDef;
        var attributeKey = config.attributeKey;
        var valueKey = config.valueKey || "value";
        var value = (fieldValue == null || fieldValue == undefined || fieldValue == "null") ? "" : fieldValue;
        //save a copy of the value to our own value, send reference to component so any changes reflect in our component
        component.set("v.priv_fieldValue", fieldValue);
        var fieldValueReference = component.getReference("v.priv_fieldValue");
        var componentDefMap = {
            "aura:Id": fieldName,
            "label": fieldLabel,
            "required": fieldRequired,
            "disabled": disabled,
            "showErrors": invalid,
            "value": fieldValueReference,
            "valueKey": value
        };

        if (uiType == "ui:inputDate") {
            componentDefMap["value"] = value.substring(0, 10);
        }
        if (uiType == "ui:outputCheckbox" || uiType == "ui:inputCheckbox") {
            componentDefMap["value"] = (componentDefMap["value"] === "true");
        }
        //When showing the hyperlink for email, the label should be the email address instead of 'Email'.
        if (uiType == "ui:outputEmail") {
            componentDefMap["label"] = value;
        }
        if (uiType == "FinServ:customLookUp") {
            componentDefMap["sObjectName"] = component.get("v.sObjectType");
            componentDefMap["label"] = fieldLabel;
            componentDefMap["additionalContext"] = component.get("v.additionalContext");
            componentDefMap["source"] = component.get("v.source");
            componentDefMap["fieldName"] = component.get("v.fieldName");
            componentDefMap["selectedValue"] = fieldValueReference;
            componentDefMap["hideLabel"] = component.get("v.hideLabel");
        }  else if (uiType == "FinServ:readOnlyLookup") {
            componentDefMap["selectedValue"] = fieldValue;
            componentDefMap["displayValue"] = component.get("v.fieldDisplayValue");
        }
        if (fieldType == 'multipicklist' || fieldType == 'multiselectpill' || fieldType == 'multiselectpicklist') {
            if (fieldType == 'multiselectpicklist' || !$A.util.isEmpty(fieldValue)) {
                this.setSelectedOptions(options, fieldValue);
            }
            componentDefMap["multiple"] = true;
            componentDefMap["size"] = 4;
        }
        if (fieldType == 'picklist' || fieldType == 'multipicklist' || fieldType == 'multiselectpill' || fieldType == 'multiselectpicklist' || fieldType == 'combobox') {
            // Provide an empty picklist option so the user has a way to clear the value.
            // An empty value is the correct default to use in most cases so add it to the front of the list.
            if (fieldType == 'picklist' && component.get("v.addDefaultOption")) {
                var emptyOption = {
                    label: $A.get("$Label.SelectElement.Required"),
                    value: ""
                };
                if($A.util.isEmpty(options) || !$A.util.isEmpty(options[0].value)) {
                    options.unshift(emptyOption);
                }
            }
            componentDefMap["options"] = options;
        }
        if (fieldType == 'currency' || fieldType == 'double' || fieldType == 'integer') {
            componentDefMap["format"] = format;
        }
        if (fieldType == 'date' || fieldType == 'datetime') {
            componentDefMap["displayDatePicker"] = true;
        }
        if (viewType.toLowerCase() == "edit") {
            componentDefMap["labelClass"] = "slds-form-element__label";
        }
        if (viewType.toLowerCase() == "edit" && uiType != "ui:inputCheckbox" && uiType != "ui:inputTextArea" && uiType != "FinServ:toggle" && uiType != "FinServ:picklist" ) {
            componentDefMap["class"] = "slds-input";
        }
        //if output, create FinServ:outputGeneric, change uiType to FinServ:outputGeneric
        if (viewType.toLowerCase() == "read") {
            var MULTI_PICKLIST_DELIM = ";";
            if(fieldType == 'multipicklist' && typeof value == 'string'){
                var selectedValues = value.split(MULTI_PICKLIST_DELIM);
                if(selectedValues.length > 0){
                    var multipicklistDisplayValues = [];
                    for(var i = 0; i < selectedValues.length; i++){
                        var foundValue = false;
                        for(var j = 0; j < options.length && !foundValue; j++){
                            var picklistOption = options[j];
                            if(picklistOption.value == selectedValues[i]){
                                foundValue = true;
                                multipicklistDisplayValues.push(picklistOption.label);
                            }
                        }
                    }
                    // join and overwrite label display value
                    value = multipicklistDisplayValues.join(MULTI_PICKLIST_DELIM);

                    componentDefMap["value"] = value;
                }
            }

            //change type to generic and update componentDefMap
            var oldMap = JSON.parse(JSON.stringify(componentDefMap));
            if (uiType == "ui:outputURL") {
                oldMap.label = value;
            } else if (uiType == "ui:outputSelect") {
                value = this.getOutputSelectValue(options, value);
                oldMap.value = value;
            }

            componentDefMap = {
                "fieldLabel": fieldLabel,
                "fieldType": uiType,
                "fieldMap": oldMap
            };
            uiType = "FinServ:outputGeneric";
        }
        $A.createComponent(uiType, componentDefMap, function(cmp, status, statusMessage) {
            if (status === "SUCCESS") {
                if (component.isValid()) {
                    component.set("v.body", cmp);
                }
            }
        });
    },
    updatePicklistOptions: function(component, event, helper) {
        var fieldType = component.get("v.fieldType");
        var options = component.get("v.options");
        var body = component.get("v.body");
        var picklist = (!$A.util.isEmpty(body) && body.length == 1) ? body[0] : undefined;
        // An undefined options means it no longer exists, empty is a valid case 
        if(!$A.util.isUndefined(options) && !$A.util.isEmpty(picklist) && picklist.get("v.options").length != options.length) {
            var config = this.configMap[fieldType.toLowerCase() + component.get("v.viewType")];
            var valueKey = config.valueKey || "value";
            this.setValueFirstOption(component, picklist, options, valueKey);
            picklist.set("v." + config.attributeKey, options);
            //there seems to be a bug where an empty list doesnt re-render properly
            //setting the class forces a proper rerender
            picklist.set("v.class", ($A.util.isEmpty(options)) ? "slds-show" : "");
        }
    },
    setValueFirstOption: function(component, picklist, options, valueKey) {
        var fieldValue = component.get("v.fieldValue");
        var values = [];
        for(var index in options) {
            values.push(options[index].value);
        }
        //check if value exists in list, if not set first as selected
        if(values.indexOf(fieldValue) == -1) {
            fieldValue = (options.length > 0) ? options[0].value : "";
        }
        //set selected
        this.setSelectedOptions(options, fieldValue);
        
        //update options
        picklist.set("v." + valueKey, fieldValue);
    },
    getOutputSelectValue: function(options, value) {
        for (var i = 0; i < options.length; i++) {
            if (options[i].value == value) return options[i].label;
        }
        return null;
    },
    onValueChange: function(component, event, helper) {
        var body = component.get("v.body");
        if($A.util.isEmpty(body)) {
            return;
        }

        var value = event.getParams().value;
        var oldVal = component.get("v.fieldValue");
        if(!($A.util.isEmpty(value) && $A.util.isEmpty(oldVal)) && value != oldVal) {
            //save new value
            component.set("v.fieldValue", value);
            var displayValue = value;
            //for reference, include label
            if(component.get("v.fieldType") === "reference") {
                body.forEach(function(cmp) {
                    displayValue = cmp.get("v.selectedLabel");
                });
            }
            component.getEvent("valueChanged").setParams({
                typeOf: "ui:change",
                payload: {
                    index: component.get("v.index"),
                    name: component.get("v.fieldName"),
                    value: value,
                    label: displayValue
                }
            }).fire();
        }
    },
    render: function(component) {
        var self=this;
        var body = component.get("v.body");
        var errors = ((component.get("v.fieldRequired") && $A.util.isEmpty(component.get("v.fieldValue"))) ? [{message: $A.get("$Label.DetailError.Required")}] : component.get("v.errors"));
        body.forEach(function(entry) {
            // Read components don't show errors.
            var viewType = component.get("v.viewType").toLowerCase();
            if (viewType !== "read") {
                if (component.get("v.invalid")) {
                    entry.set("v.showErrors", true);
                    entry.set("v.errors", errors);
                } else {
                    entry.set("v.errors", null);
                    entry.set("v.showErrors", false);
                }
                entry.set("v.disabled", component.get("v.disabled"));
            }
        });
    },
    setSelectedOptions: function(options, fieldValue) {
        var fieldValueArray = (!$A.util.isEmpty(fieldValue)) ? fieldValue.split(";") : [];
        // perf reason: http://stackoverflow.com/questions/13645890/javascript-for-in-vs-for-loop-performance
        // declared as array reason: http://stackoverflow.com/questions/500504/why-is-using-for-in-with-array-iteration-a-bad-idea
        for (var index = 0; index < options.length; index++) {
            if (fieldValueArray.indexOf(options[index].value) >= 0) {
                options[index].selected = true;
            } else {
                options[index].selected = false;
            }
        }
    }
})