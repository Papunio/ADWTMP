using {db} from '../db/schema';

service footballService @(path: '/football') {
    entity Players as projection on db.Players;
}
