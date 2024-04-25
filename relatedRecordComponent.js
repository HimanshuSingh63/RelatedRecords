import { LightningElement, wire, track, api } from 'lwc';
import getAccountContacts from '@salesforce/apex/AccountRelatedListController.getAccountContacts';
import getAccountOpportunities from '@salesforce/apex/AccountRelatedListController.getAccountOpportunities';
import updateFileds from '@salesforce/apex/AccountRelatedListController.updateFileds';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import OPPORTUNITY_OBJECT from "@salesforce/schema/Opportunity";
import STAGE_FIELD from "@salesforce/schema/Opportunity.StageName";

export default class RelatedRecordComponent extends LightningElement {
    @api recordId;
    @track contactsData = [];
    @track opportunitiesData = [];
    @track draftValues = [];
    @track ValuesToUpdate = [];
    @track stageOptions;
    opportunityRecordTypeId;
    stages;
    sumOfAmount=0;
  
    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    results({ error, data }) {
      if (data) {
        this.opportunityRecordTypeId = data.defaultRecordTypeId;
        this.error = undefined;
      } else if (error) {
        this.error = error;
        this.opportunityRecordTypeId = undefined;
      }
    }
  
    @wire(getPicklistValues, { recordTypeId: "$opportunityRecordTypeId", fieldApiName: STAGE_FIELD })
    picklistResults({ error, data }) {
      if (data) {
        this.stages = data.values;
        console.log('stages ',this.stages);
        this.error = undefined;
        this.stageOptions = this.stages.map(item => item.value);
        console.log('stageOptions',this.stageOptions); 
      } else if (error) {
        this.error = error;
        this.stages = undefined;
        console.log('stages ',this.stages);
      }
    }
    
   
    contactsColumns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { label: 'Email', fieldName: 'Email', type: 'email', editable: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
        // Add more fields as needed
    ];

    opportunitiesColumns = [
        { label: 'Name', fieldName: 'Name', editable: true },
        { 
            label: 'Stage', 
            fieldName: 'StageName', 
            type: 'picklist', 
            editable: true,
            typeAttributes: { 
                placeholder: 'Choose Stage', 
                options: this.stageOptions, // provide options from StageName picklist values
                value: { fieldName: 'StageName' }, // bind to StageName field
                context: { fieldName: 'Id' }, // bind to record Id
                variant: 'label-hidden', 
                name: 'StageName', 
                label: 'Stage'
            }
        },
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
            this.opportunitiesData.forEach(item =>{
                this.sumOfAmount +=item.Amount
            })

        } else if (error) {
            console.error('Error fetching opportunities:', error);
        }
    }

    handleSave(event) {
        this.ValuesToUpdate = event.detail.draftValues;
        console.log('ValuesToUpdate:', this.ValuesToUpdate);
    
        updateFileds({recordInput:this.ValuesToUpdate})
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Records updated',
                        variant: 'success'
                    })
                );
                // Clear all draft values
                this.draftValues = [];
                // this.ValuesToUpdate = [];
                
                return Promise.all([
                    refreshApex(this.contactsData), 
                    refreshApex(this.opportunitiesData)
                ]);
            })
            .catch(error => {
                // Handle error
                console.error('Error updating record:', error.body.message);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    } 
}
