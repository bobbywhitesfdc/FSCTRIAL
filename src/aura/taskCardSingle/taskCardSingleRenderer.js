({
    rerender: function(component) {
        var ret = component.superRerender();
        if (component.find("checkbox") && component.find("checkbox").getElement()) {
            var checkbox = component.find("checkbox").getElement();
            if(component.get("v.disableCheckbox")){
                checkbox.setAttribute("disabled", "disabled");
            }
            else{
                checkbox.removeAttribute("disabled");
            }
        }
        return ret;
    }
})