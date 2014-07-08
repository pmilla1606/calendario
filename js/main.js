var AppointmentModel = Backbone.Model.extend({
	//url: 'http://later.com',
	defaults:{
		dateDay: '',
		dateMonth: '',
		dateYear: '',
		display_year: '',
		display_month: '',
		display_day: '',
		time_start: '',
		time_display: '',
		service: '',
		client_name: '',
		client_phone: '',
		client_email: '',
		client_comments: '',
		admin_comments: '',
		app_id: '',
	}
});

Date.prototype.addDays = function(days) {
    this.setDate(this.getDate() + days);
    return this;
};

Date.prototype.subDays = function(days) {
    this.setDate(this.getDate() - days);
    return this;
};
var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var monthNamesShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var	dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var dayNamesShort = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

var InfoView = Backbone.View.extend({
	el: '#name',
	events:{
		'click .appProceed': 'datesView'
	},
	initialize: function(){
		this.datesView();
	},
	render: function(){

	},
	datesView: function(){
		var client_name = $('#client_name').val();
		var client_phone = $('#client_phone').val();
		var client_email = $('#client_email').val();
		var service_type = $('#service_type').val();
		
		appointment.set({
			service: service_type,
			client_name: client_name,
			client_phone: client_phone,
			client_email: client_email
		});		
		
		
		
			var cals = new CalendarView();	
		
		
	}
	
});

var CalendarView = Backbone.View.extend({
	el: '#calendar',
	events: {
		'click .dayCell':'newEntry',
		'click .prevMonth' :'prevMonth',
		'click .nextMonth' :'nextMonth',
		'keyup #client_name':'typeFunction',
		'change #service_type':'serviceFunction'
	},
	serviceFunction:function(e){
		var serviceType = $(e.target).val();
		appointment.set({'service':serviceType})
	},
	typeFunction:function(e){
		
		var clientName = $(e.target).val();
		appointment.set({'client_name':clientName})
	},
	initialize: function(){
		//var steps = new StepsView({model:appointment});

		
		var today = moment();
		var todayDay = today.format('D');
		var todayMonth = today.format('M');
		var todayYear = today.format('YYYY');

		appointment.set({
			'dateMonth' : Number(todayMonth-1),
			'dateYear' : Number(todayYear),
			'dateDay' : Number(todayDay),
			'display_day': today.format('dddd'),
			'display_month': today.format('MMMM'),
			'display_year': Number(todayYear),
			'display_date':Number(todayDay)
		});
		

		this.renderCalendar();
		appointment.on('change:dateMonth', this.renderCalendar, this);

	},
	// let today be a moment.js object!
	renderCalendar: function(){
		var that = this;
		
		var today = moment({
			'YYYY': appointment.get('dateYear'),
			'M': Number(appointment.get('dateMonth')	),
			'D': appointment.get('dateDay')
		});
		var thisYear = Number(today.format('YYYY'));
		var thisMonth = Number(today.format('M')-1);
		var thisDay = Number(today.format('D'));
		var daysInThisMonth = today.daysInMonth();
		var firstOfMonth = moment({
			'YYYY': thisYear,
			'M': thisMonth,
			'D':1
		});
		var thisDayOfWeek = firstOfMonth.days();
		var dayCellTemplate = _.template($('#temp_active_days').html());
		var todayDisplay = moment().format('D');


		console.log(firstOfMonth);
		

		that.$el.html('');

		

		

		that.$el.prepend('<span class="prevMonth">Prev Month</span><span class="nextMonth">Next Month</span>')
		for(i=0; i<dayNames.length; i++){
			that.$el.append('<div class="day-header" data-dayHeader="'+i+'">'+dayNames[i]+'</div>');
		}
		for (i=0; i<thisDayOfWeek; i++){
			that.$el.append('<div class="dayCell blank"></div>');
		}
		for (i=0; i<daysInThisMonth; i++){
			
			that.$el.append(dayCellTemplate({
				'day_number': (i+1)
			}));
			//that.$el.append('<div class="dayCell" data-day="'+i+'"><span class="day">'+i+'</span>');	
		}
		that.$el.append('<div class="cf"></div>');

		that.$el.fadeIn('fast');

		
		
		
	},
	nextMonth:function(){
		
		var modelMonth = Number(appointment.get('dateMonth')+1);
		
		appointment.set({
			'dateMonth' : Number(modelMonth),
		});
	
	},
	prevMonth:function(){
		var modelMonth = Number(appointment.get('dateMonth')-1);
		
		appointment.set({
			'dateMonth' : Number(modelMonth),
		});

	},
	newEntry: function(e){
		var that = this;
		var target = $(e.target);
		var selectedDay = $(e.target).data('day');
		
		if($(e.target).hasClass('blank')){
			return false;
		}
		else{
			$(e.target).addClass('selected').siblings().removeClass('selected');
		
			appointment.set({'dateDay': Number(selectedDay)});
			
			// store display dates in model
			var day = appointment.get('dateDay');
			var month = appointment.get('dateMonth');
			var year = appointment.get('dateYear');

			var displayToday = moment({
				'YYYY': year,
				'M': month,
				'D': day
			});
			

			var confirm = new DetailsView({model:appointment});
			that.$el.fadeOut('fast');
		}
	}

});

var DetailsView = Backbone.View.extend({
	el: '#details',
	events:{
		'click .closeMe':'closeView',
		'click .bookNowBtn': 'selectTime'
	},
	template: _.template($('#temp_time_select').html()),
	initialize: function(){
		
		var displayDay = moment().set('D', Number(appointment.get('dateDay')));
		var displayMonth = moment().set('M', Number(appointment.get('dateMonth')));
		var displayMonth = moment().set('YYYY', Number(appointment.get('dateYear')));

		


		appointment.set({
			'display_day': displayDay.format('dddd'),
			'display_month': displayMonth.format('MMMM'),
			'display_year': appointment.get('dateYear'),
			'display_date':appointment.get('dateDay')
		});
		appointment.on('change', this.render, this)
		this.render();
	},
	render: function(){
		
		this.$el.fadeIn('fast').html(this.template(this.model.toJSON()));

		
		
		this.fetchAvail();
	},
	fetchAvail:function(){
		var buttonTemplate = _.template($('#temp_available_time_button').html());
		
		// here we add ajax call to DB to get times for this day
		// something like:
		// var selectedDay = this.model.get('dateDay');
		// $.ajax -> DB query where SQL: DAY == selectedDay
		// for now let's provide dummy data:
		// this display/data shit needs to be sorted out in a smarter way

		// MUCH SMARTER FROM IVETA: Get a blob of json on calendar render. Then ref that for the dates. fetch json on each cal render
		var ajaxResponseData = [800, 900, 1200, 1300, 1400, 1500,];
		var ajaxResponseDisplay = ['8:00am', '9:00am', '12:00pm', '1:00pm', '2:00pm', '3:00pm'];

		
		for (i=0; i<ajaxResponseData.length; i++){
			this.$el.find('.availableTimesWrap').append(buttonTemplate({
				'time_slot': ajaxResponseData[i],
				'time_slot_display': ajaxResponseDisplay[i]
			}));
		}


	},
	selectTime:function(e){
		
		$.fn.animateRotate = function(angle, duration, easing, complete) {
		    return this.each(function() {
		        var $elem = $(this);

		        $({deg: 0}).animate({deg: angle}, {
		            duration: duration,
		            easing: easing,
		            step: function(now) {
		                $elem.css({
		                    transform: 'rotate(' + now + 'deg)'
		                });
		            },
		            complete: complete || $.noop
		        });
		    });
		};
		
		var clickedTime = $(e.target);

		appointment.set({
			'time_start':e.target.attributes[2].value,
			'time_display':e.target.innerText
		});
		
		this.$el.find('#hour').animateRotate(appointment.get('time_start'), 1000);
		this.$el.find('#minute').animateRotate(270, 1250);
		
		this.serviceType();
	},
	serviceType:function(){
		var serviceTemplate = _.template($('#temp_service_type').html());
		appointment.set({'service': 'sample service'});
		this.$el.find('.availableTimesWrap').fadeIn('fast').html(serviceTemplate(this.model.toJSON()));
	},
	closeView:function(e){
		e.preventDefault();
		appointment.set({
			'time_display':'',
			'service': ''
		});
		this.$el.fadeOut('fast');
		this.undelegateEvents();
	    this.$el.removeData().unbind(); 
		var cals = new CalendarView(); 
	}
})

var StepsView = Backbone.View.extend({
	el: '#steps',
	template: _.template( $('#temp_steps').html()),
	initialize: function(){
		
		appointment.on('change:dateDay', this.render, this);
		
	},
	render: function(){


		this.$el.html(this.template(this.model.toJSON()));
	}
});

var App = Backbone.View.extend({
	initialize: function(){
		this.render();
	},
	render: function(){
		var calendarInstance = new InfoView();
	}
});



$(document).ready(function(){
	$('#start_booking').on('click', function(){
		$('#booking-engine').fadeIn('fast');
		$('body').addClass('stop-scrolling');
	});
	$('#close_booking').on('click', function(){
		$('#booking-engine').fadeOut('fast');
		$('body').removeClass('stop-scrolling');
	});
	appointment = new AppointmentModel();
	app = new App();
	
	

});
