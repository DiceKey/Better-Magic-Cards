# Better-Magic-Cards
Extension for http://magiccards.info

c:[wubrgmcl012345]+
Search for cards with a specific number of colors.
(c:3w returns 3-color white cards, c:23 returns cards with 2 or 3 colors, etc.)

ci![wubrg]+
Search for cards with a strict color identity.
(ci!wu returns Adarkar Unicorn, but not Abandoned Outpost)

cw:[wubrg]+
Search for cards that are castable with just the selected colors.
(cw:wu returns Abbey Gargoyles, Bant Sureblade, etc.)

cw![wubrg]+
Search for cards that are castable with just the selected colors, but contain off-colors (i.e. hybrid or color indicators).
(cw!wu returns Bant Sureblade, but not Abbey Gargoyles)