# Better-Magic-Cards
Extension for http://magiccards.info

**Auto-Pagination**  
> Automatically loads the next page of cards once you scroll to the bottom.

**c[:=!][wubrgmcl012345]+**  
> Search for cards with a specific number of colors.  
> *(c:23 returns cards with 2 or 3 colors, c:3wu returns 3-color cards that are white and/or blue, c!3wu returns 3-color cards that are white and blue, etc.)*

**ci![wubrg]+**  
> Search for cards with a strict color identity.  
> *(ci!wu returns Adarkar Unicorn, but not Abandoned Outpost)*

**cw[:=][wubrg]+**  
> Search for cards that are castable with just the selected colors.  
> *(cw:wu returns Abbey Gargoyles, Bant Sureblade, etc.)*

**cw![wubrg]+**  
> Search for cards that are castable with just the selected colors, but contain off-colors (i.e. hybrid or color indicators).  
> *(cw!wu returns Bant Sureblade, but not Abbey Gargoyles)*


To-do:
	Add ability to switch between original/parsed query-view
	Add advanced page options