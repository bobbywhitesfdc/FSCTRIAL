({
    onInit: function(component, event) {
        // Constant like variables
        var INDIVIDUAL = component.get("v.individualAccountRecordTypeName");;
        var GROUP = component.get("v.householdRecordTypeName");
        var CONTACT = 'Contact';
        var destination;

        // valueObject to hold data that embedded component needs
        var valueObject = {};
        var recordId;
        var recordType;
        var recordName;
        var record = component.get("v.record");

        if ($A.util.isEmpty(record)) {
            $A.log("navToLookupController.onInit - found empty record ");
            return;
        }

        // TODO: in 200, the returned query result no longer provide the sobjectType parameter, this is a temperoary workaround 
        // in future we need to use another way to check if the record is Contact
        // If record is of type Contact with record type Individual, populate data from Account object
        if (!$A.util.isEmpty(record.Account) && record.Id.indexOf("003") == 0 &&
            record.Account.RecordType.Name === INDIVIDUAL) {
            recordId = record.Account.Id;
            recordType = record.Account.RecordType.Name;
            recordName = record.Account.Name;
        } else {
            // Populate data from the record object directly
            recordId = record.Id;
            recordType = $A.util.isEmpty(record.RecordType) ? '' : record.RecordType.Name;
            recordName = record.Name;
        }

        // Navigate to details, if record type is not available or is anything other than Group/Individual
        destination = "markup://FinServ:navToObjectWrapper";
        valueObject.sObjectId = recordId;
        valueObject.displayText = recordName;

        $A.createComponent(destination, valueObject, function(newCmp, status, statusMessage) {
            //make sure is not null
            if (status === "SUCCESS") {
                component.set("v.body", newCmp);
            }
        });
    }
})