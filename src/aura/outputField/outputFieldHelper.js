({
    init: function(component) {
        //if value is blank, return
        var fieldValue = component.get("v.fieldValue");
        if ($A.util.isUndefined(fieldValue)) {
            return;
        }

        var recordType = component.get("v.fieldType").toLowerCase();
        var destination = null;
        var valueObject = {};
        //currency
        if (recordType == "currency") {
            destination = "ui:outputCurrency";
            valueObject.value = fieldValue;
            if (component.get("v.truncateDecimal") === true) {
                valueObject.format = $A.get("$Locale.currencyFormat").replace(/\.(0+)/i, "");
            }
            if (component.get("v.currencyIndicator") === true && !component.get("v.formatLabel")) {
                if (component.get("v.fieldValue") >= 0) {
                    valueObject.class = "positiveNumber";
                } else {
                    valueObject.class = "negativeNumber";
                }
            }
        } else if (recordType == "date") {
            destination = "ui:outputDate";
            valueObject.value = fieldValue;
        } else if (recordType == "datetime") {
            destination = "ui:outputDateTime";
            valueObject.value = fieldValue;
        } else if (recordType == "number") {
            destination = "ui:outputNumber";
            valueObject.value = fieldValue;
            valueObject.indicator = component.get("v.numberIndicator");
            valueObject.soapType = recordType;
        } else if (recordType == "url") {
            destination = "ui:outputURL";
            valueObject.value = fieldValue;
            valueObject.label = fieldValue;
        } else if (recordType == "recordlookupurl") {
            if(component.get("v.record") != undefined) {
                destination = "force:outputLookupWithPreview";
                valueObject.label = component.get("v.record").Name;
                valueObject.value = component.get("v.record").Id;
                valueObject.isProfilePicSupported = true;
                valueObject.showRelatedLists = true;
                valueObject.showPreview = true;
            }
        } else if (recordType == "percent") {
            destination = "FinServ:outputNumberOrPercent";
            valueObject.value = fieldValue;
            valueObject.indicator = component.get("v.percentageIndicator");
            valueObject.soapType = recordType;
        } else if (recordType == "boolean") {
            destination = "ui:outputCheckbox";
            valueObject.value = (fieldValue === true);
        } else if (recordType == "phone") {
            destination = "ui:outputPhone";
            valueObject.value = fieldValue;
        } else if (recordType == "email") {
            destination = "ui:outputEmail";
            valueObject.value = fieldValue;
        } else {
            // formula fields do not allow javascript as part of the formula,
            // so we don't have to worry about possible security breach
            destination = "ui:outputRichText";
            valueObject.class = "slds-truncate";
            valueObject.value = fieldValue;
        }
        var label = component.get("v.fieldLabel");
        var labelParts = !$A.util.isEmpty(label) ? label.split('{0}') : [];
        if(component.get("v.formatLabel") && !$A.util.isEmpty(labelParts)) {
            component.set("v.prependLabel", labelParts[0]);
            component.set("v.appendLabel", labelParts[1]);
        }
        $A.createComponent(destination, valueObject, function(newCmp, status, statusMessage) {
            if (status === "SUCCESS") {
                var outputComponent = component.get("v.outputComponent");
                outputComponent[0] = newCmp;
                component.set("v.outputComponent", outputComponent);
            } else if (status === "ERROR") {
                // TODO: Should we show this error in the UI?
                $A.log("Error creating " + destination, statusMessage);
            }
        });
    }
})