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
    team1 : Association to one Teams.matches
                on team1.match = $self;

    @title: 'Score'
    score : String(5);

    @title: 'Team2'
    team2 : Association to one Teams.matches
                on team2.match = $self;

}
