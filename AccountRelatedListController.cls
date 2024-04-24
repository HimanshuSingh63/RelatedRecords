// AccountRelatedListController.apxc
public with sharing class AccountRelatedListController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getAccountContacts(Id accountId) {
        return [
            SELECT Id, Name, Email, Phone
            FROM Contact
            WHERE AccountId = :accountId
        ];
    }

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getAccountOpportunities(Id accountId) {
        return [
            SELECT Id, Name, StageName, Amount
            FROM Opportunity
            WHERE AccountId = :accountId
        ];
    }
}