var AppointmentModel = Backbone.Model.extend({
	//url: 'http://later.com',
	defaults:{
		dateDay: '',
		dateMonth: '',
		dateYear: '',
		display_year: '',
		display_month: '',
		display_day: '',
		time_start: '8',
		time_display: '8:00am',
		service: '',
		employee: '',
		client_name: '',
		client_phone: '',
		client_email: '',
		client_comments: '',
		admin_comments: '',
		app_id: '',
	}
});

// define calendar information used to build calendar
// this could go in DatesView ?
var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var monthNamesShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var	dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var dayNamesShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// instantiate a new appointment model to be used for this booking
var appointment = new AppointmentModel();


// this is the view for the calendar and dates selection
var DatesView = Backbone.View.extend({
	el: '#dates',
	events: {
		'click .dayCell': 'setDate',
		'click .nextMonth': 'nextMonth',
		'click .prevMonth': 'prevMonth'
	},
	initialize: function(){
		
		// define today
		var today = moment();
		
		// set today in model
		appointment.set({
			'dateDay': Number(today.format('D')),
			'dateMonth': Number(today.format('M')),
			'dateYear':Number(today.format('YYYY'))
		});

		this.render();
		appointment.on('change:dateMonth', this.render, this)
		var summaryBox = new SummaryView({model:appointment});
	},
	render: function(){
		var day = appointment.get('dateDay');
		var month = appointment.get('dateMonth');
		var year = appointment.get('dateYear');
		var daysInThisMonth = moment(year +'-'+month, 'YYYY-M').daysInMonth();
		// 0 based --- sunday = 0 !
		var firstOfMonth = moment(year +'-'+month+'-1', 'YYYY-M-D').days();
		var displayMonth = moment(month, 'M').format('MMMM');

		var blankDay = _.template($('#temp_day_cell_disable').html());
		var activeDay = _.template($('#temp_day_cell_active').html());

		this.$el.html('');
		this.$el.append('<span class="monthTitle"><a href="#" class="prevMonth"><</a>'+displayMonth+'<a href="#" class="nextMonth">></a></span>')
		for (a=0; a<dayNames.length; a++){
			this.$el.append('<div class="dayHeader">'+dayNames[a]+'</div>');
		}
		for (b=0; b<firstOfMonth; b++){
			this.$el.append(blankDay);
		}
		for (c=1; c<=daysInThisMonth; c++){
			this.$el.append(activeDay({'day_number': c}));
		}
		this.$el.append('<div class="cf"></div>');
	},
	setDate: function(e){
		var selectedDay = $(e.target);
		appointment.set({
			'dateDay':selectedDay.data('day')
		});
		selectedDay.addClass('selected').siblings('.dayCell').removeClass('selected');
		this.$el.hide();
		var hours = new PeopleView({model:appointment});
		
	},
	nextMonth: function(){
		var nextMonth = Number(appointment.get('dateMonth')+1);
		appointment.set({'dateMonth':nextMonth});

	},
	prevMonth:function(){
		var prevMonth = Number(appointment.get('dateMonth')-1);
		appointment.set({'dateMonth':prevMonth});
	}

});

var PeopleView = Backbone.View.extend({
	el: '#people',
	events: {
		'click .person': 'selectPerson'
	},
	initialize: function(){
		this.render();
	},
	render: function(){
		this.$el.show().addClass('animated fadeInLeft');
	},
	selectPerson: function(e){
		var theChosenOne = $(e.target).data('name');
		appointment.set({'employee': theChosenOne});
		this.$el.hide();
		var hour = new HoursView({model:appointment});
	}
});

// this i sthe view for selection available times
// in here will be ajax calls to find availablitiy etc 
var HoursView = Backbone.View.extend({
	el:'#hours',
	events:{
		'click .hoursButton':'selectHour'
	},
	initialize:function(){
		// here we make ajax calls to DB to fetch availablitiy for the selected day
		// it should go something like this:
		//php/sql: return all rows where dayId == thisDay && available == true
		//--> returns json = [800, 1000, 1300, 1700];
		// in JS we define a standard work day (8:00pm to 5:00pm = 8 hours = 8 appointments for example)
		

		// render all time slots for a blank business day
		this.render();
		

	},
	render:function(){
		this.$el.show().addClass('animated fadeInLeft');
		var maxAppointments = 7;
		var dummyJson = [800, 1000, 1300, 1700];

		for (i=0; i<dummyJson.length; i++){
			this.$el.append('<a href="#" data-hour="'+dummyJson[i]+'" class="hoursButton">'+dummyJson[i]+'</a>');
		}



	},
	selectHour:function(e){
		var selectedHour = $(e.target).data('hour');
		appointment.set({'time_start':selectedHour});
		this.$el.hide();
		var service = new ServiceView({model:appointment});
	}
});

// this is the view to select a specific service type
var ServiceView = Backbone.View.extend({

});

// last view in the booking flow - registration
// this will house forms for the client to enter their information
var RegisterView = Backbone.View.extend({

});

// 'summary box' which will remain along the left hand side and be upated as the user goes through the process
var SummaryView = Backbone.View.extend({
	el: '#summary-box',
	events: {
		'click .bookingStepWidget': 'navigate'
	},
	template: _.template($('#temp_summarybox').html()),
	initialize: function(){
		this.render();

		
		appointment.on('change', this.render, this);

		
	},
	render: function(){
		var selectedDay = appointment.get('dateDay');
		var selectedMonth = appointment.get('dateMonth');
		var selectedYear = appointment.get('dateYear');
		var selectedMoment = moment(selectedYear +'-'+selectedMonth+'-'+selectedDay, 'YYYY-M-D')
	
		// weekdays spelled
		var displayDay  = selectedMoment.format('dddd');
		// month names
		var displayMonth = selectedMoment.format('MMMM');

		appointment.set({
			'display_day': displayDay,
			'display_month':displayMonth
		});

		this.$el.html(this.template(this.model.toJSON()));
	},
	navigate: function(e){

	}

});


// init
$(document).ready(function(){
	
	var app = new DatesView();
});