({
    // Event key code for Left key
    KEY_CODE_LEFT : 37,
    
    // Event key code for Up key
    KEY_CODE_UP : 38,

    // Event key code for Right key
    KEY_CODE_RIGHT : 39,
    
    // Event key code for Down key
    KEY_CODE_DOWN : 40,

    handleEvent: function(component, event) {
        var keyCode = event.keyCode;
        var arrowRight = $A.util.getBooleanValue(component.get("v.isArrowRight"));
        if($A.util.isEmpty(keyCode) || keyCode == 0) {
            this.switchIcon(component, !arrowRight);
        } else {
            if (arrowRight && (keyCode === this.KEY_CODE_LEFT || keyCode === this.KEY_CODE_DOWN)) {
                this.switchIcon(component, false);
            } else if (!arrowRight && (keyCode === this.KEY_CODE_UP || keyCode === this.KEY_CODE_RIGHT)) {
                this.switchIcon(component, true);
            }
        }
    },
    switchIcon: function (component, arrowRight) {
        component.set("v.isArrowRight", arrowRight);    
        var firstTimeAccessed = component.get("v.firstTimeAccessed");
        component.getEvent("expandListViewTable").setParams({
            "firstTimeAccessed": firstTimeAccessed,
            "rowRecordId": component.get("v.rowRecordId"),
        }).fire();
        component.set("v.firstTimeAccessed", false);
    }
})