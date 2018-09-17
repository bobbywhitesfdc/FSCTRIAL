({
    provide: function(component, event) {        
        //iterate through multiselect options and create pills
        var data = [];
        var options = component.get("v.options");
        if(!$A.util.isEmpty(options)) {
            options.forEach(function(opt){
                data.push({ 
                    label: opt.label, 
                    keyword: opt.label, 
                    visible: "true", 
                    icon: undefined 
            });
            });
        }
        this.fireDataChangeEvent(component, data);
    }
})