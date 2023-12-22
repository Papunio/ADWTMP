using {db} from '../db/schema';

service footballService @(path: '/football') {
    entity Players   as projection on db.Players;
    entity Teams     as projection on db.Teams;
    entity Matches   as projection on db.Matches;
    entity Positions as projection on db.Positions;
    entity Pitches   as projection on db.Pitches;
}
