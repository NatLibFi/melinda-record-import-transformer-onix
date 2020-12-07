import {createValueInterface} from './common';


export function generate250(record, dataSource, source4Value) {
  // Generate only if EditionNumber exists!

  const {getValue} = createValueInterface(record);

  const editionNr = getValue('DescriptiveDetail', 'EditionNumber');

  if (editionNr && dataSource === source4Value) {
    return [
      {
        tag: '250',
        ind1: ' ',
        ind2: ' ',
        subfields: [{code: 'a', value: `${editionNr}. painos`}]
      }
    ];
  }

  return [];
}


export function generate263(record, dataSource, source4Value) {
  // Generate only if: NotificationType = 01 or 02  AND PublishingDateRole = 01

  const {getValue} = createValueInterface(record);

  const PubDatDate = getValue('PublishingDetail', 'PublishingDate', 'Date');
  const PubDatRole = getValue('PublishingDetail', 'PublishingDate', 'PublishingDateRole');
  const NotifType = getValue('NotificationType');

  if (PubDatDate && PubDatRole && NotifType && dataSource === source4Value) {

    if ((NotifType === '01' || NotifType === '02') && PubDatRole === '01') {
      return [
        {
          tag: '263',
          ind1: ' ',
          ind2: ' ',
          subfields: [{code: 'a', value: PubDatDate}]
        }
      ];
    }
    return [];
  }

  return [];
}


export function generate264(record) {

  const {getValue} = createValueInterface(record);

  const publisher = getValue('PublishingDetail', 'Publisher', 'PublisherName');

  if (publisher) {
    const publishingYear = generatePublishingYear();

    if (publishingYear) {
      return {
        tag: '264', ind2: '1',
        subfields: [
          {code: 'b', value: publisher},
          {code: 'c', value: publishingYear}
        ]
      };
    }

    return {
      tag: '264', ind2: '1',
      subfields: [{code: 'b', value: publisher}]
    };
  }

  return [];

  function generatePublishingYear() {
    const publishingDate = getValue('PublishingDetail', 'PublishingDate', 'Date');
    return publishingDate ? publishingDate.slice(0, 4) : '    ';
  }

}

