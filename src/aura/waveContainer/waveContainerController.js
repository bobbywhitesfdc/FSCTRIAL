({
    onInit: function(component, event) {
        var prefix = "";
        var cmpToString = component.toString();
        var token = "markup://";
        var tokenIndex = cmpToString.indexOf(token);
        if (tokenIndex != -1) {
            var componentAndNamespace = cmpToString.substring((tokenIndex + token.length), cmpToString.length);
            if (componentAndNamespace.indexOf(":") != -1) {
                prefix = componentAndNamespace.split(":")[0];
            }
        }
        prefix = prefix == "c" ? "" : prefix + "__";
        component.set("v.namespacePrefix", prefix);
        component.set("v.isReady", true);
    }
})