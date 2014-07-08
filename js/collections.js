var dummy = [
	{'track':'track1', 'artist':'artist1', 'position': 1},
	{'track':'track2', 'artist':'artist2', 'position': 2},
	{'track':'track3', 'artist':'artist3', 'position': 3},
	{'track':'track4', 'artist':'artist4', 'position': 4},
	{'track':'track5', 'artist':'artist5', 'position': 5},
	{'track':'track6', 'artist':'artist6', 'position': 6},
	{'track':'track7', 'artist':'artist7', 'position': 7},
	{'track':'track8', 'artist':'artist8', 'position': 8},
	{'track':'track9', 'artist':'artist9', 'position': 9},
	{'track':'track10', 'artist':'artist10', 'position': 10},
	{'track':'track11', 'artist':'artist11', 'position': 11},
	{'track':'track12', 'artist':'artist12', 'position': 12}			
];

var TrackModel = Backbone.Model.extend({
	defaults:{
		'track': '',
		'artist': ''
	}
});

var TrackCollection = Backbone.Collection.extend({
	model: TrackModel
});

var currentDeck = new TrackCollection(dummy);

var AppView = Backbone.View.extend({
	el: '.appWrapper',
	events:{

	},
	initialize: function(){
		this.render();
		
	},
	render:function(){
		var that = this;

		
		currentDeck.forEach(function(track){
			var trackView = new TrackView({model:track});

			that.$el.append(trackView.render());
		});
	}

});

var TrackView = Backbone.View.extend({
	className: 'indivWrap',
	attributes: function(){
		return {
			'data-position': this.model.get('position')
		};
	},
	template: _.template($('#temp_track').html()),
	events:{
		'click a.upVote':'upVoteMe',
		'click a.downVote':'downVoteMe'
	},
	initialize: function(){
		console.log(this.model.get('position'))
		// _.bindAll(this, 'render');
		// this.render();
		currentDeck.on('change:position', this.render, this);
	},
	render: function(){
		
		return this.$el.html(this.template(this.model.toJSON()));
	},
	upVoteMe: function(e){
		// identify element/view ''above'' this one and flip them
		var myIndex = this.model.collection.indexOf(this.model);
		var prevModel = this.model.collection.at(myIndex - 1);

		if(prevModel){
			var thisPosition = this.model.get('position');
			var prevPosition = prevModel.get('position');
			var clonePosition = prevModel.get('position');

			prevModel.set('position', thisPosition);
			this.model.set('position', clonePosition);

		}
		

		
	},
	downVoteMe: function(e){
		// identify element/view ''above'' this one and flip them
		var myIndex = this.model.collection.indexOf(this.model);
		var nextModel = this.model.collection.at(myIndex + 1);
		
		if(nextModel){	
			var thisPosition = this.model.get('position');
			var nextPosition = nextModel.get('position');

			this.model.set('position', nextPosition);
			nextModel.set('position', thisPosition);
		}

	}	
});


$(document).ready(function(){
	var run = new AppView();
});