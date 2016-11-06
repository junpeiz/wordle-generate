function MyWordCloud(params)
{
	this.words = params.words;
	this.canvas = params.canvas;	
	this.colorSet = ["#f7acbc", "#f47920", "#2a5caa", "#1b315e", "#840228", "#ef4136", "#1d953f", "#33a3dc"];
	this.font = params.font;
	this.background = "#ffffff";
}

var fontSizePara = 6.0;
var textWidthIncre = 10.0;

MyWordCloud.prototype = 
{
	run: function()
	{
		var words = this.words;
		var canvas = this.canvas;
		var ctx = this.ctx = canvas.getContext("2d");

		ctx.fillStyle = this.background;
		// fillRect to sue fillStyle to fill the rectangle specified
		ctx.fillRect(0, 0, canvas.height, canvas.width);

		for( var i = 0; i < words.length; i++)
		{
			var thisWord = words[i];
			thisWord.fontSize = Math.floor( thisWord.weight * fontSizePara ) ;
			ctx.font = thisWord.fontSize + "px " + this.font;
			thisWord.textWidth = Math.floor( ctx.measureText(thisWord.word).width ) + textWidthIncre;
			this.words.area = thisWord.textWidth * thisWord.fontSize;
		}

		words.sort( function(a, b){ return a.area > b.area ? 1 : -1 } );

		var top = 0;
		var bottom = 0;
		var left = 0;
		var right = 0;
		var maxBound = 0;

		for( var i = 0; i < words.length; i++)
		{
			var thisWord = words[i];
			// random color
			thisWord.color = this.colorSet[Math.floor( Math.random() * this.colorSet.length )];
			thisWord.position = {};
			thisWord.position.x = Math.floor( canvas.width / 2 );
			thisWord.position.y = Math.floor( canvas.height / 2 );
			thisWord.direction = 0;

			var deltaT = Math.PI / 360 * 5;
			var deltaR = 4;
			var tryMax = 4000;
			
			if( thisWord.direction == 1 )
			{
				thisWord.position.x = Math.floor( canvas.width / 2 );
				thisWord.position.y = Math.floor( canvas.height / 2 );
				deltaT = Math.PI / 360 * 3;
				deltaR = 3;
				tryMax = 6000;
			}

			var r, t, x, y;
			r = t = x = y = 0;

			var tryCnt = 0;
			while( ++tryCnt < tryMax )
			{
				console.log("try: " + tryCnt);

				// region
				thisWord.region = {};
				if( thisWord.direction == 0 )
				{
					thisWord.region.x1 = thisWord.position.x + x;
					thisWord.region.y1 = thisWord.position.y + y - thisWord.fontSize;
					thisWord.region.a = thisWord.textWidth;
					thisWord.region.b = thisWord.fontSize;
				}
				else
				{
					thisWord.region.y1 = thisWord.position.x + x;
					thisWord.region.x1 = canvas.width - ( thisWord.position.y + y );
					thisWord.region.a = thisWord.fontSize;
					thisWord.region.b = thisWord.textWidth;
				}
				thisWord.region.x2 = thisWord.region.x1 + thisWord.region.a;
				thisWord.region.y2 = thisWord.region.y1 + thisWord.region.b;	

				// check overlap
				var isOverlap = false;

				for( var j = 0; j < i; j++ )
				{
					if( !( thisWord.region.x2 < words[j].region.x1 || 
						words[j].region.x2 < thisWord.region.x1 || 
						 thisWord.region.y2 < words[j].region.y1 || 
						words[j].region.y2 < thisWord.region.y1) )
					{
						isOverlap = true;
						console.log("overlap");
						break;
					}
				}

				// check out of bound
				var isOut = false;
				if( thisWord.region.x1 < 0 || thisWord.region.y1 < 0 ||
					thisWord.region.x2 < 0 || thisWord.region.y2 < 0 ||
					thisWord.region.x1 > canvas.width || thisWord.region.y1 > canvas.height ||
					thisWord.region.x2 > canvas.width || thisWord.region.y2 > canvas.height )
				{
					isOut = true;
					x = y = 0;
				}

				if( isOverlap == false && isOut == false )
				{
					console.log("---" + thisWord.word);
					console.log("---x1: " + thisWord.region.x1);
					console.log("---y1: " + thisWord.region.y1);
					console.log("---x2: " + thisWord.region.x2);
					console.log("---y2: " + thisWord.region.y2);				
					console.log("success");
					break;
				}
				
				t += deltaT;
				r = deltaR * t;
				x = Math.floor( r * Math.cos( t ) );
				y = Math.floor( r * Math.sin( t ) );
				console.log("x=" + x + ", y=" + y);

				tryCnt++;
			}
			
			thisWord.position.x = thisWord.position.x + x;
			thisWord.position.y = thisWord.position.y + y;

			if( canvas.width / 2 - thisWord.region.x1 > left )
				left = canvas.width / 2 - thisWord.region.x1;
			if( canvas.height / 2 - thisWord.region.y1 > top )
				top =canvas.height / 2 - thisWord.region.y1;
			if( thisWord.region.x2 - canvas.width / 2  > right )
				right = thisWord.region.x2 - canvas.width / 2;
			if( thisWord.region.y2 - canvas.height / 2 > bottom )
				bottom = thisWord.region.y2 - canvas.height / 2;

			if( left > maxBound ) maxBound = left;
			if( right > maxBound ) maxBound = right;
			if( top > maxBound ) maxBound = top;
			if( bottom > maxBound ) maxBound = bottom;
		}
					
		if( canvas.height == canvas.width )
		{
			var xRatio = canvas.height / (bottom + top);
			var yRatio = canvas.width / (right + left);
			var minRatio = ( xRatio < yRatio ) ? xRatio : yRatio;
			minRatio *= 0.95;
			//minRatio = 1.5;
			var xMove, yMove;
			xMove = ( -canvas.width / 2 + left ) + 5;
			yMove = ( -canvas.height / 2 + top ) + 5;
			ctx.scale(minRatio, minRatio);
			ctx.translate( xMove, yMove );				
		}

		for( var i = 0; i < words.length; i++)
		{
			var thisWord = words[i];
			
			if( thisWord.direction == 1 )
			{
				ctx.save(); 
				ctx.translate(canvas.width / 2, canvas.height / 2);
				ctx.rotate(Math.PI / 2);	
				ctx.translate(-canvas.height / 2, -canvas.width / 2);
			}

			ctx.fillStyle = thisWord.color;
			ctx.font = thisWord.fontSize + "px " + this.font;

			//ctx.fillText(thisWord.word, thisWord.position.x, thisWord.position.y);
			ctx.fillText(thisWord.word, thisWord.position.x, thisWord.position.y);
			if( thisWord.direction == 1 )
				ctx.restore(); 
		}
	}
}