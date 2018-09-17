({
    getRecordCount: function(component) {

        var recordCountAction = component.get("c.getNumberOfOpenAssignedReferrals");
        var fieldStr = "Id";

        recordCountAction.setParams({
            "ownerId" : $A.get("$SObjectType.CurrentUser.Id"),
            "fields": fieldStr
        });
       
        recordCountAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var recordCount = response.getReturnValue();
                component.set("v.recordCount", recordCount);
            } else if (response.getState() === "ERROR") {
                //show error message
                var errorMessages = [];
                response.getError().forEach(function(error) {
                    errorMessages.push(error.message);
                });
                component.set("v.errors", errorMessages);
            }
        });
        $A.enqueueAction(recordCountAction);
    },
    getList: function(component) {
        var fieldStr = "Name,ExpressedInterest__c,Status,Rating,CreatedDate"; //,ScoreIntelligence.Score";
        // Matches markup://<namespace> and extracts namespace
        var prefix = component.getType().split(":")[0];
        prefix = prefix == "c" ? "" : prefix + "__";

        var recordListAction = component.get("c.getOpenAssignedReferrals");
        recordListAction.setParams({
            "ownerId" : $A.get("$SObjectType.CurrentUser.Id"),
            "fields": fieldStr
        });
        component.set("v.referralList", []);
        recordListAction.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var response = response.getReturnValue();
                // Remove the namespace prefix from the fields
                var referralList = JSON.parse(JSON.stringify(response).split(prefix).join(""));
                // Add the score intelligence score in the LeadScore field
                for(var i=0; i < referralList.length; i++) {
                    if (!$A.util.isUndefinedOrNull(referralList[i].ScoreIntelligence)) {
                        referralList[i].LeadScore = referralList[i].ScoreIntelligence.Score;
                    }
                }
                component.set("v.referralList", referralList);
            } else if (response.getState() === "ERROR") {
                //show error message
                var errorMessages = [];
                response.getError().forEach(function(error) {
                    errorMessages.push(error.message);
                });
                component.set("v.errors", errorMessages);
            }
        });
        $A.enqueueAction(recordListAction);
    }
})