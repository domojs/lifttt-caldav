var ical=require('icalendar');
var debug=require('debug')('ifttt:caldav');

module.exports={name:"caldav", "triggers":[
	{
		name:'event',
		fields:[
			{ name:'path', displayName:'Path'},
			{ name:'interval', displayName:'Upcoming in the next n days' }
		],
		when:function(fields, callback)
		{
		    var processCalendar=function ()
            {
                debug('processing');
                $('fs').readFile(fields.path, {encoding: 'utf-8'}, function(error, content){
                    if(error)
                    {
                        console.error(error);
                        callback(500, error);
                        return;
                    }
                    try{
                        var invite = ical.parse_calendar(content);

                    }
                    catch(e){
                        console.error(error);
                        callback(500, error);
                        return;
                    }
                    var now=new Date();
                    var inOneYear=Number(new Date())+fields.interval*24*3600000;
                    var result=invite.events();
                    result=$.grep(result, function(event){
                        
                        return event.inTimeRange(now, inOneYear);
                    });
                    debug('found '+result.length+' upcoming events');
                    result=$.each(result, function(i, event)
                    {
                        debug(event.properties.SUMMARY[0].value);
                        if(event.properties.RRULE)
                        {
                            var start=event.rrule().next(now);
                            var duration;
                            if(event.properties.DTEND)
                                duration=event.properties.DTEND[0].value-event.properties.DTSTART[0].value;
                            else
                                duration=event.properties.DURATION[0].value;
                            var end=new Date(start.valueOf()+duration);
    
                            callback({
                                id:event.properties.UID[0].value,
                                title:event.properties.SUMMARY[0].value,
                                start:start.toISOString(),
                                end:end.toISOString(),
                            });
                        }
                        else
                            callback({
                                id:event.properties.UID[0].value,
                                title:event.properties.SUMMARY[0].value,
                                start:event.properties.DTSTART[0].value.toISOString(),
                                end:event.properties.DTEND[0].value.toISOString(),
                            });
                    });
                });
            };
            $('fs').watchFile(fields.path, processCalendar);
            processCalendar();
		}
	}
], "actions":[]}