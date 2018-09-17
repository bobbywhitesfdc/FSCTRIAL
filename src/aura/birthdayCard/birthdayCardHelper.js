({
    getRecordCount: function(component) {

        var recordCountAction = component.get("c.getNumberOfUpcomingBirthdays");
       
        recordCountAction.setCallback(this, function(b) {
            var state = b.getState();
            if (state === "SUCCESS") {
                var recordCount = b.getReturnValue();
                component.set("v.recordCount", recordCount);
            }
        });
        $A.enqueueAction(recordCountAction);
    },
    getList: function(component) {
        var recordListAction = component.get("c.getClientsWithUpcomingBirthday");

        recordListAction.setParams({
            "userDateFormat": $A.get("$Locale.dateFormat")
        });

        recordListAction.setCallback(this, function(b) {
            var state = b.getState();
            if (state === "SUCCESS") {
                var birthdayList = b.getReturnValue();
                component.set("v.birthdayList", birthdayList);

            }
        });
        $A.enqueueAction(recordListAction);
    }
})