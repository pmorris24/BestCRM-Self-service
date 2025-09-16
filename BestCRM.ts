import type { Dimension, DateDimension, Attribute, DataSourceInfo } from '@sisense/sdk-data';

import { createAttribute, createDateDimension, createDimension } from '@sisense/sdk-data';

export const DataSource: DataSourceInfo = { title: 'BestCRM', type: 'elasticube' };

interface AccountExecutivesDimension extends Dimension {
    AccountExecutive: Attribute;
    Avatar: Attribute;
}
export const AccountExecutives = createDimension({
    name: 'Account Executives',
    AccountExecutive: createAttribute({
        name: 'Account Executive',
        type: 'text-attribute',
        expression: '[Account Executives.Account Executive]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    Avatar: createAttribute({
        name: 'Avatar',
        type: 'text-attribute',
        expression: '[Account Executives.Avatar]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as AccountExecutivesDimension;

export const Accounts = createDimension({
    name: 'Accounts',
    AccountName: createAttribute({
        name: 'Account Name',
        type: 'text-attribute',
        expression: '[Accounts.Account Name]',
        dataSource: { title: 'BestCRM', live: false },
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
        dataSource: { title: 'BestCRM', live: false },
    }),
    Region: createAttribute({
        name: 'Region',
        type: 'text-attribute',
        expression: '[Countries.Region]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as CountriesDimension;

export const Industries = createDimension({
    name: 'Industries',
    Industry: createAttribute({
        name: 'Industry',
        type: 'text-attribute',
        expression: '[Industries.Industry]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as Dimension;

interface ManagersDimension extends Dimension {
    Avatar: Attribute;
    SalesManager: Attribute;
}
export const Managers = createDimension({
    name: 'Managers',
    Avatar: createAttribute({
        name: 'Avatar',
        type: 'text-attribute',
        expression: '[Managers.Avatar]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    SalesManager: createAttribute({
        name: 'Sales Manager',
        type: 'text-attribute',
        expression: '[Managers.Sales Manager]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as ManagersDimension;

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
        dataSource: { title: 'BestCRM', live: false },
    }),
    isQTD: createAttribute({
        name: 'isQTD',
        type: 'numeric-attribute',
        expression: '[Opportunities.isQTD]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    isYTD: createAttribute({
        name: 'isYTD',
        type: 'numeric-attribute',
        expression: '[Opportunities.isYTD]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    OpportunityId: createAttribute({
        name: 'Opportunity Id',
        type: 'text-attribute',
        expression: '[Opportunities.Opportunity Id]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    OpportunityName: createAttribute({
        name: 'Opportunity Name',
        type: 'text-attribute',
        expression: '[Opportunities.Opportunity Name]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    Value: createAttribute({
        name: 'Value',
        type: 'numeric-attribute',
        expression: '[Opportunities.Value]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    CloseDate: createDateDimension({
        name: 'Close Date',
        expression: '[Opportunities.Close Date (Calendar)]',
        dataSource: { title: 'BestCRM', live: false },
    }),
    CreationDate: createDateDimension({
        name: 'Creation Date',
        expression: '[Opportunities.Creation Date (Calendar)]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as OpportunitiesDimension;

export const Outreaches = createDimension({
    name: 'Outreaches',
    OutreachMessage: createAttribute({
        name: 'Outreach Message',
        type: 'text-attribute',
        expression: '[Outreaches.Outreach Message]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as Dimension;

export const Status = createDimension({
    name: 'Status',
    Status: createAttribute({
        name: 'Status',
        type: 'text-attribute',
        expression: '[Status.Status]',
        dataSource: { title: 'BestCRM', live: false },
    }),
}) as Dimension;
