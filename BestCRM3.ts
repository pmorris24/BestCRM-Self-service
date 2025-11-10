import type { Dimension, DateDimension, Attribute, DataSourceInfo } from '@sisense/sdk-data';

import { createAttribute, createDateDimension, createDimension } from '@sisense/sdk-data';

export const DataSource: DataSourceInfo = { title: 'BestCRM3', type: 'elasticube' };

export const AccountExecutives = createDimension({
    name: 'Account Executives',
    AccountExecutive: createAttribute({
        name: 'Account Executive',
        type: 'text-attribute',
        expression: '[Account Executives.Account Executive]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;

export const Accounts = createDimension({
    name: 'Accounts',
    AccountName: createAttribute({
        name: 'Account Name',
        type: 'text-attribute',
        expression: '[Accounts.Account Name]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;

interface CountriesDimension extends Dimension {
    Country: Attribute;
    Region: Attribute;
}
export const Countries = createDimension({
    name: 'Countries',
    Country: createAttribute({
        name: 'Country',
        type: 'text-attribute',
        expression: '[Countries.Country]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    Region: createAttribute({
        name: 'Region',
        type: 'text-attribute',
        expression: '[Countries.Region]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as CountriesDimension;

export const Industries = createDimension({
    name: 'Industries',
    Industry: createAttribute({
        name: 'Industry',
        type: 'text-attribute',
        expression: '[Industries.Industry]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;

export const Managers = createDimension({
    name: 'Managers',
    SalesManager: createAttribute({
        name: 'Sales Manager',
        type: 'text-attribute',
        expression: '[Managers.Sales Manager]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;

interface OpportunitiesDimension extends Dimension {
    isMTD: Attribute;
    isQTD: Attribute;
    isYTD: Attribute;
    OpportunityId: Attribute;
    OpportunityName: Attribute;
    Value: Attribute;
    CloseDate: DateDimension;
    CreationDate: DateDimension;
}
export const Opportunities = createDimension({
    name: 'Opportunities',
    isMTD: createAttribute({
        name: 'isMTD',
        type: 'numeric-attribute',
        expression: '[Opportunities.isMTD]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    isQTD: createAttribute({
        name: 'isQTD',
        type: 'numeric-attribute',
        expression: '[Opportunities.isQTD]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    isYTD: createAttribute({
        name: 'isYTD',
        type: 'numeric-attribute',
        expression: '[Opportunities.isYTD]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    OpportunityId: createAttribute({
        name: 'Opportunity Id',
        type: 'numeric-attribute',
        expression: '[Opportunities.Opportunity Id]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    OpportunityName: createAttribute({
        name: 'Opportunity Name',
        type: 'text-attribute',
        expression: '[Opportunities.Opportunity Name]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    Value: createAttribute({
        name: 'Value',
        type: 'numeric-attribute',
        expression: '[Opportunities.Value]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    CloseDate: createDateDimension({
        name: 'Close Date',
        expression: '[Opportunities.Close Date (Calendar)]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
    CreationDate: createDateDimension({
        name: 'Creation Date',
        expression: '[Opportunities.Creation Date (Calendar)]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as OpportunitiesDimension;

export const Outreaches = createDimension({
    name: 'Outreaches',
    OutreachMessage: createAttribute({
        name: 'Outreach Message',
        type: 'text-attribute',
        expression: '[Outreaches.Outreach Message]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;

export const Status = createDimension({
    name: 'Status',
    Status: createAttribute({
        name: 'Status',
        type: 'text-attribute',
        expression: '[Status.Status]',
        dataSource: { title: 'BestCRM3', live: false },
    }),
}) as Dimension;
