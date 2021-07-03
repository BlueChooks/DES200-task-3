## spread behaviours:
- spreadLike: randomised pattern, spawns another tree like itself, with small chance to spawn another random tree
- clear: spreads in branch pattern, spawns another clear area like itself
- path: spawns another path tile like itself. Most likely to spread only in same direction it was going, small chance to turn corner. Small chance to spawn second path tile. Loops a limited number of times (globalVar--). Afterward, any adjacent tile without a path spawns a house
- town centre: spawns 2-4 path tiles
- spreadHouses: if adjacent to a path/town centre, high chance to spawn a house. If not adjacent to a path, checks if cell is within 5-ish tiles of a path. Chance for a house lowers as it gets further from the path, replaced by randomised tree
- spread city: spreads in a spiral to produce tight clusters

DES307
- checkFor(type, [animals]). type tells it what to check (tile type, animal array, whether it has water), array lists what it's checking for. returns boolean if any/all array items match (checkFor() and checkAll() to distinguish between matching any and matching all? Or just a paramater?)