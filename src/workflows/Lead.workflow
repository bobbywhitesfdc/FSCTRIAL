<?xml version="1.0" encoding="UTF-8"?>
<Workflow xmlns="http://soap.sforce.com/2006/04/metadata">
    <alerts>
        <fullName>FSCNewReferralAssignmentNotification</fullName>
        <description>Email alert for a new referral assignment</description>
        <protected>false</protected>
        <recipients>
            <type>owner</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>FSCEmailTemplates/FSCNewReferralAssignmentNotification</template>
    </alerts>
    <alerts>
        <fullName>FSCNewReferralNotification</fullName>
        <description>Email alert for a new referral</description>
        <protected>false</protected>
        <recipients>
            <field>FinServ__ReferredByContact__c</field>
            <type>contactLookup</type>
        </recipients>
        <recipients>
            <field>FinServ__ReferredByUser__c</field>
            <type>userLookup</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>FSCEmailTemplates/FSCNewReferralNotification</template>
    </alerts>
    <alerts>
        <fullName>FSCUpdatedReferralNotification</fullName>
        <description>Email alert for an updated referral</description>
        <protected>false</protected>
        <recipients>
            <field>FinServ__ReferredByContact__c</field>
            <type>contactLookup</type>
        </recipients>
        <recipients>
            <field>FinServ__ReferredByUser__c</field>
            <type>userLookup</type>
        </recipients>
        <senderType>CurrentUser</senderType>
        <template>FSCEmailTemplates/FSCUpdatedReferralNotification</template>
    </alerts>
</Workflow>
