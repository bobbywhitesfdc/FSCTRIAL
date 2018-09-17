({
    onInit: function(component, event, helper) {
        helper.initializeParam(component, event, helper);
        // if should display the component, load initial values
        helper.renderComponent(component, function() {
            helper.changedPeriod(component, event, helper, false);
            helper.getScore(component, event, helper);
        });
    },
    handleClick: function(component, event, helper) {
        if (event.getSource().isValid()) {
            helper.changedPeriod(component, event, helper, false);
        }
    },
    onChange: function(component, event, helper) {
        var eRecord = event.getParam("record");
        var eRecordObjectType = (!$A.util.isEmpty(eRecord)) ? eRecord.sobjectType : null;
        //in ui-lead-runtime-components/components/runtime_sales_lead/convert/convertHelper.js line 338
        //after conversion is done the converted confirmation modal is displayed
        var panelConfig = event.getParam("panelConfig");
        var isConverted = (!$A.util.isEmpty(panelConfig) && !$A.util.isEmpty(panelConfig.body) && panelConfig.body.getLocalId() == "leadConverted");
        //refresh on any lead changes
        if(isConverted || (!$A.util.isEmpty(eRecordObjectType) && (eRecordObjectType === "Lead" || eRecordObjectType === "AccountContactRelation"))) {
            helper.changedPeriod(component, event, helper, true);
            helper.getScore(component, event, helper);
        }
    }
})