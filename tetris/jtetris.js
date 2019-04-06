var height = 20;
var width = 10;

var current_piece;
var buffer_piece;
var score = 0;
var level = 1;
var speed = 1000;
var interval_id;
var is_paused = false;
var is_playing = false;

function init() {
	setup_board();
	set_up_keys();
	start_game();
	
}

function setup_board() {
	$('body').append('<div id="tetris"></div>');
	$('div#tetris').append('<div id="field"></div>');

	for (var i = 0; i < height; i++) {
		$('div#field').append('<div class="row"></div>');
		for (var j = 0; j < width; j++) {
			$('div.row:last').append('<div class="tile" id="r'+i+'c'+j+'"></div>');
		}
	}
	$('div#tetris').append('<div id="sidebar"></div>');
	$('div#sidebar').append('<div id="preview"></div>');

	for(var i = 0; i < 2; i++) {//biggest piece is two tall
	
		$('div#preview').append('<div class="row"></div>');
		for(var j = 0; j < 4; j++) { //and four wide.
			$('div.row:last').append('<div class="ptile" id="previewr'+i+'c'+j+'"></div>'); //look familiar? Why bother making brand new css palletes when you can use the old one?
		}
	}

	$('div#sidebar').append('<div id="infobox"></div>');
	$('div#infobox').append('<div id="score">Score: 0</div>');
	$('div#infobox').append('<div id="level">Level: 1</div>');
	$('div#infobox').append('<div id="message"></div>');
}

function set_up_keys() //Uses the jquery.hotkeys plugin
{
	$(document).bind('keydown','up',function(evt){
		current_piece.rotate();
		return false;
	});
	$(document).bind('keydown','down',function(evt){
		current_piece.move_down();
		return false;
	});
	$(document).bind('keydown','right',function(evt){
		current_piece.move_right();
		return false;
	});
	$(document).bind('keydown','left',function(evt){
		current_piece.move_left();
		return false;
	});
	$(document).bind('keydown','pause',function(evt){
		pause();
		return false;
	});
	
}

function start_game() //Let's get this party started!
{
	$('div#message').html(''); //Clear any messages

	erase_board(); //Cleanup the board
	
	is_playing = true; //Game is go!
	
	buffer_piece = random_piece(); //push the buffer
	current_piece = random_piece(); //push the piece
	current_piece.draw(); //Draw the piece
	buffer_preview(); //Draw the preview
	
	interval_id = setInterval('game_loop()',speed); //setup the main game loop to loop over the speed
	
}

function pause() //Press 'pause' on your keyboard to trigger. This stops the game, by pausing the game.
{
	if(is_paused)
	{
		interval_id = setInterval('game_loop()',speed); //restart the loop
		$('div#message').html('');
		is_paused = false;
	}
	else
	{
		$('div#message').html('Paused! Press [pause] to resume.');
		clearInterval(interval_id); //stop the loop
		is_paused = true;
	}
}

function new_piece() //Sets the piece, bumps the buffer_piece to current_piece, and refills the buffer_piece
{
	current_piece.set();	//Removes the 'active' tag, for the benefit of the check_square() command
	current_piece = buffer_piece; //pop the buffer piece
	buffer_piece = random_piece(); //and push the new one
	current_piece.check(); //Does the new piece fit?
	current_piece.draw(); //Draw the new piece on the board
	buffer_preview(); //and draw the preview
}

function random_piece() //Gives out random Piece Objects set at starting coordinates 4,0
{
	switch (Math.floor(Math.random()*7))
	{
		case 0:
			return new Piece_O(4,0);
		case 1:
			 return new Piece_I(4,0);
		case 2:
			return new Piece_J(4,0);
		case 3:
			return new Piece_L(4,0);
		case 4:
			return new Piece_Z(4,0);
		case 5:
			return new Piece_S(4,0);
		case 6:
			return new Piece_T(4,0);
		default:
			alert("The universe is ending");
	}
}

function game_loop() //Move the block down, check to see if a row is cleared.
{
	if(!is_playing || is_paused) //should never be accessed under these conditiosns, but just in case.
		return false;

	check_rows(); //See if we have any full rows
	current_piece.move_down();//Move second to give pieces time to set.
}

function buffer_preview()
{
	$('div[id*=preview]').removeClass();

	for(var i = 0; i < buffer_piece.tiles.length; i++)
	{
		var x = 1 + buffer_piece.tiles[i].x - buffer_piece.x; //All the tiles are offset from the start by one, so the rotational axis is towards the middle. We must correct for this.
		var y = buffer_piece.tiles[i].y - buffer_piece.y; //No offset for y axis.
		
		$('div#previewr'+y+'c'+x).addClass(buffer_piece.color);
		
	}
}

function game_over() //Kill the game, then display the score and error message.
{
	clearInterval(interval_id);
	is_playing = false; //Stop the game
	
	$('div#message').html('You Lost!<br />').append('<input type="button" onclick="start_game()" value="Play Again!" />');
}
function erase_board() //Iterate over the entire board, destroying all tiles mercilessly.
{
	$('div[id*=r]').removeClass();
}

function check_square(x,y) //Checks to see if a square is okay to move to (for piece moving) or if it has been filled (for row clearing)
{
//contains square and is active: okay
//contains square and is inactive: bad
//contanins no square: okay.
	
	if( x > width-1 || y > height-1  || x < 0)
		return false;
	
	if ($('div#r'+y+'c'+x).hasClass('active'))
		return true;
	if ($('div#r'+y+'c'+x).attr('class'))
		return false;//Want to return actual true/false
	return true;
	
}

function check_rows() //Iterate through the board, checking for a full row to clear. Moves down rows to fill the positions.
{
	var moving_down = 0; //For each row we clear, we need to move all the rows above it down one more row. This counts these, and eventually adds them to the score.
	for(var i = height-1; i > 0; i--)
	{
			var is_full = true;
			for (var j = 0; j < width; j++)
			{
				if(check_square(j,i))
				{
					is_full = false;
				}
				if(moving_down && !$('div#r'+i+'c'+j).hasClass('active') && !$('div#r'+(i+moving_down)+'c'+j).hasClass('active')) //You can never already have a row cleared at the bottom, so we don't need to worry about being out of bounds.
				{
					$('div#r'+(i+moving_down)+'c'+j).attr('class',$('div#r'+i+'c'+j).attr('class'));					
				}
			}
			if(is_full)
			{
				moving_down++;
			}
	}
	
	score += moving_down; //The number of rows cleared is added to the score
	update_score();
}

function update_score() //Updates the score and level displays, as well as upping the level and respective speed.
{
	$('div#score').html('Score: '+score); //Refresh the score ticker.
	if(level != Math.floor(score/10)+1) //A new level every 10 points, meaning divide by ten w/ integer divison. We start at one, so at 10 we will be at level 2, etc.
	{
		level++;
		speed = Math.floor(speed*(4/5)) //My algorithim for speed increase: multiply by 4/5. Adujst to your liking.
	}
	$('div#level').html('Level:  '+level);
}