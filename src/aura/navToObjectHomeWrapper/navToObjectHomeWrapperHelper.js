({
    getObjectHome: function(component) {
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.toString().match(/markup:\/\/(\w{1,15}):/)[1];
        prefix = prefix == "c" ? "" : prefix + "__";

        var homeEvent = $A.get("e.force:navigateToObjectHome");
        var objectName = component.get("v.sObjectName");

        //add namespace for custom object
        if (objectName.indexOf("__c") > -1) {
            objectName = prefix + objectName;
        }

        homeEvent.setParams({
            "scope": objectName
        });
        homeEvent.fire();
    }
})