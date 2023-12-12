namespace db;

using {cuid} from '@sap/cds/common';

entity Players : cuid {
    @title: 'Player Name'
    name     : String(100);

    @title: 'Player Last Name'
    lastName : String(100);
}
