({
    //grabs Alert records
    provide: function(component) {

        var alertRecordsAction = component.get("c.getAlertRecords");
        alertRecordsAction.setParams({
            "recordId": component.get("v.recordId")
        });
        var self = this;
        alertRecordsAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var records = response.getReturnValue();
                component.set("v.items", records);
                self.fireDataChangeEvent(component, records, 1);
            } else if (response.getState() === "ERROR") {
                var errorEvent = component.getEvent("error");
                errorEvent.setParams({
                    error: $A.get("$Label.FinServ.Msg_Error_Alerts_Cannot_Load")
                }).fire();
            }
        });
        $A.enqueueAction(alertRecordsAction);
    },
    //copy paste from aura framework and remove setComponentEvent since locker service blocks it
    fireDataChangeEvent: function (dataProvider, data, currentPage) {
        var dataChangeEvent = dataProvider.getEvent("onchange");
        dataChangeEvent
            .setParams({
              data : data,
              currentPage : currentPage
           }).fire();
    },
    //closes existing pop up modal
    closeModal: function(modalComponentId) {
        $A.getComponent(modalComponentId).getEvent('notify').setParams({
            action: 'closePanel',
            typeOf: 'ui:closePanel'
        }).fire();
    },
    //deactivates Alert
    deactivateAlert: function(component, event) {
        var modalComponentId = event.getParam("modalId");
        var alertRecordId = event.getParam("attributes").recordId;
        var componentId = event.getParam("attributes").componentId;
        var deactivateAlert = component.get("c.deactivateAlertRecord");
        var self=this;
        deactivateAlert.setParams({
            recordId: alertRecordId
        });
        deactivateAlert.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var succesfullyDeactivated = response.getReturnValue();
                if (succesfullyDeactivated) {
                    //modalId will be null in case of info level severity
                    if (!$A.util.isEmpty(modalComponentId)) {
                        self.closeModal(modalComponentId);
                    }
                    $A.util.addClass($A.getComponent(componentId), "slds-hide");
                }
            } else if (response.getState() === "ERROR") {
                var errorEvent = component.getEvent("error");
                errorEvent.setParams({
                    error: $A.get("$Label.FinServ.Msg_Error_Alerts_Cannot_Remove")
                }).fire();
            }
        });
        $A.enqueueAction(deactivateAlert);
    }

})