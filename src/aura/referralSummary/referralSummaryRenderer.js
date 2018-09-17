({
    afterRender: function(component, helper) {
        var ret = this.superAfterRender();
        var componentWidth = component.getElement().clientWidth;
        var componentWidthPercent = componentWidth/window.outerWidth;
        if(componentWidthPercent < 0.4 && component.get("v.width") === "WIDE"){
            component.set("v.width", "NARROW");
        }
        return ret;
    }
})