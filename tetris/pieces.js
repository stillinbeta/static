function Tile(x,y,color) //Class for individual tiles. Each Piece is an array of them. They can make sure they can go to somewhere. This is the function the blocks call to check out rotations and moves;
{
	this.x = x;
	this.y = y;
	this.color = color;
	
	this.erase = function() {
		
		$('div#r'+this.y+'c'+this.x).removeClass(); 
	}
	
	this.draw = function() {
		$('div#r'+this.y+'c'+this.x).addClass('active').addClass(this.color);
	}
	
	this.set = function() {
		$('div#r'+this.y+'c'+this.x).removeClass('active');
	}
	
	this.check = function()	{
		return check_square(this.x,this.y);
	}
	
	this.check_down = function() {
		if(this.y+1 > 20)
			return false;
		return check_square(this.x,this.y+1)
	}
	
	this.check_right = function() {
		if(this.x+1 > 10)
			return false;
		return check_square(this.x+1,this.y);
	}
	
	this.check_left = function() {
		if(this.x-1 < 0)
			return false;
		return check_square(this.x-1,this.y);
	}
}

function Piece(x,y) //Superclass for each piece. All attributes for pieces, except block layout and color are determined in this object.
{
	this.x = x;
	this.y = y;
	
	this.check = function () {
		for(var i = 0; i < this.tiles.length; i++)
		{
			if(!this.tiles[i].check())
			{
				game_over();
			}	
		}
	}
	
	this.draw = function() {
		if(is_paused || !is_playing)
			return false;
		/*for(var i = 0; i < this.tiles.length; i++)
		{
			if(!this.tiles[i].check())
				game_over();
		}*/
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].draw();
		}
	}
	this.erase = function() {
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].erase();
		}
	}
	this.set = function() {
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].set();
		}
		
	}
	this.move_down = function() {
		if(!is_playing){
			return false;
		}
		for (var i = 0; i < this.tiles.length; i++)
		{
			if(!this.tiles[i].check_down())
			{
				if(this.y == 0) //are we at the very top?
				{
					game_over();
				}	
				new_piece();
				return false;
			}
		}
		this.y += 1;
		$('div.active').removeClass();
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].y+=1;
			this.tiles[i].draw();
		}
		
		return true;
	}
	this.move_left = function() {
		if(!is_playing){
			return false;
		}
		for (var i = 0; i < this.tiles.length; i++)
		{
			if(!this.tiles[i].check_left())
				return false;
		}
		this.erase();
		this.x -= 1;
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].x-=1;
			this.tiles[i].draw();
		}
	}
	this.move_right = function(){
		if(!is_playing){
			return false;
		}
		for (var i = 0; i < this.tiles.length; i++)
		{
			if(!this.tiles[i].check_right())
				return false;
		}
		this.x+=1;
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].erase();
			
		}
		
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].x+=1;
			this.tiles[i].draw();
		}
		
		return true;
	}
	this.rotate_old = function () { //Rotates the block, if it can. If it bumps a wall, it will push the block over. 
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].erase();
		}
	
		var tempx = Array();
		var tempy = Array();
		var valid = true;
		var shift = 0;
		var recheck = false; //Did we move the whole block?
		
		/*do
		{*/
			recheck = false;
			for (var i = 0; i < this.tiles.length; i++)
			{				
				tempx[i]= this.x+shift+(this.tiles[i].y-this.y)*-1;
				tempy[i] =this.y+(this.tiles[i].x-this.x+shift);
				
				if(!check_square(tempx[i],tempy[i]))
				{
					valid = false;
					/*if(tempx[i] < 0) //Going off the left edge?
					{
						shift = 1;
						recheck = true;
					}
					else if (tempx[i] > width) //Or off the right edge?
					{
						shift = -1;
						recheck = true;
					}*/
				}
			}
	/*	}
		while(recheck);
		
		if(valid)
			this.x += shift; */
			
		
		for (var i = 0; i < this.tiles.length; i++)
		{
			if(valid)
			{
				this.tiles[i].x = tempx[i];
				this.tiles[i].y = tempy[i];
					
			}
			
		}
		
		return valid;
	}
	this.rotate = function () {
		if(!is_playing){
			return false;
		}
		for (var i = 0; i < this.tiles.length; i++)
		{
			this.tiles[i].erase();
		}
	
		var tempx = Array();
		var tempy = Array();
		var valid = true;
		var shift = 0;
		var retry = false;
		
		do
		{
			retry = false;
			valid = true;
			for (var i = 0; i < this.tiles.length; i++)
			{
				var temp = this.tiles[i].x;
				tempx[i]= (this.x+(this.tiles[i].y-this.y))+shift;
				tempy[i] =this.y+(this.tiles[i].x-(this.x))*-1;
				
				if(!check_square(tempx[i],tempy[i]))
				{
					if(tempx[i] < 0)
					{	shift += 1;
						retry = true;
					}
					if(tempx[i] >= width)
					{
						shift -= 1;
						retry = true;
					}
					valid = false;
				}
			}
		}
		while(retry);
		
		if(valid)
		{
			for( var i = 0; i < this.tiles.length; i++)
			{
				this.tiles[i].erase();
			}
			
			for (var i = 0; i < this.tiles.length; i++)
			{
				this.tiles[i].x = tempx[i];
				this.tiles[i].y = tempy[i];
				this.tiles[i].draw();
			}
			
			this.x += shift; //Update the X Position
		}
	}
}

function Piece_O(x,y)
{
	this.color = 'red';

	this.inherit_from = Piece;
	this.inherit_from(x,y);
	this.tiles = Array(new Tile(this.x, this.y,this.color),new Tile(this.x+1,this.y,this.color),new Tile(this.x+1,this.y+1,this.color),new Tile(this.x,this.y+1,this.color));
	
	this.rotate = function() { // no need to waste cycles on something that does nothing.
		return true;
	}
}

function Piece_I(x,y)
{
	this.color = 'blue';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x-1, this.y,this.color),new Tile(this.x,this.y,this.color),new Tile(this.x+1,this.y,this.color),new Tile(this.x+2,this.y,this.color));
	
}

function Piece_J(x,y)
{
	this.color = 'green';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x-1, this.y,this.color),new Tile(this.x,this.y,this.color),new Tile(this.x+1,this.y,this.color),new Tile(this.x+1,this.y+1,this.color));
	
}

function Piece_L(x,y)
{
	this.color = 'magenta';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x-1, this.y,this.color),new Tile(this.x-1,this.y+1,this.color),new Tile(this.x,this.y,this.color),new Tile(this.x+1,this.y,this.color));
}

function Piece_Z(x,y)
{
	this.color = 'gray';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x-1, this.y,this.color),new Tile(this.x,this.y,this.color),new Tile(this.x,this.y+1,this.color),new Tile(this.x+1,this.y+1,this.color));
}

function Piece_S(x,y)
{
	this.color = 'brown';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x, this.y,this.color),new Tile(this.x+1,this.y,this.color),new Tile(this.x,this.y+1,this.color),new Tile(this.x-1,this.y+1,this.color));
}

function Piece_T(x,y)
{
	this.color = 'orange';
	this.inherit_from = Piece;
	this.inherit_from(x,y);
	
	this.tiles = Array(new Tile(this.x-1, this.y,this.color),new Tile(this.x,this.y,this.color),new Tile(this.x,this.y+1,this.color),new Tile(this.x+1,this.y,this.color));
}
