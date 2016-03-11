//Exosite CSV Data Export Example Widget
//Version 2.0
// Version 1 developed by Andres Solz
// Upgrades to remove deprecated functions of moment.js, handle timezone issues, and other changes by Michelle Funk
// Version 2, changing call to array of promises with 1 call per 200 seconds to eliminate Widget API data cap issues, by Michelle Funk

function main(container, portal) {

    selects = "<div id='selects'><span>Device: </span><select id='deviceSelect'></select><br><span> Dataport: </span><select id='dataportSelect'></select><br><input class='inputs' id='startTime' placeholder='Start: (YYYY-MM-DD)' type='text'><input class='inputs' id='endTime'  placeholder='YYYY-MM-DD' type='text'><button id='loadData'>Load</button><a class='exportcsv' href='#' id='exportCSV'>Export CSV</a></div>";
    dataTable = "<table id='dataTable'><thead>\
                    <th id='timestamp'>Time</th>\
                    <th>Data</th>\
                </thead>\
                <tbody id='dataBody'>\
                </tbody></table>\
                <p id='loadingData'></p>";

    html = "<div style='padding:10px 10px'>"+selects+dataTable+"</div>";
    $(container).html(html);
    $("#deviceSelect").bind("click", deviceChange);

    $('#dataTable').css({
        'border-collapse':'collapse',
        //'margin-left':'auto',
        //'margin-right':'auto',
        'margin-top':'25px',
        'width': '100%',
        'font-size': 'smaller',
        'line-height': '1.3em'
    });
    $('.exportcsv').css({
        'float':'right'
    });
    $('.inputs').css({
        'margin-left':'3px',
        'margin-right':'3px'
    });

    $("#loadData").click(function() {
        console.log("Loading data");
        $("#dataBody").children().remove();

        deviceAlias = $("#deviceSelect").find(":selected").attr("alias");
        dataportAlias = $("#dataportSelect").find(":selected").attr("alias");
        console.log("deviceAlias, dataportAlias: ", deviceAlias, dataportAlias);

        console.log("Trying to read from ", deviceAlias, dataportAlias);
        // console.log("devices[deviceAlias].timezone");

        var startTime = $("#startTime").val();
        startTime = startTime ? startTime + " +0000" : new Date("2015-11-11");
        startTime = moment(startTime).unix();

        var endTime = $("#endTime").val();
        endTime = endTime ? endTime+ " +0000" : moment.utc();
        endTime = moment(endTime).add(1,"day").unix();

        var secs_diff = endTime-startTime;

        if (isNaN(startTime) || isNaN(endTime)) {
          alert("Please enter start and/or end times in format YYYY-MM-DD.");
        } else if (endTime < startTime) {
          alert("Please enter an end time that is before the start time.")
        }

        $("#timestamp").text("Time - "+devices[deviceAlias].timezone);
        var timezone = devices[deviceAlias].timezone;

        console.log("Starting at ", startTime, " and ending at ", endTime, " with difference of ", secs_diff);

        //find number of calls and set to initial value for iterator argument
        var numIterations = (secs_diff/200) + 1;
        console.log("numIterations: " + numIterations);

        $('#loadingData').show().text("Creating Data Request ...");
        promiseArray = makePromises(deviceAlias, dataportAlias, numIterations, startTime);
        console.log("promiseArray after makePromises: ", promiseArray);

        $('#loadingData').show().text("Loading Data ...");
        keepPromises(startTime, promiseArray, endTime);
      });

      function makePromises(deviceAlias, dataportAlias, numIterations, startTime) {
        console.log("Making promises...");

        var tempArray = [];
        for (var k=0; k<numIterations; k++) {
          if (k != 0) {
            //Advance both call start and end by 200 seconds if not the first call
            newCallStart += 200;
            newCallEnd += 200;
          } else {
            //If first call, set up start time and end time to be the set start + 0 - 199
            newCallStart = startTime;
            newCallEnd = newCallStart + 199;
          }

          tempArray[k]  = new Promise(function(resolve, reject) {
            console.log("creating promise: ", newCallStart, " to ",  newCallEnd);
            read([deviceAlias, dataportAlias], {"starttime":newCallStart, "endtime":newCallEnd, "limit":200, "sort":"desc"}).done(function() {
                $('#loadingData').toggle();
                resolve(arguments);
            });
          });
        }
        return tempArray;
      }

      function keepPromises(callStartTime, promiseArray, endTime) {
        Promise.all(promiseArray).then(function(result) {
          $('#loadingData').text("Printing results...").show();
          console.log("result of Promise.all: ", result);
          var resultLength = result.length;
          console.log("resultLength: ", resultLength);
          for (var j=0; j < resultLength; j++) {
            $('#loadingData').text("Preparing Table ...");
            $.map(result[j], function(point, index) {
              stamp = point[0];
              dat = point[1];
              //console.log(stamp, dat);
              console.log("stamp vs. endtime: ", stamp, endTime);
              if (stamp > endTime) {
                console.log("Stamp > endTime, skipping");
              } else {
                $("#dataBody").append("<tr><td class='timestamp'>"+moment(stamp*1000).tz(timezone).format('YYYY-MM-DD HH:mm:ss')+"</td><td class='datapoint'>"+dat+"</td></tr>");
              }
            });
          }
          $('#loadingData').hide();
          applyStyle();
        });
      }

      function applyStyle() {
        $('#timestamp').css({
          'text-align':'center',
          'padding':'3px 40px;'
        });

        $("#dataTable tr").css({
            'width':'100%'
        });

        $("#dataTable td").css({
          'border':'1px gray solid'
          });

            $('.datapoint').css({
                'text-align':'right',
                'width':'50%',
                'padding-right':'3px'
            });

            $('.timestamp').css({
                'width':'50%',
                'text-align':'center'
            });

        }


        // This function's source was used from http://jsfiddle.net/terryyounghk/KPEGU/
        // The StackOverflow question: http://stackoverflow.com/questions/16078544/export-to-csv-using-jquery-and-html
        $("#exportCSV").click(function() {
            var $rows = $("#dataBody").find('tr:has(td),tr:has(th)'),
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                tmpColDelim = String.fromCharCode(11), // vertical tab character
                tmpRowDelim = String.fromCharCode(0), // null character

            colDelim = '","',
            rowDelim = '"\r\n"';

            console.log($rows);

           var csv = '"' + $rows.map(function (i, row) {
                var $cols = $(row).find('td,th');

                return $cols.map(function (j, col) {
                    var text = $(col).text();
                    return text.replace(/"/g, '""'); // escape double quotes
                }).get().join(tmpColDelim);
            }).get().join(tmpRowDelim)
                .split(tmpRowDelim).join(rowDelim)
                .split(tmpColDelim).join(colDelim) + '"',

            // Data URI
            csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

            $(this).attr({
                    'download': "export.csv",
                    'href': csvData,
                    'target': '_blank'
            });
        });

    function deviceChange(e) {
        console.log("Selected device: ", $("#deviceSelect").find(":selected").attr("value"));
        alias = $("#deviceSelect").find(":selected").attr("alias");
        device = devices[alias].device;
        dps = device.dataports;

        $.map(dps, function(dataport, index) {
            $("#dataportSelect").append("<option alias='"+dataport.alias+"'>"+dataport.info.description.name+"</option>");
        });
    }

    devices = {};
    function start() {
        DEVICE_MODEL = undefined;

        var clients = $.makeArray(portal.clients);

        $.map(clients, function(device,index) {
            try {
                meta = JSON.parse(device.info.description.meta);
            } catch(e) {
                console.log("Invalid meta for "+device.alias+"!");
                meta = {};
            }
            if(meta.device.model == DEVICE_MODEL || typeof DEVICE_MODEL === "undefined") {
                console.log("meta:", meta);
                console.log("meta.timezone:", meta.timezone);

                timezone = meta.timezone ? meta.timezone : "Europe/London";
                console.log("timezone:", timezone);
                name = device.info.description.name;
                alias = device.alias;
                devices[alias] = {timezone:timezone, alias:alias, name:name, device:device};
                $("#deviceSelect").append("<option alias='"+alias+"'>"+name+"</option>");
            }
        });

        deviceChange();
    }

    jQuery.when(
        jQuery.getScript( '//code.jquery.com/ui/1.8.24/jquery-ui.js' )
        ).done(function(){
        jQuery.when(
            jQuery.getScript( '//cdnjs.cloudflare.com/ajax/libs/moment.js/2.9.0/moment.min.js' )
            ).done(function(){
                jQuery.getScript( 'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.4.1/moment-timezone-with-data.js' )
            jQuery.when(
                ).done(function(){
                    start();
            });
        });
    });
}
