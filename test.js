require('jnode/setup.js');

var channel=require('./index.js');
 
channel.triggers[0].when({path:'/home/pi/anne.ics', interval:15}, function(events){
    $.each(events, function(i,event){
        console.log(event);
    });
});