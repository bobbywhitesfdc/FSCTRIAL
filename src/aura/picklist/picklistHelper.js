({
    setOptions: function(cmp, event) {
        var options = cmp.get("v.options");
        var allOption;
        if (options) {
            // Determine if an 'All' option exists and store location
            for (var i=0; i< options.length; i++) {
                var option = options[i];
                if (option.label.toLowerCase() == "all") {
                    allOption = option;
                }
            }
            if (allOption) {
                var isAllClicked = (event.getParam("selectedItem").get("v.value").toLowerCase() == "all");
                var isSelected = event.getParam("selectedItem").get("v.selected");
                // Select/deselect everything via "All" option
                if(isAllClicked) {
                    for (var i=0; i < options.length; i++) {
                        options[i].selected = isSelected;
                    }
                // When all of the non-'All' options are selected, 'All' option should be selected
                } else if (isSelected && cmp.get("v.selectedLabels").length == (options.length - 2)) {
                    allOption.selected = true;
                // Unselected something when everything was selected
                } else {
                    if (allOption.selected == true) {
                        allOption.selected = false;
                    }
                }
            }
            cmp.set("v.options", options);
        }       
    },

    setLabelsAndValues: function(cmp) {
        var options = cmp.get("v.options");
        var labels = [];
        var values = [];
        if (options) {
            for (var i = 0; i < options.length; i++) {
                if (options[i].selected) {
                    labels.push(options[i].label);
                    values.push(options[i].value);
                }
            }
        }
        cmp.set("v.selectedLabels", labels);
        cmp.set("v.value", values.join(";"));
    }
})