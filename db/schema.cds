namespace db;

using {cuid} from '@sap/cds/common';

@title: 'Entity that represents football player'
entity Players : cuid {
    @title: 'Player Name'
    name     : String(100);

    @title: 'Player Last Name'
    lastName : String(100);

    @title: 'Player Position'
    position : Association to one Positions;

    @title: 'Player Age'
    age      : Integer;

    @title: 'Teams with this player'
    teams    : Association to many Teams.players
                   on teams.player = $self;
}

@title: 'Entity that represents football team'
entity Teams : cuid {
    @title: 'Team Name'
    name    : String(100);


    @title: 'Players in team'
    players : Composition of many {
                  key player : Association to Players;
              };

    @title: 'Matched played by team'
    matches : Composition of many {
                  key match : Association to Matches;
              };
}

@title: 'Entity that represents football match'
entity Matches : cuid {
    @title: 'Team1'
    teams : Association to many Teams.matches
                on teams.match = $self;

    @title: 'Score'
    score : String(5);

    @title: 'Match localization'
    place : Association to one Pitches;
}

@title: 'Entity that represents positions'
entity Positions {
        @title: 'Position abbreviation'
    key ID   : String(2);

        @title: 'Position full name'
        name : localized String;
}

@title: 'Entity that represents football pitch'
entity Pitches : cuid {
    @title: 'Pitch country'
    country : String;

    @title: 'Pitch city'
    city    : String;

    @title: 'Pitch street address'
    street  : String;
}
