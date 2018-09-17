<!--
+ * Copyright © 2015 salesforce.com, inc. All rights reserved.
+ * @copyright This document contains proprietary and confidential information and shall not be reproduced,
+ * transferred, or disclosed to others, without the prior written consent of Salesforce.
+ * @description base application template for all lightning app must extend.
+ * @since 196
+-->
<aura:application extensible="true" abstract="true" description="" access="Public">
    <aura:attribute name="pageTitle" required="true" type="String" description="Title of the lightning app page" />
    <aura:handler name="init" value="{!this}" action="{!c.doInit}" />
    <body> {!v.body} </body>
</aura:application>