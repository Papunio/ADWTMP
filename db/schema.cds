namespace db;

using {cuid} from '@sap/cds/common';

@title: 'Entity that represents football player'
entity Players : cuid {
    @title: 'Player Name'
    name     : String(100);

    @title: 'Player Last Name'
    lastName : String(100);

    @title: 'Player Position'
    position : String(100);

    @title: 'Player Age'
    age      : Integer;
}

@title: 'Entity that represents football match'
entity Matches : cuid {
    @title: 'Team1 name'
    t1Name    : String(100);

    @title: 'Players in Team1'
    t1Players : Composition of many {
                    key player : Association to Players;
                };

    @title: 'Score of the game'
    score     : String(5);

    @title: 'Team2 name'
    t2Name    : String(100);

    @title: 'Players in Team2'
    t2Players : Composition of many {
                    key player : Association to Players;
                };
}
