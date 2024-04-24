import { LightningElement,wire,track,api} from 'lwc';
import getAccountContacts from '@salesforce/apex/AccountRelatedListController.getAccountContacts';
import getAccountOpportunities from '@salesforce/apex/AccountRelatedListController.getAccountOpportunities';

export default class RelatedRecordComponent extends LightningElement {
    @api recordId;
    @track contactsData = [];
    @track opportunitiesData = [];
    @track draftValues = [];

    contactsColumns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
        // Add more fields as needed
    ];

    opportunitiesColumns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Stage', fieldName: 'StageName', editable: true },
        { label: 'Amount', fieldName: 'Amount', type: 'currency', editable: true },
        // Add more fields as needed
    ];

    @wire(getAccountContacts, { accountId: '$recordId' })
    wiredContacts({ error, data }) {
        if (data) {
            this.contactsData = data;
        } else if (error) {
            console.error('Error fetching contacts:', error);
        }
    }

    @wire(getAccountOpportunities, { accountId: '$recordId' })
    wiredOpportunities({ error, data }) {
        if (data) {
            this.opportunitiesData = data;
        } else if (error) {
            console.error('Error fetching opportunities:', error);
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'edit':
                this.draftValues = [...this.draftValues, row];
                break;
            case 'save':
                // Call Apex method to update the record
                break;
            default:
        }
    }
}