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

    @title: 'Teams with this player'
    teams    : Association to many Teams.players
                   on teams.player = $self;
}

@title: 'Entity that represents football team'
entity Teams : cuid {
    @title: 'Team Name'
    name    : String(30);


    @title: 'Players in team'
    players : Composition of many {
                  key player : Association to Players;
              };

    @title: 'Matched played by team'
    matches : Association to many Matches.teams
                  on matches.team = $self;

    @title: 'Team Logo'
    logo    : String;
}

@title: 'Entity that represents football match'
entity Matches : cuid {
    @title: 'Team1'
    teams : Composition of many {
                key team : Association to Teams;
            };

    @title: 'Match localization'
    place : String;

    @title: 'Match date'
    date  : Date;
}
