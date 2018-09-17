({
    /*
     * init function to set object security level based on user
     */
    setObjectSecurity: function(component) {
        var objectList = component.get("v.additionalSObjects") || [];
        var sObjectName = component.get("v.sObjectName");
        var licenseKeys = component.get("v.licenseKeys");
        var recordTypeNames = component.get("v.recordTypeNamesMap");
        var addRecTypNamespace = component.get("v.addRecTypNamespace");
        
        if ( addRecTypNamespace ) {
            // Matches markup://<namespace> and extracts namespace
            var prefix = component.getType().split(":")[0];
            prefix = prefix == "c" ? "" : prefix + "__";

            // append namespace to each record type
            for (var aprop in recordTypeNames) {
                for (var i = 0; i < recordTypeNames[aprop].length; i++) {
                    var arectyp = recordTypeNames[aprop][i];
                    arectyp = arectyp.startsWith(prefix) ? arectyp : prefix + arectyp;
                    recordTypeNames[aprop][i] = arectyp;
                }
            }
        }

        if (!$A.util.isEmpty(sObjectName)) {
            objectList.push(sObjectName);
        }
        if (!$A.util.isEmpty(objectList) || !$A.util.isEmpty(licenseKeys)) {
            var action = component.get("c.getObjectsSecurity");
            action.setParams({
                "sObjectNames": objectList,
                "licenseKeys": licenseKeys,
                "recordTypeNames": recordTypeNames
            });
            action.setStorable();
            action.setCallback(this, function(response) {
                if (response.getState() === "SUCCESS") {

                    var securityLevels = response.getReturnValue();
                    component.set("v.canCreate", securityLevels.canCreate);
                    component.set("v.canRead", securityLevels.canRead);
                    component.set("v.canUpdate", securityLevels.canUpdate);
                    component.set("v.canDelete", securityLevels.canDelete);
                    component.set("v.hasLicense", securityLevels.hasLicense);
                    if (!securityLevels.hasLicense) {
                        component.find("pslAccessError").showError();
                    }
                } else if (response.getState() === "ERROR") {
                    var errorMessage = "";
                    if (!$A.util.isEmpty(response.getError())) {
                        errorMessage = response.getError()[0]["message"];
                    }

                    $A.get("e.force:showToast").setParams({
                        message: errorMessage,
                        key: "error",
                        isClosable: false

                    }).fire();
                }

            });
            $A.enqueueAction(action);
        }
    }
})